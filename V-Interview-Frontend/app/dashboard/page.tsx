import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FileText, Brain, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
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
              <CardDescription>Upload your resume and paste the job description to begin</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="job-title" className="text-sm font-medium text-purple-900">
                      Job Title
                    </label>
                    <Input
                      id="job-title"
                      placeholder="e.g. Front End Dev"
                      defaultValue="Front End Dev"
                      className="border-purple-200 focus:border-purple-400 focus:ring-purple-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="experience-level" className="text-sm font-medium text-purple-900">
                      Experience Level
                    </label>
                    <select
                      id="experience-level"
                      defaultValue="Mid-level"
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
                    {["CSS", "HTML", "JavaScript", "React"].map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 sm:px-3 sm:py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full text-xs sm:text-sm flex items-center whitespace-nowrap"
                      >
                        {skill}
                        <button className="ml-1 sm:ml-1.5 text-purple-500 hover:text-purple-700 text-sm">×</button>
                      </span>
                    ))}
                    <Input
                      id="skills"
                      placeholder="Add a skill..."
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
                      defaultValue="Technology"
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
                      defaultValue="English"
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
                      defaultValue="Full-time"
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
                      className="border-purple-200 focus:border-purple-400 focus:ring-purple-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="preferred-technologies" className="text-sm font-medium text-purple-900">
                    Preferred Technologies
                  </label>
                  <div className="flex flex-wrap gap-2 p-3 border rounded-md border-purple-200 bg-white min-h-[44px]">
                    {["Next.js"].map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-1 sm:px-3 sm:py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 rounded-full text-xs sm:text-sm flex items-center whitespace-nowrap"
                      >
                        {tech}
                        <button className="ml-1 sm:ml-1.5 text-blue-500 hover:text-blue-700 text-sm">×</button>
                      </span>
                    ))}
                    <Input
                      id="preferred-technologies"
                      placeholder="Add a technology..."
                      className="border-0 focus:ring-0 flex-1 min-w-[100px] sm:min-w-[120px] text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="soft-skills" className="text-sm font-medium text-purple-900">
                    Soft Skills
                  </label>
                  <div className="flex flex-wrap gap-2 p-3 border rounded-md border-purple-200 bg-white min-h-[44px]">
                    {["Communication", "Problem Solving", "Leadership"].map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 sm:px-3 sm:py-1 bg-gradient-to-r from-cyan-100 to-purple-100 text-cyan-700 rounded-full text-xs sm:text-sm flex items-center whitespace-nowrap"
                      >
                        {skill}
                        <button className="ml-1 sm:ml-1.5 text-cyan-500 hover:text-cyan-700 text-sm">×</button>
                      </span>
                    ))}
                    <Input
                      id="soft-skills"
                      placeholder="Add a soft skill..."
                      className="border-0 focus:ring-0 flex-1 min-w-[100px] sm:min-w-[120px] text-sm"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Link href="/interview">
                    <Button
                      size="lg"
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Start Interview Simulation
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
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
                  <p>No recent simulations found</p>
                  <Link href="/history">
                    <Button variant="link" className="mt-2 text-blue-600 hover:text-blue-700">
                      View all history
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

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
