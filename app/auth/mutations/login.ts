import { SecurePassword } from "@blitzjs/auth"
import { resolver } from "@blitzjs/rpc"
import { AuthenticationError } from "blitz"

import db from "db"
import { Role } from "types"
import { Login } from "app/auth/validations"

type AuthenticateUser = { password: string } & (
  | {
      username?: string
      email: string
    }
  | {
      username: string
      email?: string
    }
)

export const authenticateUser = async ({ email, username, password }: AuthenticateUser) => {
  const user = await db.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  })
  if (!user) throw new AuthenticationError()

  const result = await SecurePassword.verify(user.hashedPassword, password.trim())

  if (result === SecurePassword.VALID_NEEDS_REHASH) {
    // Upgrade hashed password with a more secure hash
    const improvedHash = await SecurePassword.hash(password)
    await db.user.update({
      select: null,
      where: { id: user.id },
      data: { hashedPassword: improvedHash },
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { hashedPassword, ...rest } = user

  return rest
}

export default resolver.pipe(resolver.zod(Login), async ({ email, username, password }, ctx) => {
  // This throws an error if credentials are invalid
  const user = await authenticateUser({
    email: email as string,
    username: username as string,
    password,
  })

  await ctx.session.$create({ userId: user.id, username: user.username, role: user.role as Role })

  return user
})
