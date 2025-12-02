"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getWithExpiry, setWithExpiry } from "../utils/localStorageWithExpiry"

export interface User {
  id: string
  username: string
  role: "admin" | "hotel" | "customer"
  hotelId?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  error: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const AUTH_KEY = "ACCESS_TOKEN"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error,setError] = useState("")


  useEffect(() => {
    const protectedRoutePrefixes = ['/admin', '/dashboard', '/profile'] // add other protected route prefixes
    const publicPaths = ['/auth/login', '/auth/signup', '/']

    const path = window.location.pathname

    const checkAuth = async () => {
      const token = getWithExpiry(AUTH_KEY)
      if (token) {
        try {
          const response = await fetch(`/api/auth/me?token=${token}`)
          if (response.ok) {
            const userData = await response.json()
            console.log(userData)
            setUser(userData)
            setWithExpiry(AUTH_KEY, token, 3600000) // refresh expiry
            setIsAuthenticated(true)
            // Redirect if user is accessing login/signup but already logged in
            if (path === '/auth/login' || path === '/auth/signup') {
              if(userData?.role === "admin"){
                router.push("/admin")
              } else {
                router.push(`/dashboard/hotels/${userData.hotelId}`)
              }
            }
          } else {
            router.push('/auth/login') // token invalid, redirect to login
          }
        } catch (error) {
          console.error('Auth check failed:', error)
          router.push('/auth/login')
        } finally {
          setLoading(false)
        }
      } else {
        // Only redirect to login if on protected route
        if (protectedRoutePrefixes.some(prefix => path.startsWith(prefix))) {
          router.push('/auth/login') // no token, redirect to login
        }
        setLoading(false)
      }
    }

    // Run auth check on protected routes or on login/signup if token exists
    if (
      protectedRoutePrefixes.some(prefix => path.startsWith(prefix)) ||
      (publicPaths.includes(path) && path !== '/' && getWithExpiry(AUTH_KEY))
    ) {
      checkAuth()
    } else {
      setLoading(false)
    }
  }, [router])


  const login = async (username: string, password: string) => {
    try {
      setError("")
      setLoading(true)
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log(data);
        setUser(data.user)
        setWithExpiry(AUTH_KEY, data.token, 3600000)
        setIsAuthenticated(true)
        if (data.user.role === "admin") {
          router.push("/admin")
        } else {
          router.push(`/dashboard/hotels/${data?.user?.hotelId || "demo"}`);
        }

      } else {
        const errorData = await response.json();
        setError(errorData.error || "Login failed");
        console.log(errorData);
      }
    } catch {
      setError("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem(AUTH_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, error, isAuthenticated: !!user || isAuthenticated}}>
      {children}
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
