"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Camera, Save, Brain, ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    bio: "Passionate frontend developer with 5+ years of experience in React and modern web technologies.",
    avatarUrl: "/placeholder.svg?height=100&width=100",
  })

  const mockInterviews = [
    { id: 1, jobTitle: "Frontend Developer", date: "2023-04-15", score: 8.5 },
    { id: 2, jobTitle: "React Developer", date: "2023-03-22", score: 7.2 },
    { id: 3, jobTitle: "UI/UX Designer", date: "2023-02-10", score: 9.0 },
  ]

  const handleSaveProfile = () => {
    setIsEditing(false)
    toast({
      title: "Profile Updated",
      description: "Your profile information has been successfully updated.",
    })
  }

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileData({ ...profileData, avatarUrl: e.target?.result as string })
      }
      reader.readAsDataURL(file)
      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been updated successfully.",
      })
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
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-4 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              User Profile
            </h1>
            <p className="text-gray-600">Manage your personal information and interview history</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1 border-purple-100 bg-white/80 backdrop-blur-md shadow-xl">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                <CardTitle className="text-purple-900 flex items-center">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Profile Picture
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center p-6">
                <div className="relative mb-4">
                  <Avatar className="h-32 w-32 border-4 border-purple-200 shadow-lg">
                    <AvatarImage src={profileData.avatarUrl || "/placeholder.svg"} alt={profileData.name} />
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-2xl">
                      {profileData.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 cursor-pointer">
                    <Button
                      size="icon"
                      className="rounded-full h-10 w-10 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg"
                      asChild
                    >
                      <div>
                        <Camera className="h-5 w-5" />
                        <span className="sr-only">Upload profile picture</span>
                      </div>
                    </Button>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </label>
                </div>
                <p className="text-lg font-medium text-center text-purple-900">{profileData.name}</p>
                <p className="text-sm text-purple-600 text-center">{profileData.email}</p>
                <p className="text-sm text-purple-500 text-center">{profileData.location}</p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 border-blue-100 bg-white/80 backdrop-blur-md shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-blue-900">Profile Information</CardTitle>
                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSaveProfile}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-purple-900">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        disabled={!isEditing}
                        className="border-purple-200 focus:border-purple-400 focus:ring-purple-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-purple-900">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        disabled={!isEditing}
                        className="border-purple-200 focus:border-purple-400 focus:ring-purple-200"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-purple-900">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        disabled={!isEditing}
                        className="border-purple-200 focus:border-purple-400 focus:ring-purple-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-purple-900">
                        Location
                      </Label>
                      <Input
                        id="location"
                        value={profileData.location}
                        onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                        disabled={!isEditing}
                        className="border-purple-200 focus:border-purple-400 focus:ring-purple-200"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-purple-900">
                      Bio
                    </Label>
                    <textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      disabled={!isEditing}
                      className="w-full min-h-[80px] px-3 py-2 border border-purple-200 rounded-md focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  {isEditing && (
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-purple-900">
                        New Password
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Leave blank to keep current password"
                        className="border-purple-200 focus:border-purple-400 focus:ring-purple-200"
                      />
                    </div>
                  )}
                  {/* Add this new section */}
                  <div className="pt-6 border-t border-red-100">
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium text-red-900">Danger Zone</h3>
                      <p className="text-sm text-red-600">
                        Once you delete your profile, there is no going back. Please be certain.
                      </p>
                      <Button
                        variant="destructive"
                        className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to delete your profile? This action cannot be undone.",
                            )
                          ) {
                            toast({
                              title: "Profile Deletion Requested",
                              description:
                                "Your profile deletion request has been submitted. You will be contacted within 24 hours.",
                            })
                          }
                        }}
                      >
                        Delete Profile
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="md:col-span-3 border-cyan-100 bg-white/80 backdrop-blur-md shadow-xl">
              <CardHeader className="bg-gradient-to-r from-cyan-50 to-purple-50">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-cyan-900">Interview History</CardTitle>
                  <Link href="/history">
                    <Button variant="outline" className="border-cyan-200 text-cyan-700 hover:bg-cyan-50">
                      View All
                    </Button>
                  </Link>
                </div>
                <CardDescription>Your recent interview simulations</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-purple-900">Job Title</TableHead>
                      <TableHead className="text-purple-900">Date</TableHead>
                      <TableHead className="text-purple-900">Score</TableHead>
                      <TableHead className="text-right text-purple-900">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockInterviews.map((interview) => (
                      <TableRow key={interview.id}>
                        <TableCell className="font-medium">{interview.jobTitle}</TableCell>
                        <TableCell>{new Date(interview.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              interview.score >= 8
                                ? "bg-green-100 text-green-800"
                                : interview.score >= 6
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {interview.score}/10
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/results/${interview.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                            >
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
          </div>
        </div>
      </div>
    </div>
  )
}
