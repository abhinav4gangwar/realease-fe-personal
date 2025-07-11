'use client'

import { Button } from '@/components/ui/button'
import { ArrowUp } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 100) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  if (!isVisible) return null

  return (
    <Button
      onClick={scrollToTop}
      className="fixed right-6 bottom-6 z-50 h-12 w-12 rounded-full bg-blue-600 shadow-lg hover:bg-blue-700"
      size="icon"
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  )
}
