"use client"

import type React from "react"
import { useState, useEffect, useRef, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, Send, Mic, MicOff, Volume2, Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { submitAnswers, type GeneratedQuestion, type SubmitAnswerItem } from "@/lib/api"

// Speech Recognition types
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

interface Message {
  id: number
  role: "user" | "assistant"
  content: string
  timestamp: Date
  questionId?: number
}

interface CollectedAnswer {
  questionID: number
  answerText: string
  timeSpent: number | null
  startTime: number
}

export default function InterviewPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /></div>}>
      <InterviewPageInner />
    </Suspense>
  )
}

function InterviewPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const entryId = searchParams.get("entryId")

  // Interview data from session storage
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([])
  const [jobTitle, setJobTitle] = useState("Interview")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  // Chat state
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Answer tracking
  const [answers, setAnswers] = useState<CollectedAnswer[]>([])
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now())

  // Speech recognition
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const chatEndRef = useRef<HTMLDivElement | null>(null)

  const totalQuestions = questions.length

  // Load interview data from session storage
  useEffect(() => {
    const stored = sessionStorage.getItem("interview_data")
    if (stored) {
      const data = JSON.parse(stored)
      setQuestions(data.questions)
      setJobTitle(data.jobTitle)

      // Start with the first question as a message
      if (data.questions.length > 0) {
        const firstQ = data.questions[0]
        setMessages([
          {
            id: 1,
            role: "assistant",
            content: `Hello! I'll be conducting your interview today for the ${data.jobTitle} position. Let's begin.\n\nQuestion 1 (${firstQ.difficulty}): ${firstQ.questionText}`,
            timestamp: new Date(),
            questionId: firstQ.questionID,
          },
        ])
        setQuestionStartTime(Date.now())
      }
    } else {
      // No interview data, redirect to dashboard
      router.push("/dashboard")
    }
  }, [router])

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Speech recognition setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      setIsSupported(!!SpeechRecognition)

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = "en-US"

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = ""
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            }
          }
          if (finalTranscript) {
            setInput((prev) => prev + finalTranscript)
          }
        }

        recognitionRef.current.onerror = () => setIsListening(false)
        recognitionRef.current.onend = () => setIsListening(false)
      }
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop()
    }
  }, [])

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      setIsListening(false)
      recognitionRef.current.stop()
    }
  }

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || currentQuestionIndex >= totalQuestions) return

    if (isListening) stopListening()

    const currentQuestion = questions[currentQuestionIndex]
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000)

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      role: "user",
      content: input,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])

    // Save answer
    const newAnswer: CollectedAnswer = {
      questionID: currentQuestion.questionID,
      answerText: input,
      timeSpent,
      startTime: questionStartTime,
    }
    const updatedAnswers = [...answers, newAnswer]
    setAnswers(updatedAnswers)
    setInput("")

    const nextIndex = currentQuestionIndex + 1

    if (nextIndex < totalQuestions) {
      // Show next question
      const nextQ = questions[nextIndex]
      setTimeout(() => {
        const aiMessage: Message = {
          id: messages.length + 2,
          role: "assistant",
          content: `Question ${nextIndex + 1} (${nextQ.difficulty}): ${nextQ.questionText}`,
          timestamp: new Date(),
          questionId: nextQ.questionID,
        }
        setMessages((prev) => [...prev, aiMessage])
        setCurrentQuestionIndex(nextIndex)
        setQuestionStartTime(Date.now())
        speakText(nextQ.questionText)
      }, 500)
    } else {
      // All questions answered — submit to backend
      setIsSubmitting(true)

      const submitData: SubmitAnswerItem[] = updatedAnswers.map((a) => ({
        questionID: a.questionID,
        answerText: a.answerText,
        timeSpent: a.timeSpent,
      }))

      try {
        await submitAnswers(Number(entryId), submitData)
        // Navigate to results
        sessionStorage.removeItem("interview_data")
        router.push(`/results?entryId=${entryId}`)
      } catch (err: any) {
        const errorMessage: Message = {
          id: messages.length + 2,
          role: "assistant",
          content: `There was an error submitting your answers: ${err.message}. Please try again.`,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
        setIsSubmitting(false)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 relative flex flex-col h-full">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {jobTitle} Interview
          </h1>
          <div className="text-sm text-purple-600 bg-white/80 px-3 py-1 rounded-full backdrop-blur-md border border-purple-100 shadow-sm">
            Question {Math.min(currentQuestionIndex + 1, totalQuestions)} of {totalQuestions}
          </div>
        </div>

        <div className="mb-6">
          <Progress value={((currentQuestionIndex + 1) / totalQuestions) * 100} className="h-3 bg-white/50" />
        </div>

        <Card className="flex-1 flex flex-col overflow-hidden border-purple-200 bg-white/80 backdrop-blur-md shadow-xl min-h-[500px]">
          <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <Avatar className={`h-10 w-10 ${message.role === "user" ? "ml-3" : "mr-3"}`}>
                    <AvatarFallback
                      className={
                        message.role === "user"
                          ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                          : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                      }
                    >
                      {message.role === "user" ? "U" : "AI"}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`rounded-2xl p-4 shadow-lg ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                        : "bg-white border border-purple-100"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className={`text-xs ${message.role === "user" ? "text-white/70" : "text-gray-500"}`}>
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      {message.role === "assistant" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => speakText(message.content)}
                          className="h-6 w-6 p-0 hover:bg-purple-50 text-purple-600"
                        >
                          <Volume2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </CardContent>

          <div className="p-6 border-t bg-gradient-to-r from-purple-50 to-blue-50">
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-3 py-4">
                <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                <span className="text-purple-700 font-medium">Submitting your answers for evaluation...</span>
              </div>
            ) : (
              <>
                <div className="flex space-x-3">
                  <div className="flex-1 relative">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your answer or use voice input..."
                      className="min-h-[80px] resize-none pr-12 border-purple-200 focus:border-purple-400 focus:ring-purple-200 bg-white/80 backdrop-blur-md shadow-sm"
                      disabled={currentQuestionIndex >= totalQuestions}
                    />
                    {isSupported && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={`absolute right-2 top-2 h-8 w-8 ${
                          isListening
                            ? "bg-red-100 text-red-600 hover:bg-red-200"
                            : "text-purple-600 hover:bg-purple-100"
                        }`}
                        onClick={isListening ? stopListening : startListening}
                        disabled={currentQuestionIndex >= totalQuestions}
                      >
                        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || currentQuestionIndex >= totalQuestions}
                    size="icon"
                    className="h-[80px] w-16 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg"
                  >
                    <Send className="h-6 w-6" />
                  </Button>
                </div>
                <div className="mt-3 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSendMessage}
                    disabled={!input.trim() || currentQuestionIndex >= totalQuestions}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-100"
                  >
                    {currentQuestionIndex < totalQuestions - 1
                      ? "Send and continue to next question"
                      : "Submit final answer and see results"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                {isSupported && (
                  <p className="text-xs text-center text-purple-600 mt-2">
                    {isListening
                      ? "🎤 Listening... Click the mic to stop"
                      : "💡 Click the mic icon to use voice input"}
                  </p>
                )}
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
