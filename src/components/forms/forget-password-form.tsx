'use client'
import { apiClient } from '@/utils/api'
import { forgetPasswordSchema } from '@/utils/validations'
import { getCaptchaToken } from '@/utils/recaptcha'
import { zodResolver } from '@hookform/resolvers/zod'
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

const ForgetPasswordForm = () => {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  type ForgetPasswordFormValues = z.infer<typeof forgetPasswordSchema>

  const form = useForm<ForgetPasswordFormValues>({
    resolver: zodResolver(forgetPasswordSchema),
    defaultValues: {
      value: '',
    },
  })

  const onSubmit = async (values: ForgetPasswordFormValues) => {
    setIsLoading(true)
    try {
      const captchaToken = await getCaptchaToken('SIGNUP')

      const response = await apiClient.post('/auth/forgot-password', {
        email: values.value,
        captchaToken,
      })
      if (response.data.message) {
        toast.success(response.data.message)
        localStorage.setItem('signupEmail', values.value)
        router.push('/otp-validation')
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        'Reset Password failed. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-5">
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-secondary text-sm">
                Enter your Email or Phone Number
              </FormLabel>
              <FormControl>
                <Input type="text" {...field} />
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
          {isLoading ? 'Sending OTP...' : 'Reset Password'}
        </Button>
      </form>
    </Form>
  )
}

export default ForgetPasswordForm
