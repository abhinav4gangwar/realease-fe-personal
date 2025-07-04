'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const auth = !!token
    setIsAuthenticated(auth)

    if (!auth) {
      router.replace('/login')
    }
  }, [router])

  return { isAuthenticated }
}
