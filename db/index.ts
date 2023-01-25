import { enhancePrisma } from "blitz"
import { PrismaClient, User, UserImage } from "@prisma/client"

import { getBucketEndpoint } from "s3"

const EnhancedPrisma = enhancePrisma(PrismaClient)

const client = new EnhancedPrisma()

const HTTP_SCHEME_REGEX = /^http(s)?:\/\//

const correctImagesSources = (images: UserImage[]) => {
  const bucketEndpoint = getBucketEndpoint()
  return images.map((image) => ({
    ...image,
    url: HTTP_SCHEME_REGEX.test(image.url) ? image.url : `${bucketEndpoint}/${image.url}`,
  }))
}

// Ensure middleware is only run once
if (!globalThis.addedUserMiddleware) {
  client.$use(async (params, next) => {
    if (params.model === "User") {
      const result = await next(params)
      if (Array.isArray(result)) {
        return result.map((user: User & { images?: UserImage[] }) => ({
          ...user,
          images: user.images ? correctImagesSources(user.images) : undefined,
        }))
      } else if (result) {
        result.images = result.images ? correctImagesSources(result.images) : undefined
      }

      return result
    } else if (params.model === "Call") {
      const result = await next(params)

      if (Array.isArray(result)) {
        return result.map((call) => {
          if (call.author?.images) {
            call.author.images = correctImagesSources(call.author.images)
          }

          if (call.participant?.images) {
            call.participant.images = correctImagesSources(call.participant.images)
          }

          return call
        })
      }

      return result
    }

    return await next(params)
  })

  globalThis.addedUserMiddleware = true
}

export * from "@prisma/client"

export default client
