import { Ctx } from "blitz"

import db from "db"

export default async function getCurrentUser(_ = null, { session }: Ctx) {
  if (!session.userId) return null

  return await db.user.findFirstOrThrow({
    where: { id: session.userId, deletedAt: null },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      role: true,
      gems: true,
      balance: true,
      phone: true,
      price: true,
      emailVerifiedAt: true,
      images: {
        orderBy: {
          order: "asc",
        },
      },
      kycVerifiedAt: true,
      kycSubmittedAt: true,
      lastSeenAt: true,
      status: true,
      birthdate: true,
    },
  })
}
