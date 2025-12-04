"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getWithExpiry, setWithExpiry } from "@/lib/utils/localStorageWithExpiry" // Check your path

export interface User {
  id: string
  username: string
  role: "admin" | "hotel"
  hotelId?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const AUTH_KEY = "ACCESS_TOKEN"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  // Initialize loading as TRUE. We don't know the auth state yet.
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Define route lists
  const protectedRoutePrefixes = ["/admin", "/dashboard", "/profile"]
  const authRoutes = ["/auth/login", "/auth/signup"]

  // 1. INITIAL CHECK: Run only once on mount to verify token
  useEffect(() => {
    const initAuth = async () => {
      const token = getWithExpiry(AUTH_KEY)

      if (!token) {
        // No token? We are done loading, user is null.
        setUser(null)
        setLoading(false)
        return
      }

      try {
        // Token exists, verify it with API
        const response = await fetch(`/api/auth/me?token=${token}`)
        
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
          // Optional: Refresh token expiry
          setWithExpiry(AUTH_KEY, token, 3600000) 
        } else {
          // Token invalid (expired or revoked on server)
          throw new Error("Invalid token")
        }
      } catch (err) {
        console.error("Auth initialization failed:", err)
        localStorage.removeItem(AUTH_KEY)
        setUser(null)
      } finally {
        // Crucial: Only turn off loading after API call finishes
        setLoading(false)
      }
    }

    initAuth()
  }, []) // Empty dependency array = runs once on reload

  // 2. ROUTE PROTECTION: Run whenever User, Loading, or Pathname changes
  useEffect(() => {
    // STOP! Do not redirect if we are still fetching the user.
    if (loading) return

    const currentPath = pathname || ""
    const isProtectedRoute = protectedRoutePrefixes.some((prefix) =>
      currentPath.startsWith(prefix)
    )
    const isAuthPage = authRoutes.includes(currentPath)

    if (!user && isProtectedRoute) {
      // Scenario: User is NOT logged in, trying to access Dashboard
      console.log("Unauthenticated access attempt. Redirecting to login.")
      router.push("/auth/login")
    } 
    else if (user && isAuthPage) {
      // Scenario: User IS logged in, manually went to /auth/login
      console.log("Already logged in. Redirecting to dashboard.")
      if (user.role === "admin") {
        router.push("/admin")
      } else {
        router.push(`/dashboard/hotels/${user.hotelId || "demo"}`)
      }
    }
  }, [user, loading, pathname]) // Re-run logic when these change

  // --- Login Function ---
  const login = async (username: string, password: string) => {
    try {
      setError(null)
      setLoading(true)

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // 1. Save Token
        setWithExpiry(AUTH_KEY, data.token, 3600000)
        
        // 2. Set User
        setUser(data.user)
        
        // 3. Navigate
        if (data.user.role === "admin") {
          router.push("/admin")
        } else {
          router.push(`/dashboard/hotels/${data.user.hotelId || "demo"}`)
        }
        router.refresh()
      } else {
        setError(data.error || "Login failed")
      }
    } catch (err) {
      setError("Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  // --- Logout Function ---
  const logout = () => {
    setUser(null)
    localStorage.removeItem(AUTH_KEY)
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        error,
      }}
    >
      {/* OPTIONAL: You can block rendering children entirely while loading 
        to prevent "flashes" of protected content.
      */}
      {children}
      {loading && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/20 backdrop-blur-sm">
    <div className="flex space-x-3">
      {/* Dot 1 */}
      <div className="h-6 w-6 animate-bounce rounded-full bg-rose-600 [animation-delay:-0.3s]"></div>
      {/* Dot 2 */}
      <div className="h-6 w-6 animate-bounce rounded-full bg-rose-600 [animation-delay:-0.15s]"></div>
      {/* Dot 3 */}
      <div className="h-6 w-6 animate-bounce rounded-full bg-rose-600"></div>
    </div>
  </div>
)}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}