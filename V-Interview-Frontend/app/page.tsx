import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles, Rocket } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-cyan-600/10"></div>
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-2000"></div>

          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge
                  variant="secondary"
                  className="mb-4 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-purple-200"
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  AI-Powered Interview Practice
                </Badge>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none">
                  Master Your Next
                  <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    {" "}
                    Job Interview
                  </span>
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl lg:text-2xl">
                  Practice with our AI interviewer, get personalized feedback, and boost your confidence. Land your
                  dream job with realistic interview simulations.
                </p>
              </div>
              <div className="space-x-4 pt-6">
                <Link href="/auth">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Rocket className="mr-2 h-5 w-5" />
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-purple-50 to-blue-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  How It Works
                </h2>
                <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Get started in just three simple steps
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white text-2xl font-bold shadow-lg">
                  1
                </div>
                <h3 className="text-xl font-bold text-purple-900">Enter job requirements</h3>
                <p className="text-gray-600">Specify the job role and requirements for a tailored interview simulation.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-2xl font-bold shadow-lg">
                  2
                </div>
                <h3 className="text-xl font-bold text-blue-900">Practice Interview</h3>
                <p className="text-gray-600">Engage in a realistic conversation with our AI interviewer.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-2xl font-bold shadow-lg">
                  3
                </div>
                <h3 className="text-xl font-bold text-cyan-900">Get Feedback</h3>
                <p className="text-gray-600">Receive detailed feedback and recommendations for improvement.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-4 py-8 w-full shrink-0 items-center px-4 md:px-6 border-t bg-white">
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-gray-500">© 2024 VInterview. All rights reserved.</p>
          <p className="text-xs text-gray-400 text-center">
            This project is currently under development as an MVP. VInterview is open source on{" "}
            <Link
              href="https://github.com/ELfassiMohamed/V-interview-Deploy"
              className="text-purple-600 hover:underline font-medium"
            >
              GitHub
            </Link>
          </p>
        </div>
        <nav className="flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4 text-gray-500 hover:text-purple-600" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4 text-gray-500 hover:text-purple-600" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
