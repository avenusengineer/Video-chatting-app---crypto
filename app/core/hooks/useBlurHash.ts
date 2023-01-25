import { useMemo } from "react"

import { decodeImageHash } from "helpers/image-hash"

const useBlurHash = (hash: string | null | undefined) => {
  return useMemo(() => (hash ? decodeImageHash(hash) : undefined), [hash])
}

export default useBlurHash
