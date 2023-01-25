import Link from "next/link"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { BlitzPage, Routes } from "@blitzjs/next"
import { Flex } from "@chakra-ui/react"

import Layout from "app/core/layouts/Layout"
import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Form, FORM_ERROR } from "app/core/components/Form"
import { ResetPassword } from "app/auth/validations"
import resetPassword from "app/auth/mutations/resetPassword"
import ContainerForm from "app/core/components/ContainerForm"

const ResetPasswordPage: BlitzPage = () => {
  const query = useRouter().query
  const [resetPasswordMutation, { isSuccess }] = useMutation(resetPassword)

  return (
    <Flex w="full" justifyContent="center">
      <ContainerForm heading="Set a New Password">
        {isSuccess ? (
          <div>
            <h2>Password Reset Successfully</h2>
            <p>
              Go to the <Link href={Routes.Home()}>homepage</Link>
            </p>
          </div>
        ) : (
          <Form
            submitText="Reset Password"
            schema={ResetPassword}
            initialValues={{
              password: "",
              passwordConfirmation: "",
              token: query.token as string,
            }}
            onSubmit={async (values) => {
              try {
                await resetPasswordMutation(values)
              } catch (error) {
                if (error.name === "ResetPasswordError") {
                  return {
                    [FORM_ERROR]: error.message,
                  }
                } else {
                  return {
                    [FORM_ERROR]: "Sorry, we had an unexpected error. Please try again.",
                  }
                }
              }
            }}
          >
            <LabeledTextField name="password" label="New Password" type="password" />
            <LabeledTextField
              name="passwordConfirmation"
              label="Confirm New Password"
              type="password"
            />
          </Form>
        )}
      </ContainerForm>
    </Flex>
  )
}

ResetPasswordPage.redirectAuthenticatedTo = "/"
ResetPasswordPage.getLayout = (page) => <Layout title="Reset Your Password">{page}</Layout>

export default ResetPasswordPage
