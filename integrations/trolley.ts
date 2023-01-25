import { connect, RecipientAccount } from "paymentrails"
import { RecipientInput } from "paymentrails/dist/RecipientGateway"

const {
  TROLLEY_API_KEY = "",
  TROLLEY_API_SECRET = "",
  TROLLEY_API_ENVIRONMENT = "sandbox",
} = process.env

const client = connect({
  key: TROLLEY_API_KEY,
  secret: TROLLEY_API_SECRET,
  environment: TROLLEY_API_ENVIRONMENT as never,
})

export const createRecipient = async (input: RecipientInput) => {
  console.info("Creating recipient", input)
  return await client.recipient.create({
    type: "individual",
    ...input,
  })
}

export const createRecipientAccount = async (recipientId: string, input: RecipientAccount) => {
  console.info("Creating recipient account", input)
  return await client.recipientAccount.create(recipientId, {
    ...input,
  })
}

export const fetchRecipient = async (recipientId: string) => {
  console.log("Fetching recipient", recipientId)
  return await client.recipient.find(recipientId)
}

export const fetchRecipientAccounts = async (recipientId: string) => {
  console.log("Fetching recipient accounts", recipientId)
  return await client.recipientAccount.all(recipientId)
}

export default client
