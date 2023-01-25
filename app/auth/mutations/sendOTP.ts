import { resolver } from "@blitzjs/rpc"

import { SendOTP } from "app/auth/validations"
import { sendOTPCode } from "integrations/twilio"
import db from "db"

export class SendOTPTakenError extends Error {
  name = "SendOTPTakenError"
  message = "Already taken"
}

export class SendOTPNotFoundError extends Error {
  name = "SendOTPNotFoundError"
  message = "Not found"
}

export default resolver.pipe(
  resolver.zod(SendOTP),
  async ({ phone, email, isLogin }, { ipAddress }) => {
    const count = await db.user.count({ where: { phone, email } })

    if (isLogin && count === 0) {
      throw new SendOTPNotFoundError()
    } else if (!isLogin && count > 0) {
      throw new SendOTPTakenError()
    }

    await sendOTPCode((phone || email)!, ipAddress, phone ? "sms" : "email")
  }
)
