import { log } from "@blitzjs/display"
import { Client } from "minio"
import sharp, { Region } from "sharp"
import { PassThrough, Stream } from "stream"
import { customAlphabet } from "nanoid"
import { encode, isBlurhashValid } from "blurhash"

import db from "db"

const { S3_ENDPOINT, S3_PORT, S3_ACCESS_KEY, S3_SECRET_KEY, S3_USE_SSL, CDN_BASE_URL } = process.env

const client = new Client({
  endPoint: S3_ENDPOINT!,
  port: S3_PORT ? parseInt(S3_PORT, 10) : undefined,
  accessKey: S3_ACCESS_KEY!,
  secretKey: S3_SECRET_KEY!,
  useSSL: S3_USE_SSL?.toLowerCase() === "true",
})

export async function initBucket() {
  const bucketExists = await client.bucketExists(SECONDS_BUCKET)

  // If bucket does not exist, create it.
  if (!bucketExists) {
    await client.makeBucket(SECONDS_BUCKET, "us-east-1")
    log.success(`Initialized ${SECONDS_BUCKET} bucket`)
  }
}

export const getBucketEndpoint = () => {
  if (CDN_BASE_URL) {
    return CDN_BASE_URL
  }

  const { protocol, host, port } = client as any
  return protocol + "//" + host + (port ? `:${port}` : "") + "/" + SECONDS_BUCKET
}

export const SECONDS_BUCKET = "seconds"
const ProfilePictureSizes = [800, 400, 64] as const
export type ProfilePictureSize = (typeof ProfilePictureSizes)[number]
export type UserProfilePictures = Record<ProfilePictureSize, string>

export const userPicturePath = (userId: string, name: string, size: ProfilePictureSize) =>
  `/users/${userId}/${name}_${size}.jpg`

export const userProfilePicturePath = (userId: string, name: string) =>
  Object.fromEntries(
    ProfilePictureSizes.map((size) => [size, userPicturePath(userId, name, size)])
  ) as UserProfilePictures

interface Size {
  size: ProfilePictureSize
  quality: number
}

const SIZES: Size[] = [
  {
    size: 64,
    quality: 80,
  },
  {
    size: 400,
    quality: 90,
  },
  {
    size: 800,
    quality: 95,
  },
]

export const updateUserPicture = async (userId: string, file: Stream, region?: Region) => {
  const fileName = customAlphabet("1234567890abcdef", 8)()
  const paths = userProfilePicturePath(userId, fileName)

  let pipeline = sharp().toFormat("jpeg")

  if (region) {
    pipeline = pipeline.extract(region)
  }

  file.pipe(pipeline)
  let imageHash
  let imageHashValid = false
  await Promise.all([
    (async () => {
      const { data, info } = await pipeline
        .clone()
        .jpeg({ quality: 10 })
        .resize(200, 200)
        .raw()
        .ensureAlpha()
        .toBuffer({ resolveWithObject: true })

      imageHash = encode(new Uint8ClampedArray(data), info.width, info.height, 4, 4)
      if (isBlurhashValid(imageHash)) {
        imageHashValid = true
      }
    })(),
    ...SIZES.map(({ size, quality }) => {
      const passthroughs = new PassThrough()
      pipeline
        .clone()
        .jpeg({ quality })
        .resize({
          width: size,
          height: size,
          fit: sharp.fit.cover,
        })
        .pipe(passthroughs)

      return client.putObject(SECONDS_BUCKET, paths[size], passthroughs, {
        "x-amz-acl": "public-read",
      })
    }),
  ])
  const imagesCount = await db.user.findFirst({
    where: { id: userId },
    select: { _count: { select: { images: true } } },
  })

  await db.userImage.create({
    data: {
      userId,
      hash: imageHashValid ? imageHash : undefined,
      url: paths[400],
      order: imagesCount?._count.images || 0,
    },
  })

  return paths
}

export const removeUserPictures = async (basePath: string) => {
  const objects = SIZES.map(({ size }) => basePath.replace(`_${400}.`, `_${size}.`))
  await client.removeObjects(SECONDS_BUCKET, objects)
}

export default client
