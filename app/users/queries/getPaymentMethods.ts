import { resolver } from "@blitzjs/rpc"

import { getPaymentMethods } from "integrations/authorize"

export default resolver.pipe(
  resolver.authorize(),
  async (_, { session: { userId } }) => await getPaymentMethods(userId)
)
