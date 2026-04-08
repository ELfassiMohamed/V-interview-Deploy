"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  signIn as apiSignIn,
  signUp as apiSignUp,
  signOut as apiSignOut,
  getProfile,
  type AuthUser,
  type UserProfile,
} from "@/lib/api"

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthContextType {
  user: UserProfile | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (username: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Routes that don't require authentication
const PUBLIC_ROUTES = ["/", "/auth"]

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const isAuthenticated = !!token && !!user

  // Restore session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token")
    if (storedToken) {
      setToken(storedToken)
      getProfile()
        .then((profile) => {
          setUser(profile)
        })
        .catch(() => {
          // Token is invalid, clear it
          localStorage.removeItem("auth_token")
          setToken(null)
          setUser(null)
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [])

  // Redirect unauthenticated users from protected routes
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !PUBLIC_ROUTES.includes(pathname)) {
      router.push("/auth")
    }
  }, [isLoading, isAuthenticated, pathname, router])

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiSignIn({ email, password })
    localStorage.setItem("auth_token", response.token)
    setToken(response.token)
    // Fetch full profile after login
    const profile = await getProfile()
    setUser(profile)
  }, [])

  const signup = useCallback(async (username: string, email: string, password: string) => {
    const response = await apiSignUp({
      username,
      email,
      password,
      password_confirm: password,
    })
    localStorage.setItem("auth_token", response.token)
    setToken(response.token)
    // Fetch full profile after signup
    const profile = await getProfile()
    setUser(profile)
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiSignOut()
    } catch {
      // Even if the server call fails, clear local state
    }
    localStorage.removeItem("auth_token")
    setToken(null)
    setUser(null)
    router.push("/auth")
  }, [router])

  const refreshProfile = useCallback(async () => {
    const profile = await getProfile()
    setUser(profile)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        signup,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
