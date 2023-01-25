import { useMutation } from "@blitzjs/rpc"
import { Button, Flex, HStack, Text, VStack } from "@chakra-ui/react"
import { Country, parsePhoneNumber } from "react-phone-number-input"
import { ZodSchema } from "zod"

import { Form, FormProps } from "app/core/components/Form"
import ContainerForm from "app/core/components/ContainerForm"
import sendOTP from "app/auth/mutations/sendOTP"
import PinField from "app/core/components/PinField"

export type PinCodeFormProps<S extends ZodSchema> = FormProps<S> & {
  login: string
  isPhone?: boolean
  countryCode?: Country
}

const PinCodeForm = <S extends ZodSchema>({
  login,
  isPhone,
  countryCode = "US",
  ...props
}: PinCodeFormProps<S>) => {
  const [sendOTPMutation, { isLoading }] = useMutation(sendOTP)

  return (
    <ContainerForm>
      <Form {...props}>
        {({ handleSubmit, submitting }) => (
          <Flex flexDir="column" gridGap="2rem">
            <Text fontSize="3xl" fontWeight="bold">
              Enter the code we {isPhone ? "texted" : "emailed"} you
            </Text>
            <HStack justifyContent="center">
              <PinField name="code" onComplete={() => handleSubmit()} />
            </HStack>
            <VStack align="end" spacing="0">
              <Text opacity=".75" fontWeight="bold" fontSize="lg">
                {isPhone
                  ? parsePhoneNumber(login, countryCode)?.formatInternational() || login
                  : login}
              </Text>
              <Button
                pr="0"
                fontSize="lg"
                color="#5798FF"
                fontWeight="bold"
                sx={{ _hover: { bg: "none" } }}
                isLoading={isLoading}
                onClick={async () => {
                  await sendOTPMutation(isPhone ? { phone: login } : { email: login })
                }}
                variant="ghost"
              >
                resend
              </Button>
            </VStack>
            <Button
              bg="white"
              color="black"
              borderRadius="full"
              onClick={() => handleSubmit()}
              isLoading={submitting}
            >
              Submit
            </Button>
          </Flex>
        )}
      </Form>
    </ContainerForm>
  )
}

export default PinCodeForm
