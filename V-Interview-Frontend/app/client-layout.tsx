"use client"

import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useState } from "react"
import { usePathname } from "next/navigation"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Don't show sidebar on landing page and auth page
  const showSidebar = pathname !== "/" && !pathname.startsWith("/auth")

  if (!showSidebar) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b bg-white sticky top-0 z-30">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            VInterview
          </span>
          <div className="w-10"></div>
        </div>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
