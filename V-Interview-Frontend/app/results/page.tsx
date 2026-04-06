"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Download, FileText, Home, ThumbsUp, XCircle, Brain, ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"

export default function ResultsPage() {
  const overallScore = 7.5
  const maxScore = 10

  const strengths = [
    "Strong technical knowledge of React and its ecosystem",
    "Clear communication skills and ability to explain complex concepts",
    "Good understanding of responsive design principles",
    "Demonstrated problem-solving abilities with concrete examples",
  ]

  const weaknesses = [
    "Limited experience with performance optimization techniques",
    "Could improve knowledge of modern CSS frameworks",
    "Needs more experience with testing methodologies",
    "Some hesitation when discussing system architecture",
  ]

  const recommendations = [
    "Focus on learning more about React performance optimization",
    "Practice explaining your thought process more clearly",
    "Gain more experience with testing frameworks like Jest and React Testing Library",
    "Consider working on a project that involves complex state management",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
      <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-2000"></div>

      {/* Header */}
      <div className="relative z-10 px-4 lg:px-6 py-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center text-purple-600 hover:text-purple-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Link>
            <Link href="/" className="flex items-center">
              <div className="h-8 w-8 mr-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                VInterview
              </span>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
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
              <CardDescription>Frontend Developer Interview - {new Date().toLocaleDateString()}</CardDescription>
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
                      style={{
                        stroke: "url(#gradient)",
                      }}
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
                <p className="text-xl font-medium mb-3 text-purple-900">Good Performance</p>
                <p className="text-center text-gray-600 max-w-md">
                  You demonstrated solid technical knowledge and communication skills. There are some areas for
                  improvement, but overall you performed well.
                </p>
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
                value="weaknesses"
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
                    {strengths.map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="mr-3 h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="weaknesses">
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
                    {weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start">
                        <XCircle className="mr-3 h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{weakness}</span>
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
                    {recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start">
                        <div className="mr-3 h-6 w-6 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-xs flex-shrink-0">
                          {index + 1}
                        </div>
                        <span className="text-gray-700">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="border-purple-100 bg-white/80 backdrop-blur-md shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
              <CardTitle className="text-purple-900">Performance Breakdown</CardTitle>
              <CardDescription>Detailed analysis of your performance in different areas</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-purple-900">Technical Knowledge</span>
                    <span className="font-medium text-purple-700">8/10</span>
                  </div>
                  <Progress value={80} className="h-3" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-blue-900">Communication Skills</span>
                    <span className="font-medium text-blue-700">9/10</span>
                  </div>
                  <Progress value={90} className="h-3" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-cyan-900">Problem Solving</span>
                    <span className="font-medium text-cyan-700">7/10</span>
                  </div>
                  <Progress value={70} className="h-3" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-purple-900">Experience</span>
                    <span className="font-medium text-purple-700">6/10</span>
                  </div>
                  <Progress value={60} className="h-3" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-blue-900">Cultural Fit</span>
                    <span className="font-medium text-blue-700">8/10</span>
                  </div>
                  <Progress value={80} className="h-3" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
