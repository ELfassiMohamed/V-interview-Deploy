"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, Send, Mic, MicOff, Volume2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { apiRequest, clearCurrentInterviewSession, getAuthToken, getCurrentInterviewSession, parseApiError, setLatestInterviewEntryId } from "@/lib/api"

type InterviewQuestion = {
  questionID: number
  questionText: string
  difficulty: string
  order: number
}

type InterviewSession = {
  entryID: number
  questions: InterviewQuestion[]
  jobTitle?: string
  experienceLevel?: string
}

type SubmitAnswersResponse = {
  success: boolean
  resultID: number
  overallScore: number
}

type AnswerPayload = {
  questionID: number
  answerText: string
  timeSpent: number
}

interface Message {
  id: number
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: (event: SpeechRecognitionEvent) => void
  onerror: (event: Event) => void
  onend: () => void
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

export default function InterviewPage() {
  const router = useRouter()
  const [session, setSession] = useState<InterviewSession | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [answers, setAnswers] = useState<AnswerPayload[]>([])
  const [input, setInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const answerStartTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    if (!getAuthToken()) {
      router.replace("/auth")
      return
    }

    const stored = getCurrentInterviewSession<InterviewSession>()
    if (!stored || !stored.questions?.length) {
      router.replace("/dashboard")
      return
    }

    setSession(stored)
    setMessages([
      {
        id: 1,
        role: "assistant",
        content: stored.questions[0].questionText,
        timestamp: new Date(),
      },
    ])
    answerStartTimeRef.current = Date.now()
  }, [router])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
      setIsSupported(!!Recognition)

      if (Recognition) {
        recognitionRef.current = new Recognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = "en-US"

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = ""
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript
            }
          }

          if (finalTranscript) {
            setInput((prev) => `${prev}${finalTranscript}`)
          }
        }

        recognitionRef.current.onerror = () => setIsListening(false)
        recognitionRef.current.onend = () => setIsListening(false)
      }
    }

    return () => {
      recognitionRef.current?.stop()
    }
  }, [])

  const startListening = () => {
    if (!recognitionRef.current || isListening) return
    setIsListening(true)
    recognitionRef.current.start()
  }

  const stopListening = () => {
    if (!recognitionRef.current || !isListening) return
    setIsListening(false)
    recognitionRef.current.stop()
  }

  const speakText = (text: string) => {
    if (!("speechSynthesis" in window)) return
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    speechSynthesis.speak(utterance)
  }

  const submitAllAnswers = async (finalAnswers: AnswerPayload[]) => {
    if (!session) return

    setIsSubmitting(true)
    setError("")

    try {
      const response = await apiRequest<SubmitAnswersResponse>(`/ai/interviews/${session.entryID}/submit-answers/`, {
        method: "POST",
        body: { answers: finalAnswers },
      })

      clearCurrentInterviewSession()
      setLatestInterviewEntryId(session.entryID)
      router.push(`/results?entryId=${session.entryID}&score=${response.overallScore}`)
    } catch (err) {
      setError(parseApiError(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSendMessage = async () => {
    if (!session || !input.trim() || isSubmitting) return

    if (isListening) stopListening()

    const question = session.questions[currentQuestionIndex]
    const timeSpent = Math.max(1, Math.round((Date.now() - answerStartTimeRef.current) / 1000))

    const userMessage: Message = {
      id: messages.length + 1,
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    const nextAnswers = [
      ...answers,
      {
        questionID: question.questionID,
        answerText: input,
        timeSpent,
      },
    ]

    setAnswers(nextAnswers)
    setMessages((prev) => [...prev, userMessage])
    setInput("")

    const nextIndex = currentQuestionIndex + 1
    if (nextIndex < session.questions.length) {
      const nextQuestion = session.questions[nextIndex]
      const aiMessage: Message = {
        id: messages.length + 2,
        role: "assistant",
        content: nextQuestion.questionText,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
      setCurrentQuestionIndex(nextIndex)
      answerStartTimeRef.current = Date.now()
      speakText(nextQuestion.questionText)
      return
    }

    await submitAllAnswers(nextAnswers)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void handleSendMessage()
    }
  }

  if (!session) {
    return <div className="container mx-auto px-4 py-8">Loading interview...</div>
  }

  const totalQuestions = session.questions.length
  const currentQuestion = Math.min(currentQuestionIndex + 1, totalQuestions)

  return (
    <div className="container mx-auto px-4 py-8 relative flex flex-col h-full">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {session.jobTitle || "Interview"}
          </h1>
          <div className="text-sm text-purple-600 bg-white/80 px-3 py-1 rounded-full backdrop-blur-md border border-purple-100 shadow-sm">
            Question {currentQuestion} of {totalQuestions}
          </div>
        </div>

        <div className="mb-6">
          <Progress value={(currentQuestion / totalQuestions) * 100} className="h-3 bg-white/50" />
        </div>

        <Card className="flex-1 flex flex-col overflow-hidden border-purple-200 bg-white/80 backdrop-blur-md shadow-xl min-h-[500px]">
          <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <Avatar className={`h-10 w-10 ${message.role === "user" ? "ml-3" : "mr-3"}`}>
                    <AvatarImage src="/placeholder.svg?height=40&width=40" alt={message.role === "user" ? "User" : "AI Interviewer"} />
                    <AvatarFallback className={message.role === "user" ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white" : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"}>
                      {message.role === "user" ? "U" : "AI"}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`rounded-2xl p-4 shadow-lg ${message.role === "user" ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white" : "bg-white border border-purple-100"}`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className={`text-xs ${message.role === "user" ? "text-white/70" : "text-gray-500"}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                      {message.role === "assistant" ? (
                        <Button variant="ghost" size="sm" onClick={() => speakText(message.content)} className="h-6 w-6 p-0 hover:bg-purple-50 text-purple-600">
                          <Volume2 className="h-3 w-3" />
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>

          <div className="p-6 border-t bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your answer or use voice input..."
                  className="min-h-[80px] resize-none pr-12 border-purple-200 focus:border-purple-400 focus:ring-purple-200 bg-white/80 backdrop-blur-md shadow-sm"
                  disabled={isSubmitting}
                />
                {isSupported ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={`absolute right-2 top-2 h-8 w-8 ${isListening ? "bg-red-100 text-red-600 hover:bg-red-200" : "text-purple-600 hover:bg-purple-100"}`}
                    onClick={isListening ? stopListening : startListening}
                    disabled={isSubmitting}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                ) : null}
              </div>
              <Button onClick={() => void handleSendMessage()} disabled={!input.trim() || isSubmitting} size="icon" className="h-[80px] w-16 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg">
                <Send className="h-6 w-6" />
              </Button>
            </div>
            <div className="mt-3 text-center">
              <Button variant="ghost" size="sm" onClick={() => void handleSendMessage()} disabled={!input.trim() || isSubmitting} className="text-purple-600 hover:text-purple-700 hover:bg-purple-100">
                {currentQuestion < totalQuestions ? "Send and continue to next question" : "Submit answers and see results"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            {error ? <p className="text-xs text-center text-red-600 mt-2">{error}</p> : null}
          </div>
        </Card>
      </div>
    </div>
  )
}
