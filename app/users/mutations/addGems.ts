import { resolver } from "@blitzjs/rpc"

import db from "db"
import { createTransaction } from "integrations/authorize"
import { AddGems } from "app/users/validations"
import { paymentProfileQueue } from "queue/payment-profile"
import { DOLLAR_TO_GEMS } from "helpers/price"

export default resolver.pipe(
  resolver.authorize(),
  resolver.zod(AddGems),
  async ({ amount, currency, ...params }, { session: { userId } }) => {
    const { accountNumber, accountType, transactionId } = await createTransaction({
      amount,
      ...(params as any),
    })

    const gems = amount * DOLLAR_TO_GEMS + 1

    await await db.$transaction([
      db.transaction.create({
        data: {
          sid: transactionId,
          type: "DEPOSIT",
          gems,
          source: `${accountType} ${accountNumber}`,
          amount,
          currency,
          user: {
            connect: {
              id: userId,
            },
          },
        },
      }),
      db.user.update({
        where: {
          id: userId,
        },
        select: {
          gems: true,
        },
        data: {
          gems: {
            increment: gems,
          },
        },
      }),
    ])

    await paymentProfileQueue.add({ userId, transactionId })
  }
)
