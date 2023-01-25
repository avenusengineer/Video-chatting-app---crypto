import { resolver } from "@blitzjs/rpc"

import db from "db"

export default resolver.pipe(
  resolver.authorize(),
  async (_, ctx) =>
    await db.user.findMany({
      select: {
        id: true,
        username: true,
        price: true,
        name: true,
        status: true,
        images: {
          orderBy: {
            order: "asc",
          },
        },
      },
      where: {
        favoritesOf: {
          some: {
            authorId: ctx.session.userId,
          },
        },
      },
      orderBy: {
        status: "asc",
      },
    })
)
