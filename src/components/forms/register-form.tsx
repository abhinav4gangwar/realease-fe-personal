'use client'
import {
  checkPopupBlocker,
  handleGoogleAuth,
  renderGoogleButton,
} from '@/lib/googleAuth'
import { apiClient } from '@/utils/api'
import { registerSchema } from '@/utils/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'
import { Button } from '../ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import { Input } from '../ui/input'

const RegisterForm = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [useGoogleButton, setUseGoogleButton] = useState(false)
  const googleButtonRef = useRef<HTMLDivElement>(null)

  type RegisterFormValues = z.infer<typeof registerSchema>

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  })

  useEffect(() => {
    const hasPopupBlocker = checkPopupBlocker()
    if (hasPopupBlocker) {
      console.log('Popup blocker detected, using button approach')
      setUseGoogleButton(true)
    }
  }, [])

  // Handle Google signup success
  const handleGoogleSignupSuccess = (response: any) => {
    console.log(response)
    if (response.success) {
      toast.success(response.message || 'Google signup successful!')

      // Handle redirect based on backend response
      if (response.redirectTo) {
        if (response.redirectTo.includes('/password')) {
          // Email is already stored in localStorage by the auth handler
          router.push('/password')
        } else if (response.redirectTo === '/dashboard') {
          router.push('/')
        } else {
          router.push(response.redirectTo)
        }
      } else {
        router.push('/')
      }
    }
  }

  // Handle Google signup error
  const handleGoogleSignupError = (error: Error) => {
    console.error('Google signup error:', error)

    if (
      error.message.includes('blocked') ||
      error.message.includes('not displayed')
    ) {
      toast.error('Popup blocked. Please use the Google button below.')
      setUseGoogleButton(true)
    } else {
      toast.error(error.message || 'Google signup failed. Please try again.')
    }
  }

  useEffect(() => {
    if (useGoogleButton && googleButtonRef.current && !isGoogleLoading) {
      renderGoogleButton(
        googleButtonRef.current,
        'signup',
        handleGoogleSignupSuccess,
        handleGoogleSignupError
      )
    }
  }, [useGoogleButton, isGoogleLoading, router])

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true)
    try {
      const response = await apiClient.post('/auth/signup', {
        name: values.name,
        email: values.email,
        captchaToken: '',
      })
      if (response.data.message) {
        toast.success(response.data.message)
        // Store email from form input for normal signup
        localStorage.setItem('signupEmail', values.email)
        localStorage.setItem('signupName', values.name)
        // Clear any Google signup flag
        localStorage.removeItem('isGoogleSignup')
        router.push('/otp-validation')
      }
    } catch (error: any) {
      console.error('Signup error:', error)
      const errorMessage =
        error.response?.data?.message || 'Signup failed. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    try {
      const response = await handleGoogleAuth('signup')
      handleGoogleSignupSuccess(response)
    } catch (error: any) {
      handleGoogleSignupError(error)
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-secondary text-sm">
                  Enter your Name
                </FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-secondary text-sm">
                  Enter your Email
                </FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="text-secondary text-center text-sm font-light">
            By continuing, you agree to the{' '}
            <span className="cursor-pointer underline">Terms of Use</span> and{' '}
            <span className="cursor-pointer underline">Privacy Policy</span>
          </div>

          <Button
            type="submit"
            className="bg-primary text-md h-13 w-full py-3 hover:bg-[#4E4F54]"
            disabled={isLoading || isGoogleLoading}
          >
            {isLoading ? 'Signing up...' : 'Sign Up'}
          </Button>

          <div className="flex items-center justify-center gap-3">
            <div className="bg-secondary h-[1px] w-full"></div>
            <span className="text-secondary text-center font-light">or</span>
            <div className="bg-secondary h-[1px] w-full"></div>
          </div>
        </form>
      </Form>

      {/* Google Sign-In Button */}
      {useGoogleButton ? (
        <div className="mt-4 w-full">
          <div ref={googleButtonRef} className="mt-4 h-13 w-full py-3"></div>
        </div>
      ) : (
        <Button
          variant="outline"
          className="mt-4 h-13 w-full py-3"
          onClick={handleGoogleLogin}
          disabled={isLoading || isGoogleLoading}
        >
          {isGoogleLoading ? (
            <div className="flex items-center">
              <div className="border-primary mr-2 h-4 w-4 animate-spin rounded-full border-b-2"></div>
              Signing up with Google...
            </div>
          ) : (
            <>
              <svg className="mr-2 h-6 w-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign up with Google
            </>
          )}
        </Button>
      )}

      <div className="pt-6 text-center">
        <span className="text-secondary text-sm font-bold">
          {'Have an Account? '}
          <Link href="/login" className="text-primary">
            Log In
          </Link>
        </span>
      </div>
    </div>
  )
}

export default RegisterForm