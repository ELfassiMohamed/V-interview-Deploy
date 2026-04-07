"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BarChart3, FileText, History, User, LogOut, X, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { apiRequest, clearAuthSession, getStoredUser } from "@/lib/api"
import { useMemo } from "react"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "New Interview", href: "/dashboard", icon: FileText },
  { name: "History", href: "/history", icon: History },
  { name: "Profile", href: "/profile", icon: User },
]

interface AppSidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function AppSidebar({ isOpen, onToggle }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const user = useMemo(() => getStoredUser(), [pathname])

  const handleLogout = async () => {
    try {
      await apiRequest<{ message: string }>("/auth/signout/", { method: "POST" })
    } catch {
      // Ignore signout API errors and clear local session anyway
    }

    clearAuthSession()
    router.push("/auth")
  }

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onToggle} />}

      <div
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 bg-white border-r transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">VInterview</span>
            </Link>
            <Button variant="ghost" size="icon" onClick={onToggle} className="md:hidden">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 px-3 py-4">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-purple-50 hover:text-purple-700",
                    pathname === item.href
                      ? "bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 border-r-2 border-purple-600"
                      : "text-gray-700",
                  )}
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      onToggle()
                    }
                  }}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="p-4 border-t">
            <div className="flex items-center justify-between rounded-lg border p-3 bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                    {(user?.username?.[0] || "U").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user?.username || "Guest"}</p>
                  <p className="text-xs text-gray-500">{user?.email || ""}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-red-600" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
