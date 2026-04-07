export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api").replace(/\/$/, "")

export type AuthUser = {
  id: number
  username: string
  email: string
}

type RequestOptions = {
  method?: ApiMethod
  body?: unknown
  token?: string | null
}

function toApiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${API_BASE_URL}${normalized}`
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("vinterview_token")
}

export function setAuthSession(token: string, user: AuthUser): void {
  if (typeof window === "undefined") return
  localStorage.setItem("vinterview_token", token)
  localStorage.setItem("vinterview_user", JSON.stringify(user))
}

export function setStoredUser(user: AuthUser): void {
  if (typeof window === "undefined") return
  localStorage.setItem("vinterview_user", JSON.stringify(user))
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem("vinterview_user")
  if (!raw) return null

  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("vinterview_token")
  localStorage.removeItem("vinterview_user")
}

export function saveCurrentInterviewSession(data: unknown): void {
  if (typeof window === "undefined") return
  localStorage.setItem("vinterview_current_interview", JSON.stringify(data))
}

export function getCurrentInterviewSession<T>(): T | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem("vinterview_current_interview")
  if (!raw) return null

  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function clearCurrentInterviewSession(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("vinterview_current_interview")
}

export function getLatestInterviewEntryId(): number | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem("vinterview_latest_entry_id")
  if (!raw) return null

  const value = Number(raw)
  return Number.isFinite(value) ? value : null
}

export function setLatestInterviewEntryId(entryId: number): void {
  if (typeof window === "undefined") return
  localStorage.setItem("vinterview_latest_entry_id", String(entryId))
}

export function parseApiError(err: unknown): string {
  if (err instanceof Error) {
    return err.message
  }

  return "Something went wrong. Please try again."
}

function extractError(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "Request failed"
  }

  const obj = payload as Record<string, unknown>
  if (typeof obj.error === "string") return obj.error
  if (typeof obj.message === "string") return obj.message
  if (typeof obj.detail === "string") return obj.detail

  for (const value of Object.values(obj)) {
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") {
      return value[0]
    }
    if (typeof value === "string") {
      return value
    }
  }

  return "Request failed"
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method || "GET"
  const token = options.token ?? getAuthToken()

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (token) {
    headers.Authorization = `Token ${token}`
  }

  const response = await fetch(toApiUrl(path), {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const raw = await response.text()
  let payload: unknown = {}

  if (raw) {
    try {
      payload = JSON.parse(raw)
    } catch {
      payload = { detail: raw }
    }
  }

  if (!response.ok) {
    throw new Error(extractError(payload))
  }

  return payload as T
}
