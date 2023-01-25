import { z } from "zod"
import Payment from "payment"

import { password } from "app/auth/validations"

export const getUserThumbnails = z.object({
  id: z.string().min(1),
})

export const GetUserInfo = z.object({
  login: z.string().min(1),
})

export const GetUser = z.object({
  username: z.string().min(1),
  isCreator: z.boolean().optional().default(false),
})

export const GetUsers = z.object({
  usernames: z.array(z.string()),
})

export const QueueLength = z.object({
  room: z.string().min(1),
})

export const IsFavorite = z.object({
  username: z.string().min(1),
})

export const AddFavorite = z.object({
  username: z.string().min(1),
})

export const RemoveFavorite = z.object({
  username: z.string().min(1),
})

export const ReportUser = z.object({
  userId: z.string().min(1),
})

export const RemovePictures = z.object({
  imageUrl: z.string().min(1),
  id: z.string().min(1),
})

export const EditUser = z
  .object({
    name: z.string().max(50).nullable(),
    birthdate: z.union([z.date(), z.string()]).refine((value) => {
      if (typeof value === "string") {
        value = new Date(value)
      }

      return new Date(value.getFullYear() + 18, value.getMonth() - 1, value.getDay()) <= new Date()
    }, "You must be at least 18."),
    price: z.number().min(0).max(1000, "Price must be less than 1000 gems per second"),
    phone: z.string().nullable(),
    code: z.string().min(1),
    email: z.string().email().nullable(),
    password: password.optional(),
    username: z
      .string()
      .trim()
      .min(3)
      .max(30)
      .regex(
        /^[A-Za-z][A-Za-z0-9_]{2,30}$/,
        "Username must be 3-30 characters long and start with a letter."
      ),
  })
  .partial()

export const DeletePaymentMethod = z.object({
  paymentProfileId: z.string().min(1),
  customerProfileId: z.string().min(1),
})

export const AddGems = z
  .object({
    amount: z.number().positive().min(1),
    currency: z.string().min(1),
    paymentProfileId: z.string().min(1).optional(),
    customerProfileId: z.string().min(1).optional(),
    nonce: z.string().min(1).optional(),
  })
  .refine(
    ({ nonce, paymentProfileId, customerProfileId }) =>
      nonce || (paymentProfileId && customerProfileId),
    "Must provide either nonce or paymentProfileId"
  )

export const AddGemsWithCreditCard = z.object({
  amount: z.number().positive().min(1),
  currency: z.string().min(1),
  fullName: z.string().optional(),
  zip: z.string().optional(),
  cardNumber: z.string().min(1).refine(Payment.fns.validateCardNumber, "Card number is invalid"),
  expiration: z
    .string()
    .min(1)
    .refine((value) => Payment.fns.validateCardExpiry(value), "Expiration is invalid"),
  cardCode: z.string().min(3),
})

export const AddGemsWithPaymentProfile = z.object({
  amount: z.number().positive().min(1),
  currency: z.string().min(1),
  paymentProfileId: z.string().min(1),
  customerProfileId: z.string().min(1),
})

export const AddGemsWithCard = AddGemsWithCreditCard.or(AddGemsWithPaymentProfile)

export const GetHistory = z.object({
  isCreator: z.boolean().optional().default(false),
})
