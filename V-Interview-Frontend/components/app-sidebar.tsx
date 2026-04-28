"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { BarChart3, History, User, LogOut, ChevronLeft, ChevronRight, Brain, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

interface AppSidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function AppSidebar({ isOpen, onToggle }: AppSidebarProps) {
  const pathname = usePathname()
  const { logout } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Sync collapsed state with screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Profile", href: "/profile", icon: User },
    { name: "History", href: "/history", icon: History },
  ]

  const toggleCollapsed = () => setIsCollapsed(!isCollapsed)

  return (
    <>
      {/* Mobile Toggle Button (Visible when sidebar is closed on mobile) */}
      {!isOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="fixed top-4 left-4 z-[60] md:hidden bg-white shadow-md rounded-lg"
        >
          <Menu className="h-5 w-5 text-purple-600" />
        </Button>
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-[calc(100vh-32px)] m-4 bg-white border border-gray-100 shadow-xl rounded-2xl transition-all duration-400 ease-in-out flex flex-col",
          isCollapsed ? "w-[85px]" : "w-[270px]",
          // Mobile visibility
          isOpen ? "translate-x-0" : "-translate-x-[calc(100%+32px)] md:translate-x-0",
          // Layout context
          "md:sticky"
        )}
      >
        {/* Header */}
        <header className="relative flex items-center justify-between p-6 h-24">
          <Link href="/" className={cn("flex items-center gap-3 transition-opacity duration-300", isCollapsed && "opacity-0 pointer-events-none")}>
            <div className="h-10 w-10 min-w-[40px] bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent whitespace-nowrap">
              VInterview
            </span>
          </Link>

          {/* Desktop Toggler */}
          <button
            onClick={toggleCollapsed}
            className={cn(
              "hidden md:flex absolute items-center justify-center h-9 w-9 bg-purple-50 text-purple-600 rounded-lg border border-purple-100 hover:bg-purple-100 transition-all duration-400",
              isCollapsed ? "left-1/2 -translate-x-1/2 top-[70px]" : "right-6"
            )}
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>

          {/* Mobile Close Toggler */}
          <Button variant="ghost" size="icon" onClick={onToggle} className="md:hidden">
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          </Button>
        </header>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col justify-between py-4">
          {/* Primary Nav */}
          <ul className="px-4 space-y-2">
            {navItems.map((item) => (
              <li key={item.href} className="group relative">
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300",
                    pathname === item.href
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-100"
                      : "text-gray-600 hover:bg-purple-50 hover:text-purple-700"
                  )}
                  onClick={() => {
                    if (window.innerWidth < 768) onToggle()
                  }}
                >
                  <item.icon className="h-5 w-5 min-w-[20px]" />
                  <span className={cn("font-medium transition-opacity duration-300", isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100")}>
                    {item.name}
                  </span>
                </Link>
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <span className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 whitespace-nowrap z-[70]">
                    {item.name}
                  </span>
                )}
              </li>
            ))}
          </ul>

          {/* Secondary Nav */}
          <ul className="px-4 pb-4 space-y-2">
            <li className="group relative">
              <button
                onClick={logout}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-300"
              >
                <LogOut className="h-5 w-5 min-w-[20px]" />
                <span className={cn("font-medium transition-opacity duration-300", isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100")}>
                  Logout
                </span>
              </button>
              {isCollapsed && (
                <span className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 whitespace-nowrap z-[70]">
                  Logout
                </span>
              )}
            </li>
          </ul>
        </nav>
      </aside>
    </>
  )
}

