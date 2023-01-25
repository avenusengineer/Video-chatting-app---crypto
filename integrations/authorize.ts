import { APIContracts, APIControllers, Constants } from "authorizenet"
import murmurhash from "murmurhash"

const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType()
merchantAuthenticationType.setName(process.env.AUTHORIZE_NET_API_LOGIN_ID || "")
merchantAuthenticationType.setTransactionKey(process.env.AUTHORIZE_NET_TRANSACTION_KEY || "")

export const hashUserId = (userId: string) => murmurhash.v3(userId).toString()

interface PaymentMethod {
  paymentProfileId: string
  customerProfileId: string
  fullName: string
  zip: string
  cardNumber: string
  expirationDate: string
  cardType: string
}

export const getPaymentMethods = async (userId: string): Promise<PaymentMethod[]> => {
  const getCustomerProfileRequest = new APIContracts.GetCustomerProfileRequest()
  getCustomerProfileRequest.setMerchantAuthentication(merchantAuthenticationType)
  getCustomerProfileRequest.setMerchantCustomerId(hashUserId(userId))
  getCustomerProfileRequest.setIncludeIssuerInfo(true)
  // getCustomerProfileRequest.setUnmaskExpirationDate(true)

  const controller = new APIControllers.GetCustomerProfileController(
    getCustomerProfileRequest.getJSON()
  )

  return new Promise((resolve, reject) => {
    controller.execute(() => {
      const apiResponse = controller.getResponse()
      const response = new APIContracts.GetCustomerProfileResponse(apiResponse)

      if (response.getMessages().resultCode !== APIContracts.MessageTypeEnum.OK) {
        // This error occurs when the user has not yet added a payment method
        if (response.getMessages().getMessage()?.[0]?.getCode?.() === "E00040") {
          return resolve([])
        }

        return reject(response.getMessages())
      }

      const profile = new APIContracts.CustomerProfileMaskedType(response.getProfile())

      return resolve(
        (profile.getPaymentProfiles() ?? []).map((paymentProfile) => {
          const payment = new APIContracts.CustomerPaymentProfileMaskedType(paymentProfile)
          const billing = new APIContracts.CustomerAddressType(payment.getBillTo())
          const creditCard = new APIContracts.CreditCardMaskedType(
            paymentProfile.payment.creditCard
          )

          return {
            paymentProfileId: payment.getCustomerPaymentProfileId(),
            customerProfileId: profile.getCustomerProfileId(),
            fullName: billing.getFirstName() + " " + billing.getLastName(),
            zip: billing.getZip(),
            cardNumber: creditCard.getCardNumber(),
            expirationDate: creditCard.getExpirationDate(),
            cardType: creditCard.getCardType(),
          }
        })
      )
    })
  })
}

export const deletePaymentMethod = async (customerProfileId: string, paymentProfileId: string) => {
  const deleteCustomerPaymentProfileRequest = new APIContracts.DeleteCustomerPaymentProfileRequest()
  deleteCustomerPaymentProfileRequest.setMerchantAuthentication(merchantAuthenticationType)
  deleteCustomerPaymentProfileRequest.setCustomerProfileId(customerProfileId)
  deleteCustomerPaymentProfileRequest.setCustomerPaymentProfileId(paymentProfileId)

  const controller = new APIControllers.DeleteCustomerPaymentProfileController(
    deleteCustomerPaymentProfileRequest.getJSON()
  )

  return new Promise((resolve, reject) => {
    controller.execute(() => {
      const apiResponse = controller.getResponse()
      const response = new APIContracts.DeleteCustomerPaymentProfileResponse(apiResponse)

      if (response.getMessages().resultCode !== APIContracts.MessageTypeEnum.OK) {
        return reject(response.getMessages())
      }

      return resolve(response)
    })
  })
}

interface CreateCustomerProfileFromTransactionID {
  transactionId: string
  email: string
  userId: string
}

export const createCustomerProfileFromTransactionID = ({
  transactionId,
  email,
  userId,
}: CreateCustomerProfileFromTransactionID) => {
  const hashedUserId = hashUserId(userId)
  const customer = new APIContracts.CustomerProfileBaseType()
  customer.setDescription(userId)
  customer.setEmail(email)
  customer.setMerchantCustomerId(hashedUserId)

  const profileRequest = new APIContracts.CreateCustomerProfileFromTransactionRequest()
  profileRequest.setMerchantAuthentication(merchantAuthenticationType)
  profileRequest.setTransId(transactionId)
  profileRequest.setCustomer(customer)

  const controller = new APIControllers.CreateCustomerProfileFromTransactionController(
    profileRequest.getJSON()
  )

  return new Promise((resolve, reject) => {
    controller.execute(() => {
      const apiResponse = controller.getResponse()
      const response = new APIContracts.CreateCustomerProfileResponse(apiResponse)

      if (response.getMessages().resultCode !== APIContracts.MessageTypeEnum.OK) {
        return reject(response.getMessages())
      }

      return resolve(response.getCustomerProfileId())
    })
  })
}

interface CreateTransactionResponse {
  transactionId: string
  accountNumber: string
  accountType: string
}

type CreateTransaction = {
  amount: number
  nonce: string
  userId: string
  paymentProfileId: string
  customerProfileId: string
}

export const createTransaction = async (
  params: CreateTransaction
): Promise<CreateTransactionResponse> => {
  // Create transaction
  const transactionRequest = new APIContracts.TransactionRequestType()
  transactionRequest.setTransactionType(APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION)
  transactionRequest.setAmount(params.amount)

  if (params.nonce) {
    const opaqueData = new APIContracts.OpaqueDataType()
    opaqueData.setDataDescriptor("COMMON.ACCEPT.INAPP.PAYMENT")
    opaqueData.setDataValue(params.nonce)

    const paymentType = new APIContracts.PaymentType()
    paymentType.setOpaqueData(opaqueData)

    transactionRequest.setPayment(paymentType)
  } else {
    const profile = new APIContracts.CustomerProfilePaymentType()
    profile.setCustomerProfileId(params.customerProfileId)

    const paymentProfile = new APIContracts.PaymentProfile()
    paymentProfile.setPaymentProfileId(params.paymentProfileId)
    profile.setPaymentProfile(paymentProfile)

    transactionRequest.setProfile(profile)
  }

  const request = new APIContracts.CreateTransactionRequest()
  request.setMerchantAuthentication(merchantAuthenticationType)
  request.setTransactionRequest(transactionRequest)

  const controller = new APIControllers.CreateTransactionController(request.getJSON())
  controller.setEnvironment(
    process.env.AUTHORIZE_NET_ENVIRONMENT !== "PRODUCTION"
      ? Constants.endpoint.sandbox
      : Constants.endpoint.production
  )

  return new Promise((resolve, reject) => {
    controller.execute(() => {
      const response = new APIContracts.CreateTransactionResponse(controller.getResponse())
      const transaction = response.getTransactionResponse() as APIContracts.TransactionResponse

      if (response.getMessages().resultCode !== APIContracts.MessageTypeEnum.OK) {
        return reject(response.getMessages())
      }

      return resolve({
        accountNumber: transaction.getAccountNumber(),
        accountType: transaction.getAccountType(),
        transactionId: transaction.getTransId(),
      })
    })
  })
}
