
import { z } from 'zod'

// Password validation schema with security requirements
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

// Email validation schema
export const emailSchema = z.string()
  .email('Please enter a valid email address')
  .max(255, 'Email must be less than 255 characters')

// Phone validation schema
export const phoneSchema = z.string()
  .regex(/^\+?[\d\s\-\(\)]{10,}$/, 'Please enter a valid phone number')
  .optional()

// Name validation schema
export const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters long')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[a-zA-Z\s\-'\.]+$/, 'Name can only contain letters, spaces, hyphens, apostrophes, and periods')

// Input sanitization function
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/[&]/g, '&amp;')
    .replace(/['"]/g, (match) => match === '"' ? '&quot;' : '&#x27;')
}

// Contact form validation schema
export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  subject: z.string()
    .min(5, 'Subject must be at least 5 characters long')
    .max(200, 'Subject must be less than 200 characters'),
  message: z.string()
    .min(10, 'Message must be at least 10 characters long')
    .max(2000, 'Message must be less than 2000 characters')
})

// Auth form validation schemas
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
})

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  fullName: nameSchema,
  phone: phoneSchema
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

// Order form validation schema
export const orderFormSchema = z.object({
  customerName: nameSchema,
  customerEmail: emailSchema,
  customerPhone: z.string()
    .regex(/^\+?[\d\s\-\(\)]{10,}$/, 'Please enter a valid phone number'),
  orderType: z.enum(['dine_in', 'takeout', 'delivery']),
  deliveryAddress: z.string().optional(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional()
})

export type ContactFormData = z.infer<typeof contactFormSchema>
export type SignInFormData = z.infer<typeof signInSchema>
export type SignUpFormData = z.infer<typeof signUpSchema>
export type OrderFormData = z.infer<typeof orderFormSchema>
