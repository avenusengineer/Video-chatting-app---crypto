import { PassbaseClient, PassbaseConfiguration } from "@passbase/node"
import crypto from "crypto"

const { PASSBASE_API_KEY, PASSBASE_PRIVATE_KEY } = process.env

export type PassbaseStatus =
  | "created"
  | "processing"
  | "processed"
  | "verified"
  | "unverified"
  | "pending"
  | "approved"
  | "declined"

const config = new PassbaseConfiguration({
  apiKey: PASSBASE_API_KEY!,
})

export const encodeMetadata = (metadata: Record<string, any>): string => {
  const privateKey = crypto.createPrivateKey({
    format: "pem",
    key: Buffer.from(PASSBASE_PRIVATE_KEY!, "base64").toString("ascii"),
  })

  return crypto.privateEncrypt(privateKey, Buffer.from(JSON.stringify(metadata))).toString("base64")
}

export default new PassbaseClient(config)
