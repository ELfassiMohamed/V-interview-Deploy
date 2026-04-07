"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Eye, FileText, Search, Sparkles, TrendingUp, Calendar } from "lucide-react"
import Link from "next/link"
import { apiRequest, getAuthToken, parseApiError } from "@/lib/api"
import { useRouter } from "next/navigation"

type HistoryEntry = {
  entryID: number
  jobTitle: string
  experienceLevel: string
  industry: string
  createdAt: string
  questionCount: number
  status: "completed" | "pending"
  results?: {
    overallScore: number
    completedAt: string
  }
}

type HistoryResponse = {
  success: boolean
  history: HistoryEntry[]
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (!getAuthToken()) {
      router.replace("/auth")
      return
    }

    const loadHistory = async () => {
      try {
        const response = await apiRequest<HistoryResponse>("/ai/interview-history/")
        setEntries(response.history)
      } catch (err) {
        setError(parseApiError(err))
      } finally {
        setLoading(false)
      }
    }

    void loadHistory()
  }, [router])

  const filteredEntries = useMemo(() => {
    if (!search.trim()) return entries
    const term = search.toLowerCase()
    return entries.filter((item) =>
      [item.jobTitle, item.experienceLevel, item.industry].some((value) => value.toLowerCase().includes(term)),
    )
  }, [entries, search])

  const completedEntries = entries.filter((entry) => entry.status === "completed")
  const avgScore = completedEntries.length
    ? (completedEntries.reduce((acc, entry) => acc + (entry.results?.overallScore || 0), 0) / completedEntries.length).toFixed(1)
    : "0"

  const bestScore = completedEntries.length
    ? Math.max(...completedEntries.map((entry) => entry.results?.overallScore || 0))
    : 0

  const scoreBadge = (score?: number) => {
    if (typeof score !== "number") {
      return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">Pending</Badge>
    }

    if (score >= 80) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{score}/100</Badge>
    }

    if (score >= 60) {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{score}/100</Badge>
    }

    return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{score}/100</Badge>
  }

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">Interview History</h1>
            <p className="text-gray-600">View and manage your past interview simulations</p>
          </div>
          <div className="flex w-full md:w-auto gap-3">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-3 h-4 w-4 text-purple-500" />
              <Input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search interviews..." className="w-full md:w-[250px] pl-10 border-purple-200 focus:border-purple-400 focus:ring-purple-200 bg-white/80 backdrop-blur-md" />
            </div>
            <Link href="/dashboard"><Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"><FileText className="mr-2 h-4 w-4" />New Interview</Button></Link>
          </div>
        </div>

        <Card className="mb-8 border-purple-100 bg-white/80 backdrop-blur-md shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
            <CardTitle className="flex items-center text-purple-900"><Sparkles className="mr-2 h-5 w-5" />All Interviews</CardTitle>
            <CardDescription>A complete list of your interview simulations</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? <p>Loading history...</p> : null}
            {error ? <p className="text-sm text-red-600 mb-4">{error}</p> : null}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-purple-900">Job Title</TableHead>
                  <TableHead className="text-purple-900">Experience</TableHead>
                  <TableHead className="text-purple-900">Date</TableHead>
                  <TableHead className="text-purple-900">Score</TableHead>
                  <TableHead className="text-right text-purple-900">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.entryID} className="hover:bg-purple-50/50">
                    <TableCell className="font-medium">{entry.jobTitle}</TableCell>
                    <TableCell className="text-gray-600">{entry.experienceLevel}</TableCell>
                    <TableCell className="text-gray-600">{new Date(entry.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{scoreBadge(entry.results?.overallScore)}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/results?entryId=${entry.entryID}`}>
                        <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                          <Eye className="mr-2 h-4 w-4" />View Report
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-purple-100 bg-white/80 backdrop-blur-md shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50"><CardTitle className="flex items-center text-purple-900"><TrendingUp className="mr-2 h-5 w-5" />Interview Statistics</CardTitle></CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center"><span className="text-gray-600">Total Interviews</span><span className="font-medium text-lg text-purple-900">{entries.length}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-600">Average Score</span><span className="font-medium text-lg text-purple-900">{avgScore}/100</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-600">Best Performance</span><span className="font-medium text-lg text-purple-900">{bestScore}/100</span></div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-100 bg-white/80 backdrop-blur-md shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50"><CardTitle className="flex items-center text-blue-900"><Calendar className="mr-2 h-5 w-5" />Recent Activity</CardTitle></CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {entries.slice(0, 3).map((entry) => (
                  <div key={entry.entryID} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center"><FileText className="h-5 w-5 text-white" /></div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{entry.jobTitle}</p>
                      <p className="text-xs text-gray-500">{new Date(entry.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>{scoreBadge(entry.results?.overallScore)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-cyan-100 bg-white/80 backdrop-blur-md shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-purple-50"><CardTitle className="flex items-center text-cyan-900"><TrendingUp className="mr-2 h-5 w-5" />Improvement Trends</CardTitle></CardHeader>
            <CardContent className="p-6">
              <div className="h-[150px] flex items-end gap-2">
                {completedEntries.slice(0, 6).reverse().map((entry, index) => (
                  <div key={entry.entryID} className="relative flex-1 group">
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-cyan-500 to-purple-500 rounded-t-sm transition-all duration-300 group-hover:opacity-80" style={{ height: `${entry.results?.overallScore || 0}%` }}></div>
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap">{index + 1}</div>
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-white border rounded px-2 py-1 text-xs whitespace-nowrap transition-opacity shadow-lg">{entry.results?.overallScore || 0}/100</div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-2 border-t"><p className="text-sm text-gray-600 text-center">Track your score evolution over completed interviews</p></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
