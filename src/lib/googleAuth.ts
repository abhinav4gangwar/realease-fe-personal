import { apiClient } from '@/utils/api'

interface GoogleAuthResponse {
  success: boolean
  message?: string
  token?: string
  redirectTo?: string
  userEmail?: string // Add this for password form
}

interface GoogleAuthConfig {
  client_id: string
  callback?: (response: any) => void
  auto_select?: boolean
  cancel_on_tap_outside?: boolean
}

export const initializeGoogleAuth = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.accounts) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true

    script.onload = () => {
      setTimeout(() => {
        if (window.google && window.google.accounts) {
          resolve()
        } else {
          reject(new Error('Google Identity Services not available after loading'))
        }
      }, 100)
    }

    script.onerror = () => {
      reject(new Error('Failed to load Google Identity Services'))
    }

    document.head.appendChild(script)
  })
}

export const handleGoogleAuth = async (
  action: 'signup' | 'login' = 'signup'
): Promise<GoogleAuthResponse> => {
  try {
    await initializeGoogleAuth()

    if (!window.google || !window.google.accounts) {
      throw new Error('Google services not available')
    }

    return new Promise((resolve, reject) => {
      let authResolved = false

      const config: GoogleAuthConfig = {
        client_id: '931672701469-ie95emkb17s93p6u4s1j6e1b741j64bu.apps.googleusercontent.com',
        callback: async (response: any) => {
          if (authResolved) return
          authResolved = true

          try {
            const apiResponse = await apiClient.post('/auth/google-signin', {
              token: response.credential,
            })

            if (apiResponse.data) {
              // Store JWT token if provided
              if (apiResponse.data.token) {
                localStorage.setItem('authToken', apiResponse.data.token)
              }

              // Store user email for password form if redirecting to password
              if (apiResponse.data.redirectTo?.includes('/password') && apiResponse.data.userEmail) {
                localStorage.setItem('googleUserEmail', apiResponse.data.userEmail)
              }

              resolve({
                success: true,
                message: apiResponse.data.message,
                token: apiResponse.data.token,
                redirectTo: apiResponse.data.redirectTo,
                userEmail: apiResponse.data.userEmail,
              })
            } else {
              reject(new Error('No response data received'))
            }
          } catch (error: any) {
            reject(
              new Error(
                error.response?.data?.message ||
                  `Google ${action} failed. Please try again.`
              )
            )
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      }

      window.google.accounts.id.initialize(config)

      const timeout = setTimeout(() => {
        if (!authResolved) {
          authResolved = true
          reject(new Error('Google sign-in timeout - popup may have been blocked'))
        }
      }, 30000)

      try {
        window.google.accounts.id.prompt((notification: any) => {
          clearTimeout(timeout)
          
          if (authResolved) return

          if (notification.isNotDisplayed()) {
            authResolved = true
            reject(new Error('Google sign-in popup was blocked. Please allow popups and try again.'))
          } else if (notification.isSkippedMoment()) {
            authResolved = true
            reject(new Error('Google sign-in was cancelled by user'))
          } else if (notification.isDismissedMoment()) {
            authResolved = true
            reject(new Error('Google sign-in was dismissed'))
          }
        })
      } catch (error) {
        clearTimeout(timeout)
        if (!authResolved) {
          authResolved = true
          reject(new Error('Failed to show Google sign-in popup'))
        }
      }
    })
  } catch (error) {
    throw new Error('Failed to initialize Google authentication')
  }
}

export const renderGoogleButton = (
  element: HTMLElement,
  action: 'signup' | 'login' = 'signup',
  onSuccess: (response: GoogleAuthResponse) => void,
  onError: (error: Error) => void
): void => {
  initializeGoogleAuth()
    .then(() => {
      if (!window.google || !window.google.accounts) {
        throw new Error('Google services not available')
      }

      const config: GoogleAuthConfig = {
        client_id: '931672701469-ie95emkb17s93p6u4s1j6e1b741j64bu.apps.googleusercontent.com',
        callback: async (response: any) => {
          try {
            const apiResponse = await apiClient.post('/auth/google-signin', {
              token: response.credential,
            })

            if (apiResponse.data.token) {
              localStorage.setItem('authToken', apiResponse.data.token)
            }

            // Store user email for password form if needed
            if (apiResponse.data.redirectTo?.includes('/password') && apiResponse.data.userEmail) {
              localStorage.setItem('googleUserEmail', apiResponse.data.userEmail)
            }

            onSuccess({
              success: true,
              message: apiResponse.data.message,
              token: apiResponse.data.token,
              redirectTo: apiResponse.data.redirectTo,
              userEmail: apiResponse.data.userEmail,
            })
          } catch (error: any) {
            onError(
              new Error(
                error.response?.data?.message ||
                  `Google ${action} failed. Please try again.`
              )
            )
          }
        },
      }

      window.google.accounts.id.initialize(config)
      element.innerHTML = ''

      window.google.accounts.id.renderButton(element, {
        theme: 'outline',
        size: 'large',
        width: element.offsetWidth || 320,
        text: action === 'signup' ? 'signup_with' : 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
      })
    })
    .catch(onError)
}

export const checkPopupBlocker = (): boolean => {
  try {
    const popup = window.open('', '_blank', 'width=1,height=1')
    if (popup) {
      popup.close()
      return false
    }
    return true
  } catch (error) {
    return true
  }
}

export const handleGoogleAuthViaButton = async (
  buttonElement: HTMLElement,
  action: 'signup' | 'login' = 'signup'
): Promise<GoogleAuthResponse> => {
  return new Promise((resolve, reject) => {
    renderGoogleButton(
      buttonElement,
      action,
      (response) => resolve(response),
      (error) => reject(error)
    )
  })
}

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: GoogleAuthConfig) => void
          prompt: (callback?: (notification: any) => void) => void
          renderButton: (element: HTMLElement, config: any) => void
        }
      }
    }
  }
}
