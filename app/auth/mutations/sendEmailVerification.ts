import { generateToken, hash256 } from "@blitzjs/auth"
import { resolver } from "@blitzjs/rpc"

import db from "db"
import { verifyEmailMailer } from "mailers/verifyEmailMailer"
import { SendEmailVerification } from "app/auth/validations"

const VERIFY_EMAIL_TOKEN_EXPIRATION_IN_HOURS = 48

export class SendEmailVerificationError extends Error {
  name = "SendEmailVerificationError"
  message = "Email is invalid or already taken."
}

export default resolver.pipe(
  resolver.authorize(),
  resolver.zod(SendEmailVerification),
  async ({ email }, { session: { userId } }) => {
    // Generate the token and expiration date.
    const token = generateToken()
    const hashedToken = hash256(token)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + VERIFY_EMAIL_TOKEN_EXPIRATION_IN_HOURS)

    // Delete any existing password reset tokens
    await db.token.deleteMany({ where: { type: "VERIFY_EMAIL", userId: userId } })

    // Check if an user with this email already exists
    const count = await db.user.count({
      where: {
        email: email,
        id: {
          not: userId,
        },
      },
    })

    if (count !== 0) {
      throw new SendEmailVerificationError()
    }

    // Save this new token in the database.
    await db.token.create({
      data: {
        user: { connect: { id: userId } },
        type: "VERIFY_EMAIL",
        expiresAt,
        hashedToken,
        sentTo: email,
      },
    })

    // Send the email
    await verifyEmailMailer({ to: email, token }).send()
  }
)
