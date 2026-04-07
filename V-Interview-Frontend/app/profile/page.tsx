"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import { apiRequest, clearAuthSession, getAuthToken, parseApiError, setStoredUser } from "@/lib/api"
import { useRouter } from "next/navigation"

type ProfileResponse = {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  date_joined: string
}

type HistoryResponse = {
  success: boolean
  history: Array<{
    entryID: number
    jobTitle: string
    createdAt: string
    results?: {
      overallScore: number
    }
  }>
}

export default function ProfilePage() {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState<HistoryResponse["history"]>([])
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    avatarUrl: "/placeholder.svg?height=100&width=100",
  })

  useEffect(() => {
    if (!getAuthToken()) {
      router.replace("/auth")
      return
    }

    const load = async () => {
      try {
        const [profile, historyRes] = await Promise.all([
          apiRequest<ProfileResponse>("/auth/profile/"),
          apiRequest<HistoryResponse>("/ai/interview-history/"),
        ])

        setProfileData((prev) => ({
          ...prev,
          username: profile.username,
          email: profile.email,
          first_name: profile.first_name,
          last_name: profile.last_name,
        }))
        setHistory(historyRes.history)
      } catch (err) {
        toast({ title: "Error", description: parseApiError(err), variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [router])

  const handleSaveProfile = async () => {
    try {
      const response = await apiRequest<{ user: ProfileResponse }>("/auth/profile/update/", {
        method: "PATCH",
        body: {
          username: profileData.username,
          email: profileData.email,
          first_name: profileData.first_name,
          last_name: profileData.last_name,
        },
      })

      setStoredUser({
        id: response.user.id,
        username: response.user.username,
        email: response.user.email,
      })

      setIsEditing(false)
      toast({ title: "Profile Updated", description: "Your profile information has been successfully updated." })
    } catch (err) {
      toast({ title: "Error", description: parseApiError(err), variant: "destructive" })
    }
  }

  const handleDeleteProfile = async () => {
    if (!window.confirm("Are you sure you want to delete your profile? This action cannot be undone.")) {
      return
    }

    try {
      await apiRequest<{ message: string }>("/auth/profile/delete/", { method: "DELETE" })
      clearAuthSession()
      toast({ title: "Profile Deleted", description: "Your account has been deleted." })
      router.push("/auth")
    } catch (err) {
      toast({ title: "Error", description: parseApiError(err), variant: "destructive" })
    }
  }

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      setProfileData((prev) => ({ ...prev, avatarUrl: e.target?.result as string }))
      toast({ title: "Profile Picture Updated", description: "Your profile picture has been updated successfully." })
    }
    reader.readAsDataURL(file)
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading profile...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">User Profile</h1>
          <p className="text-gray-600">Manage your personal information and interview history</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 border-purple-100 bg-white/80 backdrop-blur-md shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50"><CardTitle className="text-purple-900">Profile Picture</CardTitle></CardHeader>
            <CardContent className="flex flex-col items-center p-6">
              <div className="relative mb-4">
                <Avatar className="h-32 w-32 border-4 border-purple-200 shadow-lg">
                  <AvatarImage src={profileData.avatarUrl || "/placeholder.svg"} alt={profileData.username} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-2xl">{(profileData.first_name?.[0] || profileData.username?.[0] || "U").toUpperCase()}</AvatarFallback>
                </Avatar>
                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 cursor-pointer">
                  <Button size="icon" className="rounded-full h-10 w-10 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg" asChild>
                    <div><span className="sr-only">Upload profile picture</span>+</div>
                  </Button>
                  <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </label>
              </div>
              <p className="text-lg font-medium text-center text-purple-900">{profileData.first_name} {profileData.last_name}</p>
              <p className="text-sm text-purple-600 text-center">@{profileData.username}</p>
              <p className="text-sm text-purple-500 text-center">{profileData.email}</p>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 border-blue-100 bg-white/80 backdrop-blur-md shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <div className="flex justify-between items-center">
                <CardTitle className="text-blue-900">Profile Information</CardTitle>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">Edit Profile</Button>
                ) : (
                  <Button onClick={handleSaveProfile} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">Save Changes</Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-purple-900">Username</Label>
                    <Input id="username" value={profileData.username} onChange={(e) => setProfileData((prev) => ({ ...prev, username: e.target.value }))} disabled={!isEditing} className="border-purple-200 focus:border-purple-400 focus:ring-purple-200" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-purple-900">Email</Label>
                    <Input id="email" type="email" value={profileData.email} onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))} disabled={!isEditing} className="border-purple-200 focus:border-purple-400 focus:ring-purple-200" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name" className="text-purple-900">First Name</Label>
                    <Input id="first_name" value={profileData.first_name} onChange={(e) => setProfileData((prev) => ({ ...prev, first_name: e.target.value }))} disabled={!isEditing} className="border-purple-200 focus:border-purple-400 focus:ring-purple-200" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name" className="text-purple-900">Last Name</Label>
                    <Input id="last_name" value={profileData.last_name} onChange={(e) => setProfileData((prev) => ({ ...prev, last_name: e.target.value }))} disabled={!isEditing} className="border-purple-200 focus:border-purple-400 focus:ring-purple-200" />
                  </div>
                </div>

                <div className="pt-6 border-t border-red-100">
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-red-900">Danger Zone</h3>
                    <p className="text-sm text-red-600">Once you delete your profile, there is no going back. Please be certain.</p>
                    <Button variant="destructive" className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600" onClick={handleDeleteProfile}>Delete Profile</Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="md:col-span-3 border-cyan-100 bg-white/80 backdrop-blur-md shadow-xl">
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-purple-50">
              <div className="flex justify-between items-center">
                <CardTitle className="text-cyan-900">Interview History</CardTitle>
                <Link href="/history"><Button variant="outline" className="border-cyan-200 text-cyan-700 hover:bg-cyan-50">View All</Button></Link>
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
                  {history.slice(0, 3).map((interview) => (
                    <TableRow key={interview.entryID}>
                      <TableCell className="font-medium">{interview.jobTitle}</TableCell>
                      <TableCell>{new Date(interview.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {typeof interview.results?.overallScore === "number" ? `${interview.results.overallScore}/100` : "Pending"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/results?entryId=${interview.entryID}`}>
                          <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50">View Report</Button>
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
  )
}
