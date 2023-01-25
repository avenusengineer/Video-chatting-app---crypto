import { resolver } from "@blitzjs/rpc"

import { verifyOTPCode } from "integrations/twilio"
import db from "db"
import { VerifyOTP } from "app/auth/validations"

export class VerifyOTPError extends Error {
  name = "VerifyOTPError"
  message = "Invalid OTP code"
}

export default resolver.pipe(resolver.zod(VerifyOTP), async ({ phone, email, code }, ctx) => {
  const isValid = await verifyOTPCode((phone || email)!, code)

  if (!isValid) {
    throw new VerifyOTPError()
  }

  const user = await db.user.findFirstOrThrow({ where: { phone, email, deletedAt: null } })

  await ctx.session.$create({ userId: user.id, username: user.username, role: user.role })
})
