import previewEmail from "preview-email"

import sendgrid from "integrations/sendgrid"

interface Message {
  from?: string
  to: string
  subject: string
  html: string
}

const DEFAULT_MAIL_FROM = "no-reply@seconds.app"

const mailer = ({ from = DEFAULT_MAIL_FROM, ...rest }: Message) => ({
  async send() {
    if (process.env.NODE_ENV === "production") {
      await sendgrid.send({ from, ...rest })
    } else {
      // Preview email in the browser
      await previewEmail({ from, ...rest })
    }
  },
})

export default mailer
