import { resolver } from "@blitzjs/rpc"

import db, { Transaction, Call } from "db"
import { GetHistory } from "../validations"

type HistoryTransaction = Transaction | Call

export default resolver.pipe(
  resolver.authorize(),
  resolver.zod(GetHistory),
  async ({ isCreator }, { session: { userId } }): Promise<ReadonlyArray<HistoryTransaction>> => {
    const [calls, transactions] = await db.$transaction([
      db.call.findMany({
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
            },
          },
        },
        where: isCreator ? { participantId: userId } : { authorId: userId },
        orderBy: {
          createdAt: "desc",
        },
      }),
      db.transaction.findMany({
        where: {
          userId,
          type: isCreator ? "WITHDRAWAL" : "DEPOSIT",
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ])

    return [...transactions, ...calls].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }
)
