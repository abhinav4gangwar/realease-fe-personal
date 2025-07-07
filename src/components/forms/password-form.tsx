'use client'
import { apiClient } from '@/utils/api'
import { passwordConfirmationSchema } from '@/utils/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
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

const PasswordForm = () => {
  const [showPassword, setShowPassword] = useState(true)
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [isGoogleSignup, setIsGoogleSignup] = useState(false)
  const router = useRouter()

  type PasswordFormValues = z.infer<typeof passwordConfirmationSchema>

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordConfirmationSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  useEffect(() => {
    // Check for Google signup first
    const googleEmail = localStorage.getItem('googleUserEmail')
    if (googleEmail) {
      setUserEmail(googleEmail)
      setIsGoogleSignup(true)
      return
    }

    // Check for regular signup
    const signupEmail = localStorage.getItem('signupEmail')
    if (signupEmail) {
      setUserEmail(signupEmail)
      setIsGoogleSignup(false)
      return
    }

    // No email found, redirect to register
    router.push('/register')
  }, [router])

  const onSubmit = async (values: PasswordFormValues) => {
    setIsLoading(true)
    try {
      const endpoint = isGoogleSignup ? '/auth/google-set-password' : '/auth/set-password'
      
      const response = await apiClient.post(endpoint, {
        email: userEmail,
        password: values.password,
        confirmPassword: values.confirmPassword,
        captchaToken: "",
      })

      if (response.data.token) {
        toast.success(response.data.message || 'Password set successfully!')
        
        // Store the JWT token
        localStorage.setItem('authToken', response.data.token)
        
        // Clear signup/google data
        localStorage.removeItem('signupEmail')
        localStorage.removeItem('signupName')
        localStorage.removeItem('googleUserEmail')
        
        // Redirect to dashboard
        router.push('/')
      }
    } catch (error: any) {
      console.error('Set password error:', error)
      const errorMessage = error.response?.data?.message || 'Failed to set password. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      {isGoogleSignup && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            Complete your Google signup by setting a password for your account.
          </p>
        </div>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-5">
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
                <p className="cursor-pointer text-xs text-gray-500">
                  Should contain atleast a number, uppercase, lowercase and a symbol
                </p>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-secondary text-sm">
                  Enter your Password again
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPasswordConfirmation ? 'password' : 'text'}
                      className="pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswordConfirmation(!showPasswordConfirmation)
                      }
                      className="absolute top-1/2 right-5 -translate-y-1/2 transform"
                    >
                      {showPasswordConfirmation ? (
                        <EyeOff className="h-5 w-5 text-gray-500" />
                      ) : (
                        <Eye className="text-primary h-5 w-5" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="bg-primary text-md h-13 w-full py-3 hover:bg-[#4E4F54]"
            disabled={isLoading}
          >
            {isLoading ? 'Setting Password...' : 'Set Password'}
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default PasswordForm