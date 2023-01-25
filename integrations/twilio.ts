import twilio from "twilio"
import { BucketListInstanceCreateOptions } from "twilio/lib/rest/verify/v2/service/rateLimit/bucket"

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SERVICE_SID } = process.env

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

interface RateLimit {
  uniqueName: string
  description: string
  config: BucketListInstanceCreateOptions
}

const RATE_LIMITS: ReadonlyArray<RateLimit> = [
  {
    uniqueName: "ipMinutes",
    description: "Rate limit for sending OTPs via IP",
    config: {
      max: 3,
      interval: 60,
    },
  },
  {
    uniqueName: "uniqueKey",
    description: "Rate limit for sending OTPs",
    config: {
      max: 3,
      interval: 60,
    },
  },
  {
    uniqueName: "ipHourly",
    description: "Rate limit for sending OTPs via IP and key",
    config: {
      max: 30,
      interval: 3600,
    },
  },
]

;(async () => {
  if (process.env.NODE_ENV === "production") {
    const results = await client.verify.services(TWILIO_SERVICE_SID!).rateLimits.list()

    // If rate limit does not exist, create it
    for (const { uniqueName, description, config } of RATE_LIMITS) {
      if (!results.some((result) => result.uniqueName === uniqueName)) {
        const rateLimits = await client.verify.services(TWILIO_SERVICE_SID!).rateLimits.create({
          description,
          uniqueName,
        })

        await rateLimits.buckets().create(config)
      }
    }
  }
})()

export const verifyPhone = async (phone: string) => {
  const result = await client.lookups.v2.phoneNumbers(phone).fetch()
  console.log("RESULT", result)
}

export const sendOTPCode = async (to: string, ip?: string, channel: "sms" | "email" = "sms") => {
  await client.verify.services(TWILIO_SERVICE_SID!).verifications.create({
    rateLimits: {
      uniqueKey: to,
      ipMinutes: ip,
      ipHourly: ip,
    },
    to,
    channel,
  })
}

export const verifyOTPCode = async (to: string, code: string) => {
  try {
    const result = await client.verify.services(TWILIO_SERVICE_SID!).verificationChecks.create({
      to,
      code,
    })

    return result.status === "approved"
  } catch (error) {
    if (error.status === 404) {
      return false
    }

    throw error
  }
}

export default client
