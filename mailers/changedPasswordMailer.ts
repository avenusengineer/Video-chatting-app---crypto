import mailer from "./mailer"

type ResetPasswordMailer = {
  to: string
  token: string
  name: string
}

export function changedPasswordMailer({ to, token, name }: ResetPasswordMailer) {
  const origin = process.env.EXTERNAL_URL || process.env.BLITZ_DEV_SERVER_ORIGIN
  const resetUrl = `${origin}/reset-password?token=${token}`

  const msg = {
    to,
    subject: "Your Password Reset Instructions",
    html: `
      <h1>Reset Your Password</h1>

      <p>${name.slice(0, name.indexOf(" "))}, you have successfully changed your password.</p>

      <p>If you did not change your password, please contact us immediately.</p>

      <a href="${resetUrl}">
        Click here to set a new password
      </a>
    `,
  }

  return mailer(msg)
}
