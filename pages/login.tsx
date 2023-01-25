import { BlitzPage } from "@blitzjs/next"
import { useRouter } from "next/router"
import { Flex } from "@chakra-ui/react"

import Layout from "app/core/layouts/Layout"
import { LoginForm } from "app/auth/components/LoginForm"
import LoginFormProvider from "app/core/contexts/LoginFormProvider"

const LoginPage: BlitzPage = () => {
  const router = useRouter()

  return (
    <LoginFormProvider>
      <Flex w="100%" justifyContent="center">
        <LoginForm
          onSuccess={() => {
            const next = router.query.next ? decodeURIComponent(router.query.next as string) : "/"
            router.push(next)
          }}
        />
      </Flex>
    </LoginFormProvider>
  )
}

LoginPage.redirectAuthenticatedTo = "/"
LoginPage.getLayout = (page) => <Layout title="Seconds - Log In">{page}</Layout>

export default LoginPage
