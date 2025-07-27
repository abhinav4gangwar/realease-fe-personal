'use client'

import { ChevronUp } from 'lucide-react'
import { useEffect, useState } from 'react'

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 100) {
        setIsVisible(true)
        return
      }

      const findScrollableParent = (
        element: HTMLElement | null
      ): HTMLElement | null => {
        if (!element) return null

        const { overflow, overflowY } = window.getComputedStyle(element)
        const isScrollable =
          overflow === 'auto' ||
          overflow === 'scroll' ||
          overflowY === 'auto' ||
          overflowY === 'scroll'

        if (isScrollable && element.scrollTop > 100) {
          return element
        }

        return findScrollableParent(element.parentElement)
      }

      const scrollableParent = findScrollableParent(document.body)
      if (scrollableParent) {
        setIsVisible(true)
        return
      }

      const commonContainers = [
        'main',
        '[data-scroll-container]',
        '.scroll-container',
        '.overflow-auto',
        '.overflow-y-auto',
      ]

      let hasScrolled = false
      for (const selector of commonContainers) {
        const container = document.querySelector(selector) as HTMLElement
        if (container && container.scrollTop > 100) {
          hasScrolled = true
          break
        }
      }

      setIsVisible(hasScrolled)
    }

    const addScrollListeners = () => {
      window.addEventListener('scroll', toggleVisibility)

      const commonContainers = [
        'main',
        '[data-scroll-container]',
        '.scroll-container',
        '.overflow-auto',
        '.overflow-y-auto',
      ]

      const containers: HTMLElement[] = []
      commonContainers.forEach((selector) => {
        const container = document.querySelector(selector) as HTMLElement
        if (container) {
          containers.push(container)
          container.addEventListener('scroll', toggleVisibility)
        }
      })

      return containers
    }

    const containers = addScrollListeners()

    return () => {
      window.removeEventListener('scroll', toggleVisibility)
      containers.forEach((container) => {
        container.removeEventListener('scroll', toggleVisibility)
      })
    }
  }, [])

  const handleScrollToTop = () => {
    if (window.scrollY > 0) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
      return
    }

    const findScrollableParent = (
      element: HTMLElement | null
    ): HTMLElement | null => {
      if (!element) return null

      const { overflow, overflowY } = window.getComputedStyle(element)
      const isScrollable =
        overflow === 'auto' ||
        overflow === 'scroll' ||
        overflowY === 'auto' ||
        overflowY === 'scroll'

      if (isScrollable && element.scrollTop > 0) {
        return element
      }

      return findScrollableParent(element.parentElement)
    }

    const scrollableParent = findScrollableParent(document.body)
    if (scrollableParent) {
      scrollableParent.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    } else {
      const commonContainers = [
        'main',
        '[data-scroll-container]',
        '.scroll-container',
        '.overflow-auto',
        '.overflow-y-auto',
      ]

      for (const selector of commonContainers) {
        const container = document.querySelector(selector) as HTMLElement
        if (container && container.scrollTop > 0) {
          container.scrollTo({
            top: 0,
            behavior: 'smooth',
          })
          break
        }
      }
    }
  }

  return (
    <button
      onClick={handleScrollToTop}
      className={`fixed right-18 bottom-1/3 z-50 flex h-13 w-13 items-center justify-center bg-[#9B9B9D] text-white shadow-lg transition-all rounded-md duration-300 hover:bg-secondary cursor-pointer hover:shadow-xl ${
        isVisible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-2 opacity-0'
      }`}
      aria-label="Scroll to top"
    >
      <ChevronUp className="h-8 w-8" />
    </button>
  )
}

export default ScrollToTop
