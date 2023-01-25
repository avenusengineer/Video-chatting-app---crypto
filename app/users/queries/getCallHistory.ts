import { resolver } from "@blitzjs/rpc"

import db from "db"
import redis from "redis"

const CALL_HISTORY_KEY = "history:call"

export default resolver.pipe(resolver.authorize(), async (_, { session: { userId } }) => {
  const lastFetched = await redis.hget(CALL_HISTORY_KEY, userId)

  const calls = await db.call.findMany({
    include: {
      author: {
        include: {
          images: {
            take: 1,
            orderBy: {
              order: "asc",
            },
          },
        },
      },
      participant: {
        include: {
          images: {
            take: 1,
            orderBy: {
              order: "asc",
            },
          },
        },
      },
    },
    where: {
      OR: [
        {
          authorId: userId,
        },
        {
          participant: {
            id: userId,
          },
        },
      ],
      completedAt: {
        gt: lastFetched ? new Date(parseInt(lastFetched)) : new Date(Date.now() - 1000 * (60 * 5)), // substract 5 minutes from now,
      },
    },
    orderBy: {
      completedAt: "desc",
    },
  })

  if (calls?.[0]) {
    await redis.hset(
      CALL_HISTORY_KEY,
      userId,
      (calls[0].completedAt ?? calls[0].createdAt).getTime(),
      "EX",
      60 * 10
    )
  }

  return calls
})
