export const getCaptchaToken = async (action: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.grecaptcha) {
      reject(new Error('reCAPTCHA not loaded'))
      return
    }

    window.grecaptcha.enterprise.ready(async () => {
      try {
        const token = await window.grecaptcha.enterprise.execute(
          '6Lei03QrAAAAAEK0pH527CXk4N52EtzbbSQ6bc0Z',
          { action }
        )
        resolve(token)
      } catch (error) {
        reject(error)
      }
    })
  })
}

declare global {
  interface Window {
    grecaptcha: {
      enterprise: {
        ready: (callback: () => void) => void
        execute: (siteKey: string, options: { action: string }) => Promise<string>
      }
    }
  }
}