"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Camera, Save, Sparkles, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { updateProfile, deleteProfile, getInterviewHistory, type InterviewHistoryEntry } from "@/lib/api"

export default function ProfilePage() {
  const { user, refreshProfile, logout, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
  })
  const [recentInterviews, setRecentInterviews] = useState<InterviewHistoryEntry[]>([])

  // Sync profile data from auth context
  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username,
        email: user.email,
        first_name: user.first_name || "",
        last_name: user.last_name || "",
      })
    }
  }, [user])

  // Fetch recent interview history
  useEffect(() => {
    getInterviewHistory()
      .then((res) => setRecentInterviews(res.history.slice(0, 5)))
      .catch(() => {})
  }, [])

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      await updateProfile({
        username: profileData.username,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
      })
      await refreshProfile()
      setIsEditing(false)
      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated.",
      })
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: err.message || "Could not update your profile. Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteProfile = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your profile? This action cannot be undone."
      )
    ) {
      try {
        await deleteProfile()
        toast({
          title: "Profile Deleted",
          description: "Your profile has been deleted.",
        })
        await logout()
      } catch (err: any) {
        toast({
          title: "Delete Failed",
          description: err.message || "Could not delete your profile.",
        })
      }
    }
  }

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been updated successfully.",
      })
    }
  }

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  const userInitials = (profileData.first_name && profileData.last_name
    ? `${profileData.first_name[0]}${profileData.last_name[0]}`
    : profileData.username.substring(0, 2)
  ).toUpperCase()

  const displayName = profileData.first_name && profileData.last_name
    ? `${profileData.first_name} ${profileData.last_name}`
    : profileData.username

  return (
    <div className="container mx-auto px-4 py-8 relative">
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
                  <AvatarImage src="/placeholder.svg" alt={displayName} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-2xl">
                    {userInitials}
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
              <p className="text-lg font-medium text-center text-purple-900">{displayName}</p>
              <p className="text-sm text-purple-600 text-center">{profileData.email}</p>
              <p className="text-xs text-gray-500 text-center mt-1">
                Member since {user.date_joined ? new Date(user.date_joined).toLocaleDateString() : "—"}
              </p>
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
                    disabled={isSaving}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    {isSaving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name" className="text-purple-900">
                      First Name
                    </Label>
                    <Input
                      id="first_name"
                      value={profileData.first_name}
                      onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                      disabled={!isEditing}
                      className="border-purple-200 focus:border-purple-400 focus:ring-purple-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name" className="text-purple-900">
                      Last Name
                    </Label>
                    <Input
                      id="last_name"
                      value={profileData.last_name}
                      onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                      disabled={!isEditing}
                      className="border-purple-200 focus:border-purple-400 focus:ring-purple-200"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-purple-900">
                      Username
                    </Label>
                    <Input
                      id="username"
                      value={profileData.username}
                      onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
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
                      disabled
                      className="border-purple-200 bg-gray-50"
                    />
                  </div>
                </div>
                {/* Danger Zone */}
                <div className="pt-6 border-t border-red-100">
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-red-900">Danger Zone</h3>
                    <p className="text-sm text-red-600">
                      Once you delete your profile, there is no going back. Please be certain.
                    </p>
                    <Button
                      variant="destructive"
                      className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                      onClick={handleDeleteProfile}
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
              {recentInterviews.length > 0 ? (
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
                    {recentInterviews.map((entry) => (
                      <TableRow key={entry.entryID}>
                        <TableCell className="font-medium">{entry.jobTitle}</TableCell>
                        <TableCell>{new Date(entry.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {entry.results ? (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                entry.results.overallScore >= 76
                                  ? "bg-green-100 text-green-800"
                                  : entry.results.overallScore >= 50
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {entry.results.overallScore}/100
                            </span>
                          ) : (
                            <span className="text-gray-400">Pending</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {entry.status === "completed" && (
                            <Link href={`/results?entryId=${entry.entryID}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                              >
                                View Report
                              </Button>
                            </Link>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No interview history yet. Start your first interview!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
