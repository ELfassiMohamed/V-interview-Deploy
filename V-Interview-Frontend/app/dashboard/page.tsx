"use client"

import type React from "react"
import { useEffect, useState, type KeyboardEvent } from "react"
import { ArrowRight, FileText, Loader2, Sparkles, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import { generateQuestions, getUserEntries } from "@/lib/api"

type TokenFieldProps = {
  id: string
  label: string
  values: string[]
  setValues: React.Dispatch<React.SetStateAction<string[]>>
  inputValue: string
  setInputValue: React.Dispatch<React.SetStateAction<string>>
  placeholder: string
  tagClassName: string
  removeClassName: string
}

function TokenField({
  id,
  label,
  values,
  setValues,
  inputValue,
  setInputValue,
  placeholder,
  tagClassName,
  removeClassName,
}: TokenFieldProps) {
  const addTokens = (rawValue: string) => {
    const tokens = rawValue
      .split(/[,\n]/)
      .map((token) => token.trim())
      .filter(Boolean)

    if (tokens.length) {
      setValues((currentValues) => {
        const seen = new Set(currentValues.map((value) => value.toLowerCase()))
        const nextValues = [...currentValues]

        tokens.forEach((token) => {
          const normalizedToken = token.toLowerCase()

          if (!seen.has(normalizedToken)) {
            seen.add(normalizedToken)
            nextValues.push(token)
          }
        })

        return nextValues
      })
    }

    setInputValue("")
  }

  const removeToken = (value: string) => {
    setValues((currentValues) => currentValues.filter((item) => item !== value))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTokens(inputValue)
      return
    }

    if (e.key === "Backspace" && !inputValue && values.length) {
      setValues((currentValues) => currentValues.slice(0, -1))
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData("text")

    if (/[,;\n]/.test(pastedText)) {
      e.preventDefault()
      addTokens(pastedText.replace(/;/g, ","))
    }
  }

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-purple-900">
        {label}
      </label>
      <div className="flex min-h-[46px] flex-wrap items-center gap-2 rounded-md border border-purple-200 bg-white px-3 py-2 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-200">
        {values.map((value) => (
          <span
            key={value}
            className={`inline-flex max-w-full items-center gap-1 rounded-full px-3 py-1 text-sm ${tagClassName}`}
          >
            <span className="truncate">{value}</span>
            <button
              type="button"
              aria-label={`Remove ${value}`}
              className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${removeClassName}`}
              onClick={() => removeToken(value)}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={inputValue}
          onBlur={() => addTokens(inputValue)}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={values.length ? "" : placeholder}
          className="min-w-[140px] flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-gray-400"
        />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  // Form state
  const [jobTitle, setJobTitle] = useState("")
  const [experienceLevel, setExperienceLevel] = useState("Mid-level")
  const [jobDescription, setJobDescription] = useState("")
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

  // Fetch recent entries on mount
  useEffect(() => {
    if (isAuthenticated) {
      getUserEntries().catch(() => {}) // silently fail for recent entries
    }
  }, [isAuthenticated])

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
        industry,
        language,
        positionType,
        skills,
        certifications: certifications ? certifications.split(",").map((c) => c.trim()).filter(Boolean) : [],
        preferredTechnologies,
        softSkills,
        jobDescription,
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
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="container relative mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="mb-4 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
            Virtual Interview Simulator
          </h1>
          <p className="text-lg text-gray-600">Prepare for your next job interview with our AI-powered simulation</p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <span>{error}</span>
          </div>
        )}

        <Card className="mb-8 border-purple-100 bg-white/80 shadow-xl backdrop-blur-md">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
            <CardTitle className="flex items-center text-purple-900">
              <Sparkles className="mr-2 h-5 w-5" />
              Start a New Interview Simulation
            </CardTitle>
            <CardDescription>Fill in your details and let AI generate tailored interview questions</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="job-title" className="text-sm font-medium text-purple-900">
                    Job Title *
                  </label>
                  <Input
                    id="job-title"
                    placeholder="e.g. Full Stack Python Developer"
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
                    className="h-10 w-full rounded-md border border-purple-200 px-3 py-2 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  >
                    <option value="Entry-level">Entry-level</option>
                    <option value="Mid-level">Mid-level</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead</option>
                  </select>
                </div>
              </div>

              <TokenField
                id="skills"
                label="Skills"
                values={skills}
                setValues={setSkills}
                inputValue={skillInput}
                setInputValue={setSkillInput}
                placeholder="Add a skill and press Enter..."
                tagClassName="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700"
                removeClassName="text-purple-500 hover:bg-purple-200 hover:text-purple-700"
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="industry" className="text-sm font-medium text-purple-900">
                    Industry
                  </label>
                  <select
                    id="industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="h-10 w-full rounded-md border border-purple-200 px-3 py-2 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200"
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
                    className="h-10 w-full rounded-md border border-purple-200 px-3 py-2 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200"
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

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="position-type" className="text-sm font-medium text-purple-900">
                    Position Type
                  </label>
                  <select
                    id="position-type"
                    value={positionType}
                    onChange={(e) => setPositionType(e.target.value)}
                    className="h-10 w-full rounded-md border border-purple-200 px-3 py-2 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="certifications" className="text-sm font-medium text-purple-900">
                    Certifications (Optional)
                  </label>
                  <Input
                    id="certifications"
                    placeholder="e.g. AWS Certified Cloud Practitioner"
                    value={certifications}
                    onChange={(e) => setCertifications(e.target.value)}
                    className="border-purple-200 focus:border-purple-400 focus:ring-purple-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="job-description" className="text-sm font-medium text-purple-900">
                  Job Description
                </label>
                <Textarea
                  id="job-description"
                  placeholder="Describe the role, responsibilities, stack, and interview focus..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[120px] resize-y border-purple-200 focus:border-purple-400 focus:ring-purple-200"
                />
              </div>

              <TokenField
                id="preferred-technologies"
                label="Preferred Technologies"
                values={preferredTechnologies}
                setValues={setPreferredTechnologies}
                inputValue={techInput}
                setInputValue={setTechInput}
                placeholder="Add a technology and press Enter..."
                tagClassName="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700"
                removeClassName="text-blue-500 hover:bg-blue-200 hover:text-blue-700"
              />

              <TokenField
                id="soft-skills"
                label="Soft Skills"
                values={softSkills}
                setValues={setSoftSkills}
                inputValue={softSkillInput}
                setInputValue={setSoftSkillInput}
                placeholder="Add a soft skill and press Enter..."
                tagClassName="bg-gradient-to-r from-cyan-100 to-purple-100 text-cyan-700"
                removeClassName="text-cyan-500 hover:bg-cyan-200 hover:text-cyan-700"
              />

              <div className="pt-4">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg transition-all duration-300 hover:from-purple-700 hover:to-blue-700 hover:shadow-xl"
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
      </div>
    </div>
  )
}
