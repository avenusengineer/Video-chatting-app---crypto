import { decodeBlurHash } from "fast-blurhash"
import { getImgFromArr } from "array-to-image"

export const decodeImageHash = (hash: string, width = 32, height = 32) => {
  const pixels = decodeBlurHash(hash, width, height)
  return getImgFromArr(pixels, width, height).src
}
