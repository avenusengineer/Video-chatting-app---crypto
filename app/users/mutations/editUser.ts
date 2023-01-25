import { SecurePassword } from "@blitzjs/auth"
import { resolver } from "@blitzjs/rpc"

import { VerifyOTPError } from "app/auth/mutations/verifyOTP"
import db from "db"
import { verifyOTPCode } from "integrations/twilio"
import { EditUser } from "app/users/validations"

export default resolver.pipe(
  resolver.authorize(),
  resolver.zod(EditUser),
  async ({ name, birthdate, price, phone, email, code, username, password }, ctx) => {
    if (phone || email) {
      if (!code) {
        throw new VerifyOTPError()
      }

      const isValid = await verifyOTPCode((phone || email)!, code)
      if (!isValid) {
        throw new VerifyOTPError()
      }
    }

    await db.user.update({
      where: {
        id: ctx.session.userId,
      },
      data: {
        name,
        birthdate,
        username,
        price,
        phone,
        email,
        hashedPassword: password ? await SecurePassword.hash(password.trim()) : undefined,
      },
    })
  }
)
