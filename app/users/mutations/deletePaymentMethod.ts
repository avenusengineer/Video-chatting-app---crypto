import { resolver } from "@blitzjs/rpc"

import { deletePaymentMethod } from "integrations/authorize"
import { DeletePaymentMethod } from "../validations"

export default resolver.pipe(
  resolver.authorize(),
  resolver.zod(DeletePaymentMethod),
  async ({ paymentProfileId, customerProfileId }) => {
    await deletePaymentMethod(customerProfileId, paymentProfileId)
  }
)
