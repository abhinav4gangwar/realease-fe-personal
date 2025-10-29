import { useEffect } from 'react'

export const useEscapeKey = (onEscape: () => void, isActive: boolean = true) => {
  useEffect(() => {
    if (!isActive) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onEscape()
      }
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onEscape, isActive])
}