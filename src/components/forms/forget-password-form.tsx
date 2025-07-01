'use client'
import { forgetPasswordSchema } from '@/utils/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '../ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'

const ForgetPasswordForm = () => {
  type ForgetPasswordFormValues = z.infer<typeof forgetPasswordSchema>

  const form = useForm<ForgetPasswordFormValues>({
    resolver: zodResolver(forgetPasswordSchema),
    defaultValues: {
      value: '',
    },
  })

  const onSubmit = (values: ForgetPasswordFormValues) => {
    console.log('Login data:', values)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 pt-5"
      >
        <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-secondary text-sm">
                  Enter your Email or Phone Number
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    {...field}
                  />
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
            {form.formState.isSubmitting ? 'Sending OTP...' : 'Reset Password'}
          </Button>
      </form>
    </Form>
  )
}

export default ForgetPasswordForm
