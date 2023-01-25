import { getSession } from "@blitzjs/auth"
import { NextApiResponse, NextApiRequest } from "next"

import { api } from "app/blitz-server"
import { newUserToken } from "helpers/session"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession(req, res)
  const token = newUserToken(session.userId)

  res.statusCode = 200
  res.setHeader("Content-Type", "application/json")
  res.end(JSON.stringify({ token }))
}

export default api(handler)
