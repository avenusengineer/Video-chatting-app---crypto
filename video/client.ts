import { Twilio, jwt } from "twilio"

const config = {
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_API_KEY: process.env.TWILIO_API_KEY,
  TWILIO_API_SECRET: process.env.TWILIO_API_SECRET,
}

export const getTwilioClient = (): Twilio => {
  if (!config.TWILIO_ACCOUNT_SID || !config.TWILIO_API_KEY || !config.TWILIO_API_SECRET) {
    throw new Error(`Unable to initialize Twilio client`)
  }

  return new Twilio(config.TWILIO_API_KEY!, config.TWILIO_API_SECRET!, {
    accountSid: config.TWILIO_ACCOUNT_SID,
  })
}

export const newAccessToken = (identity: string) =>
  new jwt.AccessToken(
    config.TWILIO_ACCOUNT_SID!,
    config.TWILIO_API_KEY!,
    config.TWILIO_API_SECRET!,
    {
      identity,
    }
  )

export default getTwilioClient
