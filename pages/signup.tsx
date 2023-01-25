import { BlitzPage, Routes } from "@blitzjs/next"
import { useRouter } from "next/router"
import { Flex } from "@chakra-ui/react"

import Layout from "app/core/layouts/Layout"
import { SignupForm } from "app/auth/components/SignupForm"

const SignupPage: BlitzPage = () => {
  const router = useRouter()

  return (
    <Flex w="100%" justifyContent="center">
      <SignupForm onSuccess={() => router.push(Routes.CompleteProfile())} />
    </Flex>
  )
}

SignupPage.redirectAuthenticatedTo = "/"
SignupPage.getLayout = (page) => <Layout title="Sign Up">{page}</Layout>

export default SignupPage
