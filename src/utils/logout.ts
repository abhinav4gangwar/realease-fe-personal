'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function useLogout() {
  const router = useRouter()

  const logout = () => {
    localStorage.removeItem('token')
    toast.success('Logged out successfully')
    router.push('/login')
  }

  return logout
}
