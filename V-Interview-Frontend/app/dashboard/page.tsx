"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FileText, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"
import { apiRequest, getAuthToken, parseApiError, saveCurrentInterviewSession, setLatestInterviewEntryId } from "@/lib/api"

type GeneratedQuestion = {
  questionID: number
  questionText: string
  difficulty: string
  order: number
}

type GenerateQuestionsResponse = {
  success: boolean
  entryID: number
  questionsGenerated: number
  questions: GeneratedQuestion[]
}

function parseList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

export default function Dashboard() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({
    jobTitle: "Front End Dev",
    experienceLevel: "Mid-level",
    industry: "Technology",
    language: "English",
    positionType: "Full-time",
    skills: "CSS, HTML, JavaScript, React",
    certifications: "",
    preferredTechnologies: "Next.js",
    softSkills: "Communication, Problem Solving, Leadership",
  })

  useEffect(() => {
    if (!getAuthToken()) {
      router.replace("/auth")
    }
  }, [router])

  const handleStartInterview = async () => {
    setError("")
    setIsSubmitting(true)

    try {
      const payload = {
        jobTitle: form.jobTitle,
        experienceLevel: form.experienceLevel,
        industry: form.industry,
        language: form.language,
        positionType: form.positionType,
        skills: parseList(form.skills),
        certifications: parseList(form.certifications),
        preferredTechnologies: parseList(form.preferredTechnologies),
        softSkills: parseList(form.softSkills),
      }

      const response = await apiRequest<GenerateQuestionsResponse>("/ai/generate-questions/", {
        method: "POST",
        body: payload,
      })

      saveCurrentInterviewSession({
        entryID: response.entryID,
        questions: response.questions,
        jobTitle: form.jobTitle,
        experienceLevel: form.experienceLevel,
      })
      setLatestInterviewEntryId(response.entryID)

      router.push("/interview")
    } catch (err) {
      setError(parseApiError(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Virtual Interview Simulator
          </h1>
          <p className="text-gray-600 text-lg">Prepare for your next job interview with our AI-powered simulation</p>
        </div>

        <Card className="mb-8 border-purple-100 bg-white/80 backdrop-blur-md shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
            <CardTitle className="flex items-center text-purple-900">
              <Sparkles className="mr-2 h-5 w-5" />
              Start a New Interview Simulation
            </CardTitle>
            <CardDescription>Fill interview details and generate questions from the backend</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="job-title" className="text-sm font-medium text-purple-900">Job Title</label>
                  <Input id="job-title" value={form.jobTitle} onChange={(e) => setForm((prev) => ({ ...prev, jobTitle: e.target.value }))} className="border-purple-200 focus:border-purple-400 focus:ring-purple-200" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="experience-level" className="text-sm font-medium text-purple-900">Experience Level</label>
                  <select id="experience-level" value={form.experienceLevel} onChange={(e) => setForm((prev) => ({ ...prev, experienceLevel: e.target.value }))} className="w-full h-10 px-3 py-2 rounded-md border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400">
                    <option value="Entry-level">Entry-level</option>
                    <option value="Mid-level">Mid-level</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="industry" className="text-sm font-medium text-purple-900">Industry</label>
                  <Input id="industry" value={form.industry} onChange={(e) => setForm((prev) => ({ ...prev, industry: e.target.value }))} className="border-purple-200 focus:border-purple-400 focus:ring-purple-200" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="language" className="text-sm font-medium text-purple-900">Language</label>
                  <Input id="language" value={form.language} onChange={(e) => setForm((prev) => ({ ...prev, language: e.target.value }))} className="border-purple-200 focus:border-purple-400 focus:ring-purple-200" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="position-type" className="text-sm font-medium text-purple-900">Position Type</label>
                  <Input id="position-type" value={form.positionType} onChange={(e) => setForm((prev) => ({ ...prev, positionType: e.target.value }))} className="border-purple-200 focus:border-purple-400 focus:ring-purple-200" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="certifications" className="text-sm font-medium text-purple-900">Certifications (comma separated)</label>
                  <Input id="certifications" value={form.certifications} onChange={(e) => setForm((prev) => ({ ...prev, certifications: e.target.value }))} className="border-purple-200 focus:border-purple-400 focus:ring-purple-200" />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="skills" className="text-sm font-medium text-purple-900">Skills (comma separated)</label>
                <Input id="skills" value={form.skills} onChange={(e) => setForm((prev) => ({ ...prev, skills: e.target.value }))} className="border-purple-200 focus:border-purple-400 focus:ring-purple-200" />
              </div>

              <div className="space-y-2">
                <label htmlFor="preferred-technologies" className="text-sm font-medium text-purple-900">Preferred Technologies (comma separated)</label>
                <Input id="preferred-technologies" value={form.preferredTechnologies} onChange={(e) => setForm((prev) => ({ ...prev, preferredTechnologies: e.target.value }))} className="border-purple-200 focus:border-purple-400 focus:ring-purple-200" />
              </div>

              <div className="space-y-2">
                <label htmlFor="soft-skills" className="text-sm font-medium text-purple-900">Soft Skills (comma separated)</label>
                <Input id="soft-skills" value={form.softSkills} onChange={(e) => setForm((prev) => ({ ...prev, softSkills: e.target.value }))} className="border-purple-200 focus:border-purple-400 focus:ring-purple-200" />
              </div>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}

              <div className="pt-4">
                <Button size="lg" onClick={handleStartInterview} disabled={isSubmitting} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <FileText className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Generating questions..." : "Start Interview Simulation"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-purple-100 bg-white/80 backdrop-blur-md shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
              <CardTitle className="text-purple-900">Resume Preview</CardTitle>
              <CardDescription>Information extracted from your resume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-purple-600 py-8">
                <FileText className="h-12 w-12 mx-auto mb-2" />
                <p>Upload your resume to see the preview</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-100 bg-white/80 backdrop-blur-md shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <CardTitle className="text-blue-900">Previous Simulations</CardTitle>
              <CardDescription>Continue where you left off</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-blue-600 py-8">
                <p>Browse your complete interview history.</p>
                <Link href="/history"><Button variant="link" className="mt-2 text-blue-600 hover:text-blue-700">View all history</Button></Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
