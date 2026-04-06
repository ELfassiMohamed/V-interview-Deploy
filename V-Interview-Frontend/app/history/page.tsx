import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Eye, FileText, Search, Brain, ArrowLeft, Sparkles, TrendingUp, Calendar } from "lucide-react"
import Link from "next/link"

export default function HistoryPage() {
  const mockInterviews = [
    { id: 1, jobTitle: "Frontend Developer", company: "Tech Solutions Inc.", date: "2023-04-15", score: 8.5 },
    { id: 2, jobTitle: "React Developer", company: "Digital Innovations", date: "2023-03-22", score: 7.2 },
    { id: 3, jobTitle: "UI/UX Designer", company: "Creative Studios", date: "2023-02-10", score: 9.0 },
    { id: 4, jobTitle: "Full Stack Developer", company: "Web Systems", date: "2023-01-05", score: 6.8 },
    { id: 5, jobTitle: "JavaScript Engineer", company: "App Builders", date: "2022-12-18", score: 8.1 },
    { id: 6, jobTitle: "Frontend Lead", company: "Startup Ventures", date: "2022-11-30", score: 7.5 },
  ]

  const getScoreBadge = (score: number) => {
    if (score >= 8) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{score}/10</Badge>
    } else if (score >= 6) {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{score}/10</Badge>
    } else {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{score}/10</Badge>
    }
  }

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

          <Card className="mb-8 border-purple-100 bg-white/80 backdrop-blur-md shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
              <CardTitle className="flex items-center text-purple-900">
                <Sparkles className="mr-2 h-5 w-5" />
                All Interviews
              </CardTitle>
              <CardDescription>A complete list of your interview simulations</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-purple-900">Job Title</TableHead>
                    <TableHead className="text-purple-900">Company</TableHead>
                    <TableHead className="text-purple-900">Date</TableHead>
                    <TableHead className="text-purple-900">Score</TableHead>
                    <TableHead className="text-right text-purple-900">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockInterviews.map((interview) => (
                    <TableRow key={interview.id} className="hover:bg-purple-50/50">
                      <TableCell className="font-medium">{interview.jobTitle}</TableCell>
                      <TableCell className="text-gray-600">{interview.company}</TableCell>
                      <TableCell className="text-gray-600">{new Date(interview.date).toLocaleDateString()}</TableCell>
                      <TableCell>{getScoreBadge(interview.score)}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/results/${interview.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Report
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
                    <span className="font-medium text-lg text-purple-900">{mockInterviews.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average Score</span>
                    <span className="font-medium text-lg text-purple-900">
                      {(mockInterviews.reduce((acc, curr) => acc + curr.score, 0) / mockInterviews.length).toFixed(1)}
                      /10
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Best Performance</span>
                    <span className="font-medium text-lg text-purple-900">
                      {Math.max(...mockInterviews.map((i) => i.score))}/10
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
                  {mockInterviews.slice(0, 3).map((interview) => (
                    <div key={interview.id} className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{interview.jobTitle}</p>
                        <p className="text-xs text-gray-500">{new Date(interview.date).toLocaleDateString()}</p>
                      </div>
                      <div>{getScoreBadge(interview.score)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-cyan-100 bg-white/80 backdrop-blur-md shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-cyan-50 to-purple-50">
                <CardTitle className="flex items-center text-cyan-900">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Improvement Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[150px] flex items-end gap-2">
                  {mockInterviews
                    .slice(0, 6)
                    .reverse()
                    .map((interview, index) => (
                      <div key={interview.id} className="relative flex-1 group">
                        <div
                          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-cyan-500 to-purple-500 rounded-t-sm transition-all duration-300 group-hover:opacity-80"
                          style={{ height: `${interview.score * 10}%` }}
                        ></div>
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap">
                          {index + 1}
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-white border rounded px-2 py-1 text-xs whitespace-nowrap transition-opacity shadow-lg">
                          {interview.score}/10
                        </div>
                      </div>
                    ))}
                </div>
                <div className="mt-8 pt-2 border-t">
                  <p className="text-sm text-gray-600 text-center">Your scores are improving over time</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
