import { resolver } from "@blitzjs/rpc"

import db from "db"

export default resolver.pipe(
  resolver.authorize(),
  async (_, { session: { userId } }) =>
    await db.call.findMany({
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            images: {
              orderBy: {
                order: "asc",
              },
            },
            role: true,
          },
        },
        participant: {
          select: {
            id: true,
            username: true,
            name: true,
            images: {
              orderBy: {
                order: "asc",
              },
            },
            role: true,
          },
        },
      },
      where: {
        OR: [
          {
            author: {
              id: userId,
            },
          },
          {
            participant: {
              id: userId,
            },
          },
        ],
      },
      orderBy: {
        completedAt: "desc",
      },
    })
)
