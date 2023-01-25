import { resolver } from "@blitzjs/rpc"
import { hash256 } from "@blitzjs/auth"

import db from "db"

export default resolver.pipe(resolver.authorize(), async (_, { session }) => {
  // Delete all favorites
  await db.favorite.deleteMany({
    where: {
      authorId: session.userId,
    },
  })

  const user = await db.user.findFirstOrThrow({
    where: { id: session.userId, deletedAt: null },
  })

  // Hash user information so we can still identify them if they come back
  const username = hash256(user.username)
  const email = user.email && hash256(user.email)
  const phone = user.phone && hash256(user.phone)

  // Update user with hashed information
  await db.user.update({
    where: {
      id: session.userId,
    },
    data: {
      username,
      email,
      phone,
      birthdate: null,
      kycReferenceKey: null,
      name: null,
      hashedPassword: null,
      deletedAt: new Date(),
    },
  })

  // Delete user images
  await db.userImage.deleteMany({
    where: {
      userId: session.userId,
    },
  })

  // Revoke all sessions
  await session.$revokeAll()
})
