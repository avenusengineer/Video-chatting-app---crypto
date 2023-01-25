import { hash256 } from "@blitzjs/auth"
import { resolver } from "@blitzjs/rpc"

import db from "db"
import { VerifyEmail } from "app/auth/validations"

export class VerifyEmailError extends Error {
  name = "VerifyEmailError"
  message = "Email verification link is invalid or it has expired."
}

export default resolver.pipe(resolver.zod(VerifyEmail), async ({ token }) => {
  // 1. Try to find this token in the database
  const hashedToken = hash256(token)
  const possibleToken = await db.token.findFirst({
    where: { hashedToken, type: "VERIFY_EMAIL" },
    include: {
      user: {
        select: {
          id: true,
          emailVerifiedAt: true,
        },
      },
    },
  })

  // 2. If token not found, error
  if (!possibleToken) {
    throw new VerifyEmailError()
  }

  // Throw an error if email is already verified
  if (possibleToken.user.emailVerifiedAt !== null) {
    throw new VerifyEmailError()
  }

  const savedToken = possibleToken

  // 3. Delete token so it can't be used again
  await db.token.delete({ where: { id: savedToken.id } })

  // 4. If token has expired, error
  if (savedToken.expiresAt < new Date()) {
    throw new VerifyEmailError()
  }

  await db.user.update({
    select: null,
    where: { id: savedToken.userId },
    data: {
      email: savedToken.sentTo,
      emailVerifiedAt: new Date(),
    },
  })

  return true
})
