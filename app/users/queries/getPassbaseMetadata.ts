import { resolver } from "@blitzjs/rpc"

import db from "db"
import passbase, { encodeMetadata, PassbaseStatus } from "integrations/passbase"

export default resolver.pipe(resolver.authorize(), async (_, { session: { userId } }) => {
  const user = await db.user.findFirstOrThrow({
    where: { id: userId, deletedAt: null },
    select: {
      id: true,
      username: true,
      email: true,
      kycReferenceKey: true,
    },
  })

  let status: PassbaseStatus | null = null
  if (user.kycReferenceKey) {
    const identity = await passbase.getIdentityById(user.kycReferenceKey)
    status = identity.status
  }

  const metadata = encodeMetadata({
    userId: user.id,
    username: user.username,
    email: user.email,
  })

  return {
    status,
    metadata,
  }
})
