"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, Send, Mic, MicOff, Volume2, Brain, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Message {
  id: number
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

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

export default function InterviewPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content:
        "Hello! I'll be conducting your interview today for the Frontend Developer position. Let's start with a simple question: Can you tell me about your experience with React?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const totalQuestions = 10

  useEffect(() => {
    // Check if speech recognition is supported
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
          let interimTranscript = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }

          if (finalTranscript) {
            setInput((prev) => prev + finalTranscript)
          }
        }

        recognitionRef.current.onerror = (event) => {
          console.error("Speech recognition error:", event)
          setIsListening(false)
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
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

  const handleSendMessage = () => {
    if (!input.trim()) return

    // Stop listening when sending message
    if (isListening) {
      stopListening()
    }

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages([...messages, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate AI response after a delay
    setTimeout(() => {
      const nextQuestions = [
        "Great! Now, can you describe a challenging project you worked on and how you overcame the obstacles?",
        "How do you stay updated with the latest frontend technologies and trends?",
        "Can you explain your approach to responsive design?",
        "How do you handle state management in large React applications?",
        "What testing strategies do you implement for your frontend code?",
        "How would you optimize a React application for performance?",
        "Can you describe your experience with CSS preprocessors and which one you prefer?",
        "How do you approach accessibility in your web applications?",
        "What's your experience with version control systems like Git?",
      ]

      if (currentQuestion < totalQuestions) {
        const aiMessage: Message = {
          id: messages.length + 2,
          role: "assistant",
          content: nextQuestions[currentQuestion - 1],
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, aiMessage])
        setCurrentQuestion(currentQuestion + 1)
        setIsTyping(false)

        // Speak the AI response
        speakText(nextQuestions[currentQuestion - 1])
      } else {
        // Interview complete, redirect to results
        router.push("/results")
      }
    }, 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 relative flex flex-col h-full">
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Frontend Developer Interview
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
                      <AvatarImage
                        src={
                          message.role === "user"
                            ? "/placeholder.svg?height=40&width=40"
                            : "/placeholder.svg?height=40&width=40"
                        }
                        alt={message.role === "user" ? "User" : "AI Interviewer"}
                      />
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
                      <p className="text-sm leading-relaxed">{message.content}</p>
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
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex flex-row">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                        AI
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-2xl p-4 bg-white border border-purple-100 shadow-lg">
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 rounded-full bg-purple-400 animate-bounce"></div>
                        <div
                          className="h-2 w-2 rounded-full bg-blue-400 animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
                    disabled={isTyping}
                  />
                  {isSupported && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={`absolute right-2 top-2 h-8 w-8 ${
                        isListening ? "bg-red-100 text-red-600 hover:bg-red-200" : "text-purple-600 hover:bg-purple-100"
                      }`}
                      onClick={isListening ? stopListening : startListening}
                      disabled={isTyping}
                    >
                      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isTyping}
                  size="icon"
                  className="h-[80px] w-16 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg"
                >
                  <Send className="h-6 w-6" />
                </Button>
              </div>
              {currentQuestion < totalQuestions ? (
                <div className="mt-3 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isTyping}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-100"
                  >
                    Send and continue to next question
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="mt-3 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/results")}
                    disabled={!input.trim() || isTyping}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-100"
                  >
                    Finish interview and see results
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
              {isSupported && (
                <p className="text-xs text-center text-purple-600 mt-2">
                  {isListening ? "🎤 Listening... Click the mic to stop" : "💡 Click the mic icon to use voice input"}
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
  )
}
