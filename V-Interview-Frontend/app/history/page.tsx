"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Eye, FileText, Search, Sparkles, TrendingUp, Calendar, Loader2 } from "lucide-react"
import Link from "next/link"
import { getInterviewHistory, type InterviewHistoryEntry } from "@/lib/api"

export default function HistoryPage() {
  const [history, setHistory] = useState<InterviewHistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    getInterviewHistory()
      .then((res) => setHistory(res.history))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [])

  const filteredHistory = history.filter((entry) =>
    entry.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.industry.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const completedInterviews = history.filter((h) => h.status === "completed")
  const averageScore =
    completedInterviews.length > 0
      ? completedInterviews.reduce((acc, h) => acc + (h.results?.overallScore || 0), 0) / completedInterviews.length
      : 0
  const bestScore =
    completedInterviews.length > 0
      ? Math.max(...completedInterviews.map((h) => h.results?.overallScore || 0))
      : 0

  const getScoreBadge = (score: number) => {
    if (score >= 76) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{score}/100</Badge>
    } else if (score >= 50) {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{score}/100</Badge>
    } else {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{score}/100</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Interview History
            </h1>
            <p className="text-gray-600">View and manage your past interview simulations</p>
          </div>
          <div className="flex w-full md:w-auto gap-3">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-3 h-4 w-4 text-purple-500" />
              <Input
                type="search"
                placeholder="Search interviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-[250px] pl-10 border-purple-200 focus:border-purple-400 focus:ring-purple-200 bg-white/80 backdrop-blur-md"
              />
            </div>
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                <FileText className="mr-2 h-4 w-4" />
                New Interview
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <Card className="mb-8 border-purple-100 bg-white/80 backdrop-blur-md shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
            <CardTitle className="flex items-center text-purple-900">
              <Sparkles className="mr-2 h-5 w-5" />
              All Interviews
            </CardTitle>
            <CardDescription>A complete list of your interview simulations</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {filteredHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-3 text-purple-200" />
                <p>{history.length === 0 ? "No interviews yet. Start your first interview!" : "No matches found."}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-purple-900">Job Title</TableHead>
                    <TableHead className="text-purple-900">Industry</TableHead>
                    <TableHead className="text-purple-900">Date</TableHead>
                    <TableHead className="text-purple-900">Status</TableHead>
                    <TableHead className="text-purple-900">Score</TableHead>
                    <TableHead className="text-right text-purple-900">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.map((entry) => (
                    <TableRow key={entry.entryID} className="hover:bg-purple-50/50">
                      <TableCell className="font-medium">{entry.jobTitle}</TableCell>
                      <TableCell className="text-gray-600">{entry.industry}</TableCell>
                      <TableCell className="text-gray-600">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            entry.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }
                        >
                          {entry.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {entry.results ? getScoreBadge(entry.results.overallScore) : <span className="text-gray-400">—</span>}
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.status === "completed" ? (
                          <Link href={`/results?entryId=${entry.entryID}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Report
                            </Button>
                          </Link>
                        ) : (
                          <span className="text-xs text-gray-400">Pending</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-purple-100 bg-white/80 backdrop-blur-md shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
              <CardTitle className="flex items-center text-purple-900">
                <TrendingUp className="mr-2 h-5 w-5" />
                Interview Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Interviews</span>
                  <span className="font-medium text-lg text-purple-900">{history.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-medium text-lg text-purple-900">{completedInterviews.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Score</span>
                  <span className="font-medium text-lg text-purple-900">
                    {averageScore > 0 ? `${averageScore.toFixed(1)}/100` : "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Best Performance</span>
                  <span className="font-medium text-lg text-purple-900">
                    {bestScore > 0 ? `${bestScore}/100` : "—"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-100 bg-white/80 backdrop-blur-md shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <CardTitle className="flex items-center text-blue-900">
                <Calendar className="mr-2 h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {history.slice(0, 3).map((entry) => (
                  <div key={entry.entryID} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{entry.jobTitle}</p>
                      <p className="text-xs text-gray-500">{new Date(entry.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      {entry.results ? getScoreBadge(entry.results.overallScore) : (
                        <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
                      )}
                    </div>
                  </div>
                ))}
                {history.length === 0 && (
                  <p className="text-sm text-gray-500 text-center">No activity yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-cyan-100 bg-white/80 backdrop-blur-md shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-purple-50">
              <CardTitle className="flex items-center text-cyan-900">
                <TrendingUp className="mr-2 h-5 w-5" />
                Score Trends
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {completedInterviews.length > 0 ? (
                <>
                  <div className="h-[150px] flex items-end gap-2">
                    {completedInterviews
                      .slice(0, 6)
                      .reverse()
                      .map((entry, index) => (
                        <div key={entry.entryID} className="relative flex-1 group">
                          <div
                            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-cyan-500 to-purple-500 rounded-t-sm transition-all duration-300 group-hover:opacity-80"
                            style={{ height: `${entry.results?.overallScore || 0}%` }}
                          ></div>
                          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap">
                            {index + 1}
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-white border rounded px-2 py-1 text-xs whitespace-nowrap transition-opacity shadow-lg">
                            {entry.results?.overallScore || 0}/100
                          </div>
                        </div>
                      ))}
                  </div>
                  <div className="mt-8 pt-2 border-t">
                    <p className="text-sm text-gray-600 text-center">Your recent score progression</p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">Complete interviews to see score trends</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
