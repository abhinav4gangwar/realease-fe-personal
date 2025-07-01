import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .refine((val) => /[a-z]/.test(val), {
      message: 'Password must contain at least one lowercase letter',
    })
    .refine((val) => /[A-Z]/.test(val), {
      message: 'Password must contain at least one uppercase letter',
    })
    .refine((val) => /[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]~`]/.test(val), {
      message: 'Password must contain at least one special character',
    }),
})

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string()
})

export const passwordConfirmationSchema = z.object({
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .refine((val) => /[a-z]/.test(val), {
      message: 'Password must contain at least one lowercase letter',
    })
    .refine((val) => /[A-Z]/.test(val), {
      message: 'Password must contain at least one uppercase letter',
    })
    .refine((val) => /[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]~`]/.test(val), {
      message: 'Password must contain at least one special character',
    }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password doesn't match previously entered password",
  path: ["confirmPassword"],
})

export const forgetPasswordSchema = z.object({
  value: z.string()
})