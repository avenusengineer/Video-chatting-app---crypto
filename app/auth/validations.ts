import { z } from "zod"

export const password = z.string().min(8).max(100)

export const Signup = z
  .object({
    email: z.string().email().trim().optional(),
    name: z.string().max(50).nullable().optional(),
    phone: z.string().min(1).optional(),
    code: z.string().min(1).max(5),
    birthdate: z
      .union([z.date(), z.string()])
      .refine((value) => {
        if (typeof value === "string") {
          value = new Date(value)
        }

        return (
          new Date(value.getFullYear() + 18, value.getMonth() - 1, value.getDay()) <= new Date()
        )
      }, "You must be at least 18 to register.")
      .optional(),
    username: z
      .string()
      .trim()
      .min(3)
      .max(30)
      .regex(
        /^[A-Za-z][A-Za-z0-9_]{2,30}$/,
        "Username must be 3-30 characters long and start with a letter."
      )
      .optional(),
    password: password.optional(),
  })
  .refine(
    (values) => (!!values.phone && !!values.code) || (!!values.email && !!values.code),
    "You must provide a phone or an email and code."
  )

export const Login = z
  .object({
    email: z.string().trim().optional(),
    username: z.string().trim().optional(),
    password: z.string(),
  })
  .refine(
    ({ email, username }) => email || username,
    "You must provide either an email or username."
  )

export const ForgotPassword = z.object({
  email: z.string().email().trim(),
})

export const VerifyEmail = z.object({
  token: z.string(),
})

export const SendEmailVerification = z.object({
  email: z.string().email(),
})

export const ResetPassword = z
  .object({
    password: password,
    passwordConfirmation: password,
    token: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords don't match",
    path: ["passwordConfirmation"], // set the path of the error
  })

export const ChangePassword = z.object({
  currentPassword: z.string(),
  newPassword: password,
})

export const VerifyOTP = z
  .object({
    phone: z.string().trim().min(1).optional(),
    email: z.string().trim().min(1).email().optional(),
    code: z.string().min(1),
  })
  .refine(({ phone, email }) => phone || email, "Must provide either phone or email")

export const SendOTP = z
  .object({
    phone: z.string().trim().min(1).optional(),
    email: z.string().trim().min(1).email().optional(),
    isLogin: z.boolean().optional().default(false),
  })
  .refine(({ phone, email }) => phone || email, "Must provide either phone or email")
