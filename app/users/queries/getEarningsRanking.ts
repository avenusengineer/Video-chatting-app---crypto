import { resolver } from "@blitzjs/rpc"

import db from "db"
import { DOLLAR_TO_GEMS } from "helpers/price"

export default resolver.pipe(resolver.authorize(), async (_, { session: { userId } }) => {
  const [result] = await db.call.groupBy({
    by: ["participantId"],
    _sum: {
      earnings: true,
    },
    where: {
      participantId: userId,
    },
  })

  const totalEarnings = Math.round((result?._sum?.earnings ?? 0) * DOLLAR_TO_GEMS) / DOLLAR_TO_GEMS

  return { totalEarnings }
})
