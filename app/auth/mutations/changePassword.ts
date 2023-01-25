import { generateToken } from "@blitzjs/auth"
import { resolver } from "@blitzjs/rpc"
import { SecurePassword } from "@blitzjs/auth"
import { NotFoundError } from "blitz"

import { ChangePassword } from "app/auth/validations"
import db from "db"
import { changedPasswordMailer } from "mailers/changedPasswordMailer"
import { authenticateUser } from "./login"

export class ChangePasswordError extends Error {
  name = "ChangePasswordError"
  message = "Password is invalid."
}

export default resolver.pipe(
  resolver.zod(ChangePassword),
  resolver.authorize(),
  async ({ currentPassword, newPassword }, ctx) => {
    const token = generateToken()

    const user = await db.user.findFirst({ where: { id: ctx.session.userId! } })
    if (!user) throw new NotFoundError()

    try {
      await authenticateUser({
        username: user.username,
        password: currentPassword,
      })
    } catch (err) {
      throw new ChangePasswordError()
    }

    const hashedPassword = await SecurePassword.hash(newPassword.trim())
    await db.user.update({
      select: null,
      where: { id: user.id },
      data: { hashedPassword },
    })

    await changedPasswordMailer({
      to: user.email!,
      token,
      name: user.name ?? user.username,
    }).send()

    return true
  }
)
