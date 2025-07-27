'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

// Function to check if JWT is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Math.floor(Date.now() / 1000)
    return payload.exp < currentTime
  } catch (error) {
    console.log(error)
    return true // If we can't decode the token, consider it expired
  }
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken')
      
      if (!token) {
        setIsAuthenticated(false)
        router.replace('/login')
        return
      }

      // Check if token is expired
      if (isTokenExpired(token)) {
        localStorage.removeItem('authToken')
        setIsAuthenticated(false)
        toast.error('Session expired. Please login again.')
        router.replace('/login')
        return
      }

      setIsAuthenticated(true)
    }

    checkAuth()

    // Optional: Set up periodic token validation (every 5 minutes)
    const interval = setInterval(checkAuth, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [router])

  return { isAuthenticated }
}