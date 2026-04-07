"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Facebook, Github, Brain, Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { apiRequest, parseApiError, setAuthSession, getAuthToken, type AuthUser } from "@/lib/api"

type AuthResponse = {
  token: string
  user: AuthUser
  message: string
}

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [signInForm, setSignInForm] = useState({ email: "", password: "" })
  const [signUpForm, setSignUpForm] = useState({ username: "", email: "", password: "", passwordConfirm: "" })
  const router = useRouter()

  useEffect(() => {
    if (getAuthToken()) {
      router.replace("/dashboard")
    }
  }, [router])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await apiRequest<AuthResponse>("/auth/signin/", {
        method: "POST",
        body: signInForm,
      })

      setAuthSession(response.token, response.user)
      router.push("/dashboard")
    } catch (err) {
      setError(parseApiError(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await apiRequest<AuthResponse>("/auth/signup/", {
        method: "POST",
        body: {
          username: signUpForm.username,
          email: signUpForm.email,
          password: signUpForm.password,
          password_confirm: signUpForm.passwordConfirm,
        },
      })

      setAuthSession(response.token, response.user)
      router.push("/dashboard")
    } catch (err) {
      setError(parseApiError(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
      <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-2000"></div>

      <div className="container flex h-screen w-screen flex-col items-center justify-center relative z-10">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
          <div className="flex flex-col space-y-4 text-center">
            <Link href="/" className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 mr-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Brain className="h-7 w-7 text-white" />
              </div>
              <span className="font-bold text-3xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                VInterview
              </span>
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight text-purple-900">Welcome back</h1>
            <p className="text-sm text-gray-600">Sign in to your account to continue your interview journey</p>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-md">
              <TabsTrigger value="signin" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-50 data-[state=active]:to-blue-50 data-[state=active]:text-purple-700">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-50 data-[state=active]:to-blue-50 data-[state=active]:text-purple-700">
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <Card className="border-purple-100 bg-white/80 backdrop-blur-md shadow-xl">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                  <CardTitle className="flex items-center text-purple-900">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Sign In
                  </CardTitle>
                  <CardDescription>Enter your email and password to sign in to your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-purple-900">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={signInForm.email}
                        onChange={(e) => setSignInForm((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="name@example.com"
                        required
                        className="border-purple-200 focus:border-purple-400 focus:ring-purple-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-purple-900">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={signInForm.password}
                        onChange={(e) => setSignInForm((prev) => ({ ...prev, password: e.target.value }))}
                        required
                        className="border-purple-200 focus:border-purple-400 focus:ring-purple-200"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg" disabled={isLoading}>
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>

                  {error ? <p className="text-sm text-red-600">{error}</p> : null}

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-purple-200" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500">Or continue with</span></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" type="button" className="border-purple-200 hover:bg-purple-50"><Github className="mr-2 h-4 w-4" />Google</Button>
                    <Button variant="outline" type="button" className="border-purple-200 hover:bg-purple-50"><Facebook className="mr-2 h-4 w-4" />Facebook</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <Card className="border-purple-100 bg-white/80 backdrop-blur-md shadow-xl">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                  <CardTitle className="flex items-center text-purple-900"><Sparkles className="mr-2 h-5 w-5" />Create an account</CardTitle>
                  <CardDescription>Enter your information to create an account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-purple-900">Username</Label>
                      <Input
                        id="name"
                        value={signUpForm.username}
                        onChange={(e) => setSignUpForm((prev) => ({ ...prev, username: e.target.value }))}
                        placeholder="john_doe"
                        required
                        className="border-purple-200 focus:border-purple-400 focus:ring-purple-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-signup" className="text-purple-900">Email</Label>
                      <Input
                        id="email-signup"
                        type="email"
                        value={signUpForm.email}
                        onChange={(e) => setSignUpForm((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="name@example.com"
                        required
                        className="border-purple-200 focus:border-purple-400 focus:ring-purple-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-signup" className="text-purple-900">Password</Label>
                      <Input
                        id="password-signup"
                        type="password"
                        value={signUpForm.password}
                        onChange={(e) => setSignUpForm((prev) => ({ ...prev, password: e.target.value }))}
                        required
                        className="border-purple-200 focus:border-purple-400 focus:ring-purple-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-signup-confirm" className="text-purple-900">Confirm Password</Label>
                      <Input
                        id="password-signup-confirm"
                        type="password"
                        value={signUpForm.passwordConfirm}
                        onChange={(e) => setSignUpForm((prev) => ({ ...prev, passwordConfirm: e.target.value }))}
                        required
                        className="border-purple-200 focus:border-purple-400 focus:ring-purple-200"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg" disabled={isLoading}>
                      {isLoading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>

                  {error ? <p className="text-sm text-red-600">{error}</p> : null}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
