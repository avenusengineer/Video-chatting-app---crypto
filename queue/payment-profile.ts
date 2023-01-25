import { log } from "blitz"
import Bull, { Queue } from "bull"

import db from "db"
import { createCustomerProfileFromTransactionID } from "integrations/authorize"
import { parseOptionsFromURL } from "redis"

interface PaymentProfileQueueProps {
  userId: string
  transactionId: string
}

export const paymentProfileQueue: Queue<PaymentProfileQueueProps> = new Bull("PAYMENT_PROFILE", {
  redis: parseOptionsFromURL() as never,
  defaultJobOptions: {
    removeOnComplete: true,
  },
})

paymentProfileQueue.process(async ({ data: { userId, transactionId } }) => {
  const { email } = await db.user.findFirstOrThrow({
    select: { email: true },
    where: { id: userId },
  })

  await createCustomerProfileFromTransactionID({
    transactionId,
    userId,
    email: email || `${userId}@seconds.app`,
  })

  log.success(`Created payment profile for user: ${userId}`)
})
