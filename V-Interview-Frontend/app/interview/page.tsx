"use client"

import type React from "react"
import { Suspense, useEffect, useRef, useState } from "react"
import {
  ArrowRight,
  BrainCircuit,
  BriefcaseBusiness,
  CheckCircle2,
  Clock,
  Loader2,
  Mic,
  MicOff,
  Send,
  UserRound,
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
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
    <Suspense
      fallback={
        <div className="flex h-full min-h-[400px] items-center justify-center bg-[#f7f9fb]">
          <Loader2 className="h-8 w-8 animate-spin text-[#3525cd]" />
        </div>
      }
    >
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
  const currentQuestion = questions[currentQuestionIndex]
  const progressValue = totalQuestions ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0

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
      // All questions answered - submit to backend
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
      <div className="flex h-full min-h-[400px] items-center justify-center bg-[#f7f9fb]">
        <Loader2 className="h-8 w-8 animate-spin text-[#3525cd]" />
      </div>
    )
  }

  return (
    <main className="h-screen overflow-hidden bg-[linear-gradient(135deg,#f7f9fb_0%,#f2f4f6_45%,#eceef0_100%)] p-3 text-[#191c1e] md:p-4">
      <div className="mx-auto flex h-full w-full max-w-[1280px] flex-col gap-3">
        <header className="shrink-0 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-[0_10px_30px_rgba(79,70,229,0.08)] backdrop-blur-xl">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4d44e3]">Live Interview Session</p>
              <h1 className="mt-0.5 truncate text-xl font-bold tracking-tight text-[#191c1e] md:text-2xl">{jobTitle}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-full border border-[#c7c4d8] bg-white/70 px-3 py-1.5 text-xs font-semibold text-[#3323cc]">
                Question {Math.min(currentQuestionIndex + 1, totalQuestions)} of {totalQuestions}
              </div>
              <div className="rounded-full bg-[#e2dfff] px-3 py-1.5 text-xs font-semibold text-[#0f0069]">
                {currentQuestion?.difficulty || "Focused"}
              </div>
            </div>
          </div>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e0e3e5]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#3525cd] via-[#4f46e5] to-[#8a4cfc] transition-all duration-500"
              style={{ width: `${progressValue}%` }}
            />
          </div>
        </header>

        <section className="grid min-h-0 flex-1 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.8fr)]">
          <div className="flex min-h-0 flex-col gap-3">
            <div className="relative flex-1 overflow-hidden rounded-3xl border border-white/60 bg-[#191c1e] shadow-[0_24px_60px_rgba(25,28,30,0.22)]">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(53,37,205,0.85),rgba(5,85,221,0.5)_42%,rgba(25,28,30,0.95))]" />
              <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:44px_44px]" />

              <div className="relative flex h-full min-h-0 flex-col justify-between p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold text-white shadow-lg backdrop-blur-xl">
                    AI Technical Lead
                  </div>
                  <div className="aspect-video w-32 overflow-hidden rounded-2xl border border-white/30 bg-white/15 shadow-xl backdrop-blur-xl sm:w-40">
                    <div className="flex h-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-white/30 to-white/5 text-white">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                        <UserRound className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-semibold">Candidate</p>
                      <div className="flex h-4 items-end gap-1">
                        {[0, 1, 2, 3].map((bar) => (
                          <span
                            key={bar}
                            className={`w-1 rounded-full bg-white ${isListening ? "animate-pulse" : ""}`}
                            style={{ height: `${6 + bar * 3}px` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center text-white">
                  <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-white/15 shadow-2xl backdrop-blur-xl">
                    <BrainCircuit className="h-8 w-8" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#dad7ff]">Current Question</p>
                  <h2 className="mt-3 line-clamp-4 text-xl font-bold leading-tight tracking-tight md:text-3xl">
                    {currentQuestion?.questionText}
                  </h2>
                </div>

                <div className="rounded-2xl border border-white/30 bg-white/85 p-3 shadow-[0_10px_30px_rgba(79,70,229,0.12)] backdrop-blur-xl">
                  {isSubmitting ? (
                    <div className="mt-3 flex items-center justify-center gap-3 rounded-xl bg-[#e2dfff] px-4 py-2.5 text-sm font-semibold text-[#3323cc]">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Submitting your answers...
                    </div>
                  ) : (
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      {isSupported && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={isListening ? stopListening : startListening}
                          disabled={currentQuestionIndex >= totalQuestions}
                          className={`h-11 rounded-xl border-[#c7c4d8] ${
                            isListening ? "bg-[#ffdad6] text-[#93000a] hover:bg-[#ffdad6]" : "bg-white/70 text-[#3525cd] hover:bg-[#e2dfff]"
                          }`}
                        >
                          {isListening ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
                          {isListening ? "Stop listening" : "Start listening"}
                        </Button>
                      )}
                      <Button
                        onClick={handleSendMessage}
                        disabled={!input.trim() || currentQuestionIndex >= totalQuestions}
                        className="h-11 flex-1 rounded-xl bg-gradient-to-r from-[#3525cd] to-[#8a4cfc] font-semibold text-white shadow-lg shadow-indigo-900/15 hover:from-[#3323cc] hover:to-[#712ae2]"
                      >
                        <Send className="mr-2 h-4 w-4" />
                        {currentQuestionIndex < totalQuestions - 1 ? "Submit Answer" : "Submit Final Answer"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mx-auto flex max-w-fit shrink-0 items-center justify-center gap-3 rounded-full border border-white/70 bg-white/85 p-2 shadow-[0_10px_30px_rgba(79,70,229,0.08)] backdrop-blur-xl">
              <Button
                type="button"
                className="h-12 rounded-full bg-[#ba1a1a] px-6 text-sm font-bold text-white shadow-lg shadow-red-900/10 hover:bg-[#a01717]"
                onClick={() => router.push("/dashboard")}
              >
                End Interview
              </Button>
            </div>
          </div>

          <aside className="grid min-h-0 grid-rows-[minmax(0,1fr)_auto_minmax(0,0.7fr)] gap-3">
            <section className="flex min-h-0 flex-col rounded-3xl border border-white/70 bg-white/80 shadow-[0_10px_30px_rgba(79,70,229,0.08)] backdrop-blur-xl">
              <div className="border-b border-[#c7c4d8]/50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#777587]">Answer Workspace</p>
                    <h2 className="mt-0.5 text-lg font-semibold text-[#191c1e]">Your Answer</h2>
                  </div>
                  {isListening && (
                    <span className="rounded-full bg-[#ffdad6] px-3 py-1 text-xs font-semibold text-[#93000a]">Listening</span>
                  )}
                </div>
              </div>

              <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
                <div className="flex shrink-0 gap-4 border-b border-[#c7c4d8]/40">
                  <button className="border-b-2 border-[#3525cd] px-1 pb-2 text-sm font-semibold text-[#3525cd]">Text</button>
                  <button className="px-1 pb-2 text-sm font-semibold text-[#464555]">Notes</button>
                </div>

                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your answer here..."
                  className="min-h-0 flex-1 resize-none rounded-2xl border-[#c7c4d8]/70 bg-[#f2f4f6]/80 p-4 text-sm leading-6 shadow-inner focus:border-[#3525cd] focus:ring-[#c3c0ff]"
                  disabled={currentQuestionIndex >= totalQuestions || isSubmitting}
                />
              </div>
            </section>

            <section className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_10px_30px_rgba(79,70,229,0.08)] backdrop-blur-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#777587]">Interview Details</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#dbe1ff] text-[#003fac]">
                    <BriefcaseBusiness className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#191c1e]">{jobTitle}</p>
                    <p className="text-xs text-[#464555]">Role simulation</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e2dfff] text-[#3525cd]">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#191c1e]">{answers.length} answers recorded</p>
                    <p className="text-xs text-[#464555]">Progress saved locally until submission</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaddff] text-[#712ae2]">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#191c1e]">{Math.max(totalQuestions - currentQuestionIndex - 1, 0)} remaining</p>
                    <p className="text-xs text-[#464555]">Questions after this prompt</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="min-h-0 overflow-y-auto rounded-3xl border border-white/70 bg-white/70 p-4 shadow-[0_10px_30px_rgba(79,70,229,0.08)] backdrop-blur-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#777587]">Conversation</p>
              <div className="mt-3 space-y-2">
                {messages.map((message) => (
                  <div key={message.id} className={message.role === "user" ? "ml-6 rounded-2xl bg-[#4f46e5] p-2.5 text-white" : "mr-6 rounded-2xl border border-[#c7c4d8]/50 bg-white p-2.5"}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-[0.14em]">{message.role === "user" ? "You" : "AI"}</span>
                      <span className={message.role === "user" ? "text-xs text-white/70" : "text-xs text-[#777587]"}>
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="mt-1.5 line-clamp-3 whitespace-pre-line text-xs leading-5">{message.content}</p>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  )
}
