import mailer from "./mailer"

type VerifyEmailMailer = {
  to: string
  token: string
}

export function verifyEmailMailer({ to, token }: VerifyEmailMailer) {
  const origin = process.env.EXTERNAL_URL || process.env.BLITZ_DEV_SERVER_ORIGIN
  const resetUrl = `${origin}/verify-email?token=${token}`

  const msg = {
    to,
    subject: "Confirm your email address",
    html: `
      <h1>Confirm your email address</h1>

      <a href="${resetUrl}">
        Click here to confirm
      </a>
    `,
  }

  return mailer(msg)
}
