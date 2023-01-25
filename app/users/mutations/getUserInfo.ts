import { resolver } from "@blitzjs/rpc"

import db from "db"
import { GetUserInfo } from "app/users/validations"

export default resolver.pipe(resolver.zod(GetUserInfo), async ({ login }) => {
  const user = await db.user.findFirstOrThrow({
    select: {
      id: true,
      username: true,
      email: true,
      phone: true,
    },
    where: {
      OR: [
        {
          email: login,
        },
        {
          phone: login,
        },
        {
          username: login,
        },
      ],
      deletedAt: null,
    },
  })

  const result = {
    email: false,
    username: false,
    phone: false,
  }

  switch (login.toLowerCase()) {
    case user?.email?.toLowerCase():
      result.email = true
      break
    case user?.username?.toLowerCase():
      result.username = true
      break
    default:
      result.phone = true
      break
  }

  return result
})
