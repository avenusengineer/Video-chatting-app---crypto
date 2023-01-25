import { SecurePassword } from "@blitzjs/auth"
import { resolver } from "@blitzjs/rpc"

import db from "db"
import { Signup } from "app/auth/validations"
import { Role } from "types"
import { verifyOTPCode } from "integrations/twilio"

export class SignupInvalidOTPError extends Error {
  name = "SignupInvalidOTPError"
  message = "Invalid OTP code"
}

// If user doesn't provide a username, we generate a random one by default to speed up the signup process.
export const generateUsername = async (): Promise<string> => {
  const number = Math.floor(1000000000 + Math.random() * 9000000000)
  const username = "user" + number

  const count = await db.user.count({ where: { username } })
  if (count > 0) {
    return generateUsername()
  }

  return username
}

export default resolver.pipe(
  resolver.zod(Signup),
  async ({ username, email, password, name, birthdate, phone, code }, ctx) => {
    const result = await verifyOTPCode((phone || email)!, code)
    if (!result) {
      throw new SignupInvalidOTPError()
    }

    const user = await db.user.create({
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
      },
      data: {
        name: name?.trim(),
        email: email?.toLowerCase().trim(),
        username: username?.toLowerCase().trim() || (await generateUsername()),
        hashedPassword: password ? await SecurePassword.hash(password.trim()) : undefined,
        phoneVerifiedAt: phone ? new Date() : undefined,
        emailVerifiedAt: email ? new Date() : undefined,
        phone,
        birthdate,
        role: "USER",
      },
    })

    await ctx.session.$create({ userId: user.id, username: user.username, role: user.role as Role })

    return user
  }
)
