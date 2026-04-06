"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useState } from "react"
import { usePathname } from "next/navigation"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Don't show sidebar on landing page and auth page
  const showSidebar = pathname !== "/" && pathname !== "/auth"

  return (
    <html lang="en">
      <head>
        <title>VInterview - Master Your Next Job Interview</title>
        <meta
          name="description"
          content="Practice with our AI interviewer, get personalized feedback, and boost your confidence. Land your dream job with realistic interview simulations."
        />
      </head>
      <body className={cn(inter.className, "min-h-screen bg-background font-sans antialiased")}>
        {showSidebar ? (
          <div className="flex min-h-screen">
            <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
            <div className="flex-1 flex flex-col">
              {/* Mobile Header */}
              <div className="md:hidden flex items-center justify-between p-4 border-b bg-white">
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
                  <Menu className="h-5 w-5" />
                </Button>
                <span className="font-semibold">VInterview</span>
                <div></div>
              </div>
              <main className="flex-1 overflow-auto">{children}</main>
            </div>
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  )
}
