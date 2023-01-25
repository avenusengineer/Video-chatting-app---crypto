import jwt from "jsonwebtoken"

function assert(condition: any, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

export const getSessionSecretKey = () => {
  if (process.env.NODE_ENV === "production") {
    assert(
      process.env.SESSION_SECRET_KEY,
      "You must provide the SESSION_SECRET_KEY environment variable in production. This is used to sign and verify tokens. It should be 32 chars long."
    )

    assert(
      process.env.SESSION_SECRET_KEY.length >= 32,
      "The SESSION_SECRET_KEY environment variable must be at least 32 bytes for sufficient token security"
    )

    return process.env.SESSION_SECRET_KEY
  } else {
    return process.env.SESSION_SECRET_KEY || "default-dev-secret"
  }
}

export const newUserToken = (userId) =>
  jwt.sign({ userId: userId }, getSessionSecretKey(), {
    expiresIn: "12h",
    algorithm: "HS256",
  })

const validateToken = <T = any>(token: string) =>
  jwt.verify(token, getSessionSecretKey(), {
    algorithms: ["HS256"],
  }) as T

export const parseUserToken = (token: string) => validateToken(token).userId as string
