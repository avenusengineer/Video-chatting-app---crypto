import { useRouter } from "next/router"
import { useMutation } from "@blitzjs/rpc"
import { BlitzPage } from "@blitzjs/next"
import { Flex } from "@chakra-ui/react"
import { useEffect } from "react"
import { Loader } from "react-feather"

import verifyEmail from "app/auth/mutations/verifyEmail"

const VerifyEmailPage: BlitzPage = () => {
  const query = useRouter().query
  const router = useRouter()
  const [verifyEmailMutation] = useMutation(verifyEmail, {
    onSettled: () => {
      router.replace("/")
    },
    onError: (error) => {
      console.error("Failed to verify email address. Errror:", (error as Error).message)
    },
  })

  useEffect(() => {
    verifyEmailMutation({
      token: query.token as string,
    })
  }, [query.token, verifyEmailMutation])

  return (
    <Flex w="100%" justifyContent="center">
      <Loader />
    </Flex>
  )
}

export default VerifyEmailPage
