"use client"

import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useState } from "react"
import { usePathname } from "next/navigation"

export function ClientSidebar({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Don't show sidebar on landing page and auth page
  const showSidebar = pathname !== "/" && pathname !== "/auth"

  if (!showSidebar) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
