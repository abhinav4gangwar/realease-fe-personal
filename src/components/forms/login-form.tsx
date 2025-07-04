'use client'
import { apiClient } from '@/utils/api'
import { loginSchema } from '@/utils/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
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

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  type LoginFormValues = z.infer<typeof loginSchema>

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true)
    try {
      // const captchaToken = await getCaptchaToken('LOGIN')

      const response = await apiClient.post('/auth/login', {
        email: values.email,
        password: values.password,
        captchaToken: '',
      })

      if (response.data.message) {
        toast.success(response.data.message)

        if (response.data.token) {
          localStorage.setItem('token', response.data.token)
        }

        localStorage.setItem('loginEmail', values.email)

        if (response.data.redirectTo === '/dashboard') {
          router.push('/')
        } else {
          router.push('/otp-validation')
        }
      }
    } catch (error: any) {
      console.error('Login error:', error)
      const errorMessage =
        error.response?.data?.message || 'Login failed. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    console.log('Google login clicked')
    // TODO: Implement Google login
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-5">
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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-secondary text-sm">
                  Enter your Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'password' : 'text'}
                      className="pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 right-5 -translate-y-1/2 transform"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-500" />
                      ) : (
                        <Eye className="text-primary h-5 w-5" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
                <Link href="/forgot-password">
                  <p className="cursor-pointer text-xs text-gray-500">
                    Forgot Password?
                  </p>
                </Link>
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
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </Button>

          <div className="flex items-center justify-center gap-3">
            <div className="bg-secondary h-[1px] w-full"></div>
            <span className="text-secondary text-center font-light">or</span>
            <div className="bg-secondary h-[1px] w-full"></div>
          </div>
        </form>
      </Form>

      <Button
        variant="outline"
        className="mt-4 h-13 w-full py-3"
        onClick={handleGoogleLogin}
      >
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
        Log in with Google
      </Button>

      {/* Sign Up Link */}
      <div className="pt-6 text-center">
        <span className="text-secondary text-sm font-bold">
          {"Don't have an Account? "}
          <Link href="/register" className="text-primary">
            Sign Up
          </Link>
        </span>
      </div>
    </div>
  )
}

export default LoginForm
