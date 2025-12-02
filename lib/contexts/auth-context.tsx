"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation" // Import usePathname
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
  logout: () => void;
  isAuthenticated: boolean
  error: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const AUTH_KEY = "ACCESS_TOKEN"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname() // Use this hook to track URL changes
  
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Check Auth Status
  useEffect(() => {
    const protectedRoutePrefixes = ['/admin', '/dashboard', '/profile']
    const authRoutes = ['/auth/login', '/auth/signup']
    
    // Safety check: ensure pathname is defined (it might be null on initial server render)
    const currentPath = pathname || ""

    const checkAuth = async () => {
      const token = getWithExpiry(AUTH_KEY)

      if (token) {
        try {
          // Optimization: If we already have the user in state, don't re-fetch unless needed
          if (!user) {
            const response = await fetch(`/api/auth/me?token=${token}`)
            if (response.ok) {
              const userData = await response.json()
              setUser(userData)
              setWithExpiry(AUTH_KEY, token, 3600000) // Refresh expiry
              
              // If user is on login page but already logged in, redirect them
              if (authRoutes.includes(currentPath)) {
                if (userData?.role === "admin") {
                  router.replace("/admin") // Use replace to prevent "back" button history issues
                } else {
                  router.replace(`/dashboard/hotels/${userData.hotelId || 'demo'}`)
                }
              }
            } else {
              throw new Error("Token invalid")
            }
          }
        } catch (error) {
          console.error('Auth check failed:', error)
          localStorage.removeItem(AUTH_KEY)
          setUser(null)
          // Only redirect if on a protected route
          if (protectedRoutePrefixes.some(prefix => currentPath.startsWith(prefix))) {
            router.push('/auth/login')
          }
        } finally {
          setLoading(false)
        }
      } else {
        // No token found
        setUser(null)
        setLoading(false)
        if (protectedRoutePrefixes.some(prefix => currentPath.startsWith(prefix))) {
          router.push('/auth/login')
        }
      }
    }

    checkAuth()
    // Add pathname and user to dependencies so this runs on route change or user update
  }, [router, pathname]) 


  const login = async (username: string, password: string) => {
    try {
      setError("")
      setLoading(true)
      
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log("Login success:", data)
        
        // 1. Set Token
        setWithExpiry(AUTH_KEY, data.token, 3600000)
        
        // 2. Set User State
        setUser(data.user)
        
        // 3. Refresh Router (Crucial for Next.js App Router)
        router.refresh() 

        // 4. Handle Redirection
        if (data.user.role === "admin") {
          console.log("Redirecting to admin...")
          router.push("/admin")
        } else {
          const target = `/dashboard/hotels/${data?.user?.hotelId || "demo"}`
          console.log("Redirecting to:", target)
          router.push(target)
        }
      } else {
        setError(data.error || "Login failed")
        console.log("Login error:", data)
      }
    } catch (err) {
      console.error(err)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(AUTH_KEY)
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      error, 
      isAuthenticated: !!user 
    }}>
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