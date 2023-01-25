import { NextApiRequest, NextApiResponse } from "next"
import { log } from "@blitzjs/display"

import { api } from "app/blitz-server"
import db from "db"
import passbase from "integrations/passbase"

type PassbasePayload =
  | {
      event: "VERIFICATION_COMPLETED"
      key: string
      status: "pending" | "approved" | "declined"
      created: number
      updated: number
      processed: number
    }
  | {
      event: "VERIFICATION_REVIEWED"
      key: string
      status: "approved" | string
      created: number
      updated: number
      processed: number
    }

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).end()
  }

  const payload = req.body as PassbasePayload
  const identity = await passbase.getIdentityById(req.body.key)
  log.info(`Passbase callback (${payload.event}): ${JSON.stringify(identity.metadata)}`)

  if (payload.event === "VERIFICATION_REVIEWED") {
    await db.user.update({
      where: {
        id: identity.metadata!.userId as string,
      },
      data: {
        kycReferenceKey: req.body.key,
        kycVerifiedAt: identity.status === "approved" ? new Date() : null,
        kycData: identity.owner as object,
        role: identity.status === "approved" ? "CREATOR" : undefined,
      },
    })

    log.info(`User: ${identity.metadata!.username} is now ${identity.status}`)
  } else if (payload.event === "VERIFICATION_COMPLETED") {
    await db.user.update({
      where: {
        id: identity.metadata!.userId as string,
      },
      data: {
        kycReferenceKey: req.body.key,
        kycSubmittedAt: new Date(),
      },
    })
  }

  res.status(200).end()
}

export default api(handler)
