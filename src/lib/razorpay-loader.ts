// Razorpay script loader utility

declare global {
  interface Window {
    Razorpay: any
  }
}

let razorpayScriptLoaded = false
let razorpayScriptLoading = false

export const loadRazorpayScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // If already loaded, resolve immediately
    if (typeof window !== 'undefined' && window.Razorpay) {
      razorpayScriptLoaded = true
      resolve()
      return
    }

    // If already loading, wait for it
    if (razorpayScriptLoading) {
      const checkLoaded = () => {
        if (window.Razorpay) {
          resolve()
        } else {
          setTimeout(checkLoaded, 100)
        }
      }
      checkLoaded()
      return
    }

    // Start loading
    razorpayScriptLoading = true

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true

    script.onload = () => {
      console.log('Razorpay script loaded successfully')
      razorpayScriptLoaded = true
      razorpayScriptLoading = false
      resolve()
    }

    script.onerror = () => {
      console.error('Failed to load Razorpay script')
      razorpayScriptLoading = false
      reject(new Error('Failed to load Razorpay script'))
    }

    // Check if script is already in DOM
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')
    if (existingScript) {
      // Script already exists, wait for it to load
      if (window.Razorpay) {
        razorpayScriptLoaded = true
        razorpayScriptLoading = false
        resolve()
      } else {
        existingScript.addEventListener('load', () => {
          razorpayScriptLoaded = true
          razorpayScriptLoading = false
          resolve()
        })
        existingScript.addEventListener('error', () => {
          razorpayScriptLoading = false
          reject(new Error('Failed to load Razorpay script'))
        })
      }
    } else {
      document.body.appendChild(script)
    }
  })
}

export const isRazorpayLoaded = (): boolean => {
  return typeof window !== 'undefined' && !!window.Razorpay
}

export const createRazorpayInstance = (options: any) => {
  if (!window.Razorpay) {
    throw new Error('Razorpay script not loaded')
  }
  return new window.Razorpay(options)
}
