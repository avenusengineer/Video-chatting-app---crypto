import sendgrid from "@sendgrid/mail"

if (process.env.SENDGRID_API_KEY) {
  sendgrid.setApiKey(process.env.SENDGRID_API_KEY)
}

export default sendgrid
