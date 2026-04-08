"use client"

import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Download, FileText, Home, ThumbsUp, XCircle, Sparkles, Loader2 } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { getInterviewResults, getInterviewHistory, type InterviewResultsResponse } from "@/lib/api"

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /></div>}>
      <ResultsPageInner />
    </Suspense>
  )
}

function ResultsPageInner() {
  const searchParams = useSearchParams()
  const entryId = searchParams.get("entryId")

  const [data, setData] = useState<InterviewResultsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchResults() {
      try {
        if (entryId) {
          const results = await getInterviewResults(Number(entryId))
          setData(results)
        } else {
          // No entryId — try to find the most recent completed interview
          const history = await getInterviewHistory()
          const completed = history.history.find((h) => h.status === "completed")
          if (completed) {
            const results = await getInterviewResults(completed.entryID)
            setData(results)
          } else {
            setError("No completed interviews found. Complete an interview to see your results.")
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load results.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchResults()
  }, [entryId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-purple-600">Loading your results...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center py-16">
          <FileText className="h-16 w-16 mx-auto mb-4 text-purple-300" />
          <h2 className="text-2xl font-bold text-purple-900 mb-2">No Results Available</h2>
          <p className="text-gray-600 mb-6">{error || "Complete an interview to see your results."}</p>
          <Link href="/dashboard">
            <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
              Start an Interview
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const { results, interview, questionsAndAnswers } = data
  const overallScore = results.overallScore
  const maxScore = 100

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Interview Results
            </h1>
            <p className="text-gray-600">Your performance analysis and recommendations</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <Card className="mb-8 border-purple-100 bg-white/80 backdrop-blur-md shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
            <CardTitle className="flex items-center text-purple-900">
              <Sparkles className="mr-2 h-5 w-5" />
              Overall Performance
            </CardTitle>
            <CardDescription>
              {interview.jobTitle} Interview — {new Date(interview.completedAt).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex flex-col items-center">
              <div className="relative w-48 h-48 mb-6">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    className="text-purple-200 stroke-current"
                    strokeWidth="8"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                  ></circle>
                  <circle
                    className="stroke-current"
                    strokeWidth="8"
                    strokeLinecap="round"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - overallScore / maxScore)}`}
                    style={{ stroke: "url(#gradient)" }}
                  ></circle>
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="50%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      {overallScore}
                    </span>
                    <span className="text-2xl text-gray-500">/{maxScore}</span>
                  </div>
                </div>
              </div>
              <p className="text-xl font-medium mb-3 text-purple-900">
                {overallScore >= 86
                  ? "Excellent Performance!"
                  : overallScore >= 76
                    ? "Good Performance"
                    : overallScore >= 61
                      ? "Average Performance"
                      : "Needs Improvement"}
              </p>
              <p className="text-center text-gray-600 max-w-md">{results.feedback}</p>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="strengths" className="mb-8">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-md">
            <TabsTrigger
              value="strengths"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-50 data-[state=active]:to-emerald-50 data-[state=active]:text-green-700"
            >
              Strengths
            </TabsTrigger>
            <TabsTrigger
              value="improvements"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-50 data-[state=active]:to-pink-50 data-[state=active]:text-red-700"
            >
              Areas to Improve
            </TabsTrigger>
            <TabsTrigger
              value="recommendations"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-50 data-[state=active]:to-cyan-50 data-[state=active]:text-blue-700"
            >
              Recommendations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="strengths">
            <Card className="border-green-100 bg-white/80 backdrop-blur-md shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center text-green-800">
                  <ThumbsUp className="mr-2 h-5 w-5 text-green-600" />
                  Your Strengths
                </CardTitle>
                <CardDescription>Areas where you performed particularly well</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-4">
                  {results.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="mr-3 h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="improvements">
            <Card className="border-red-100 bg-white/80 backdrop-blur-md shadow-lg">
              <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
                <CardTitle className="flex items-center text-red-800">
                  <XCircle className="mr-2 h-5 w-5 text-red-600" />
                  Areas to Improve
                </CardTitle>
                <CardDescription>Aspects where you could enhance your performance</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-4">
                  {results.improvements.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <XCircle className="mr-3 h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations">
            <Card className="border-blue-100 bg-white/80 backdrop-blur-md shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                <CardTitle className="flex items-center text-blue-800">
                  <FileText className="mr-2 h-5 w-5 text-blue-600" />
                  Personalized Recommendations
                </CardTitle>
                <CardDescription>Suggestions to help you improve for future interviews</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-4">
                  {results.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <div className="mr-3 h-6 w-6 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-xs flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Per-question scores */}
        {results.questionScores && results.questionScores.length > 0 && (
          <Card className="border-purple-100 bg-white/80 backdrop-blur-md shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
              <CardTitle className="text-purple-900">Question-by-Question Breakdown</CardTitle>
              <CardDescription>Detailed analysis of your performance per question</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {results.questionScores.map((qs, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-purple-900 text-sm">
                        Q{qs.question_number}: {questionsAndAnswers[index]?.questionText?.substring(0, 60) || "Question"}
                        {(questionsAndAnswers[index]?.questionText?.length || 0) > 60 ? "..." : ""}
                      </span>
                      <span className="font-medium text-purple-700">{qs.score}/10</span>
                    </div>
                    <Progress value={qs.score * 10} className="h-3" />
                    {qs.feedback && (
                      <p className="text-xs text-gray-500 italic">{qs.feedback}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
