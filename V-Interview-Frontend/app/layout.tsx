import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import ClientLayout from "./client-layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "VInterview - Master Your Next Job Interview",
  description:
    "Practice with our AI interviewer, get personalized feedback, and boost your confidence. Land your dream job with realistic interview simulations.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          inter.className,
          "min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 font-sans antialiased",
        )}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
