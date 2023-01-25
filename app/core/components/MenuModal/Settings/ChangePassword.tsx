import { useMutation } from "@blitzjs/rpc"
import { Flex, Text } from "@chakra-ui/react"
import { FC } from "react"

import changePassword from "app/auth/mutations/changePassword"
import { ChangePassword as ChangePasswordSchema } from "app/auth/validations"
import Form, { FORM_ERROR } from "app/core/components/Form"
import LabeledTextField from "app/core/components/LabeledTextField"

const ChangePassword: FC = () => {
  const [changePasswordMutation] = useMutation(changePassword)

  return (
    <Flex flexDir="column">
      <Text fontSize="xl" fontWeight="bold">
        Change password
      </Text>

      <Form
        schema={ChangePasswordSchema}
        submitText="Change password"
        initialValues={{ currentPassword: "", newPassword: "" }}
        onSubmit={async (values) => {
          try {
            await changePasswordMutation(values)
          } catch (error) {
            if (error.name === "ChangePasswordError") {
              return { [FORM_ERROR]: error.message }
            } else {
              return {
                [FORM_ERROR]: "Sorry, we had an unexpected error. Please try again.",
              }
            }
          }
        }}
      >
        <LabeledTextField name="currentPassword" label="Current password" type="password" />
        <LabeledTextField name="newPassword" label="New Password" type="password" />
      </Form>
    </Flex>
  )
}

export default ChangePassword
