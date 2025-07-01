'use client'
import { passwordConfirmationSchema } from '@/utils/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
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

  type PasswordFormValues = z.infer<typeof passwordConfirmationSchema>

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordConfirmationSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = (values: PasswordFormValues) => {
    console.log('Login data:', values)
  }

  return (
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
                Should contain atleast a number, uppercase, lowercase and a
                symbol
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
                    type={showPassword ? 'password' : 'text'}
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
                    {showPassword ? (
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
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? 'Signing Up...' : 'Sign Up'}
        </Button>
      </form>
    </Form>
  )
}

export default PasswordForm
