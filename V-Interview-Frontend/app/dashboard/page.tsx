"use client"

import type React from "react"
import { useState, useEffect, type KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FileText, Sparkles, ArrowRight, Loader2, Clock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { generateQuestions, getUserEntries, type UserEntry } from "@/lib/api"

export default function Dashboard() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  // Form state
  const [jobTitle, setJobTitle] = useState("")
  const [experienceLevel, setExperienceLevel] = useState("Mid-level")
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState("")
  const [industry, setIndustry] = useState("Technology")
  const [language, setLanguage] = useState("English")
  const [positionType, setPositionType] = useState("Full-time")
  const [certifications, setCertifications] = useState("")
  const [preferredTechnologies, setPreferredTechnologies] = useState<string[]>([])
  const [techInput, setTechInput] = useState("")
  const [softSkills, setSoftSkills] = useState<string[]>([])
  const [softSkillInput, setSoftSkillInput] = useState("")

  // API state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recentEntries, setRecentEntries] = useState<UserEntry[]>([])

  // Fetch recent entries on mount
  useEffect(() => {
    if (isAuthenticated) {
      getUserEntries()
        .then((res) => setRecentEntries(res.entries.slice(0, 3)))
        .catch(() => {}) // silently fail for recent entries
    }
  }, [isAuthenticated])

  const addTag = (
    value: string,
    list: string[],
    setter: (v: string[]) => void,
    inputSetter: (v: string) => void
  ) => {
    const trimmed = value.trim()
    if (trimmed && !list.includes(trimmed)) {
      setter([...list, trimmed])
    }
    inputSetter("")
  }

  const removeTag = (value: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.filter((item) => item !== value))
  }

  const handleTagKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    value: string,
    list: string[],
    setter: (v: string[]) => void,
    inputSetter: (v: string) => void
  ) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag(value, list, setter, inputSetter)
    }
  }

  const handleStartInterview = async () => {
    if (!jobTitle.trim()) {
      setError("Job Title is required")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await generateQuestions({
        jobTitle,
        experienceLevel,
        skills,
        industry,
        language,
        positionType,
        certifications: certifications ? certifications.split(",").map((c) => c.trim()) : [],
        preferredTechnologies,
        softSkills,
      })

      // Store questions in sessionStorage for the interview page
      sessionStorage.setItem(
        "interview_data",
        JSON.stringify({
          entryId: response.entryID,
          questions: response.questions,
          jobTitle,
        })
      )

      router.push(`/interview?entryId=${response.entryID}`)
    } catch (err: any) {
      setError(err.message || "Failed to generate questions. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
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

        {/* Error Banner */}
        {error && (
          <div className="mb-6 flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            <span>{error}</span>
          </div>
        )}

        <Card className="mb-8 border-purple-100 bg-white/80 backdrop-blur-md shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
            <CardTitle className="flex items-center text-purple-900">
              <Sparkles className="mr-2 h-5 w-5" />
              Start a New Interview Simulation
            </CardTitle>
            <CardDescription>Fill in your details and let AI generate tailored interview questions</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="job-title" className="text-sm font-medium text-purple-900">
                    Job Title *
                  </label>
                  <Input
                    id="job-title"
                    placeholder="e.g. Front End Dev"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="border-purple-200 focus:border-purple-400 focus:ring-purple-200"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="experience-level" className="text-sm font-medium text-purple-900">
                    Experience Level
                  </label>
                  <select
                    id="experience-level"
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full h-10 px-3 py-2 rounded-md border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
                  >
                    <option value="Entry-level">Entry-level</option>
                    <option value="Mid-level">Mid-level</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="skills" className="text-sm font-medium text-purple-900">
                  Skills
                </label>
                <div className="flex flex-wrap gap-2 p-3 border rounded-md border-purple-200 bg-white min-h-[44px]">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 sm:px-3 sm:py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full text-xs sm:text-sm flex items-center whitespace-nowrap"
                    >
                      {skill}
                      <button
                        className="ml-1 sm:ml-1.5 text-purple-500 hover:text-purple-700 text-sm"
                        onClick={() => removeTag(skill, skills, setSkills)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <Input
                    id="skills"
                    placeholder="Add a skill and press Enter..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => handleTagKeyDown(e, skillInput, skills, setSkills, setSkillInput)}
                    className="border-0 focus:ring-0 flex-1 min-w-[100px] sm:min-w-[120px] text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="industry" className="text-sm font-medium text-purple-900">
                    Industry
                  </label>
                  <select
                    id="industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full h-10 px-3 py-2 rounded-md border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="Education">Education</option>
                    <option value="Retail">Retail</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Media">Media</option>
                    <option value="Government">Government</option>
                    <option value="Non-profit">Non-profit</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="language" className="text-sm font-medium text-purple-900">
                    Language
                  </label>
                  <select
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full h-10 px-3 py-2 rounded-md border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Chinese">Chinese</option>
                    <option value="Japanese">Japanese</option>
                    <option value="Portuguese">Portuguese</option>
                    <option value="Italian">Italian</option>
                    <option value="Russian">Russian</option>
                    <option value="Arabic">Arabic</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="position-type" className="text-sm font-medium text-purple-900">
                    Position Type
                  </label>
                  <select
                    id="position-type"
                    value={positionType}
                    onChange={(e) => setPositionType(e.target.value)}
                    className="w-full h-10 px-3 py-2 rounded-md border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="certifications" className="text-sm font-medium text-purple-900">
                    Certifications (Optional)
                  </label>
                  <Input
                    id="certifications"
                    placeholder="e.g. AWS, Google Cloud"
                    value={certifications}
                    onChange={(e) => setCertifications(e.target.value)}
                    className="border-purple-200 focus:border-purple-400 focus:ring-purple-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="preferred-technologies" className="text-sm font-medium text-purple-900">
                  Preferred Technologies
                </label>
                <div className="flex flex-wrap gap-2 p-3 border rounded-md border-purple-200 bg-white min-h-[44px]">
                  {preferredTechnologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 sm:px-3 sm:py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 rounded-full text-xs sm:text-sm flex items-center whitespace-nowrap"
                    >
                      {tech}
                      <button
                        className="ml-1 sm:ml-1.5 text-blue-500 hover:text-blue-700 text-sm"
                        onClick={() => removeTag(tech, preferredTechnologies, setPreferredTechnologies)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <Input
                    id="preferred-technologies"
                    placeholder="Add a technology and press Enter..."
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={(e) =>
                      handleTagKeyDown(e, techInput, preferredTechnologies, setPreferredTechnologies, setTechInput)
                    }
                    className="border-0 focus:ring-0 flex-1 min-w-[100px] sm:min-w-[120px] text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="soft-skills" className="text-sm font-medium text-purple-900">
                  Soft Skills
                </label>
                <div className="flex flex-wrap gap-2 p-3 border rounded-md border-purple-200 bg-white min-h-[44px]">
                  {softSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 sm:px-3 sm:py-1 bg-gradient-to-r from-cyan-100 to-purple-100 text-cyan-700 rounded-full text-xs sm:text-sm flex items-center whitespace-nowrap"
                    >
                      {skill}
                      <button
                        className="ml-1 sm:ml-1.5 text-cyan-500 hover:text-cyan-700 text-sm"
                        onClick={() => removeTag(skill, softSkills, setSoftSkills)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <Input
                    id="soft-skills"
                    placeholder="Add a soft skill and press Enter..."
                    value={softSkillInput}
                    onChange={(e) => setSoftSkillInput(e.target.value)}
                    onKeyDown={(e) =>
                      handleTagKeyDown(e, softSkillInput, softSkills, setSoftSkills, setSoftSkillInput)
                    }
                    className="border-0 focus:ring-0 flex-1 min-w-[100px] sm:min-w-[120px] text-sm"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={handleStartInterview}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Questions...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Start Interview Simulation
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
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
              {recentEntries.length > 0 ? (
                <div className="space-y-3">
                  {recentEntries.map((entry) => (
                    <div
                      key={entry.entryID}
                      className="flex items-center justify-between p-3 rounded-lg bg-blue-50/50 hover:bg-blue-50 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-blue-900">{entry.jobTitle}</p>
                        <p className="text-xs text-blue-600 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-xs text-blue-500">{entry.questionCount} questions</span>
                    </div>
                  ))}
                  <Link href="/history">
                    <Button variant="link" className="mt-2 text-blue-600 hover:text-blue-700 w-full">
                      View all history
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center text-blue-600 py-8">
                  <p>No recent simulations found</p>
                  <Link href="/history">
                    <Button variant="link" className="mt-2 text-blue-600 hover:text-blue-700">
                      View all history
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/profile">
            <Card className="border-cyan-100 bg-white/80 backdrop-blur-md shadow-lg hover:shadow-xl transition-all cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-cyan-900">Manage Profile</h3>
                <p className="text-sm text-cyan-600">Update your information</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/history">
            <Card className="border-purple-100 bg-white/80 backdrop-blur-md shadow-lg hover:shadow-xl transition-all cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-purple-900">View History</h3>
                <p className="text-sm text-purple-600">See past interviews</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/results">
            <Card className="border-blue-100 bg-white/80 backdrop-blur-md shadow-lg hover:shadow-xl transition-all cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-blue-900">Latest Results</h3>
                <p className="text-sm text-blue-600">View your performance</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
