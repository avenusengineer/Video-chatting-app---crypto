import Link from "next/link"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { Button, Flex, Text } from "@chakra-ui/react"
import { useState } from "react"
import { parsePhoneNumber } from "react-phone-number-input"

import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Form, FORM_ERROR } from "app/core/components/Form"
import signup from "app/auth/mutations/signup"
import { Signup } from "app/auth/validations"
import ContainerForm from "app/core/components/ContainerForm"
import sendOTP from "app/auth/mutations/sendOTP"
import { SendOTP } from "app/auth/validations"
import PinCodeForm from "app/auth/components/PinCodeForm"
import Google from "app/core/icons/Google"
import getUserCountry from "app/users/queries/getUserCountry"
import PhoneField from "app/core/components/PhoneField"
import Apple from "app/core/icons/Apple"

type SignupFormProps = {
  onSuccess?: () => void
}

export const SignupForm = (props: SignupFormProps) => {
  const [sendOTPMutation, { isLoading }] = useMutation(sendOTP)
  const [signupMutation] = useMutation(signup, {
    onSuccess: props.onSuccess,
  })
  const [userCountry] = useQuery(getUserCountry, null, {
    suspense: false,
    useErrorBoundary: false,
    keepPreviousData: true,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retryOnMount: false,
    // 12 hours cache time,
    staleTime: 1000 * 60 * 60 * 12,
  })
  const [isPhone, setIsPhone] = useState(true)
  const [login, setLogin] = useState("")

  if (login) {
    return (
      <PinCodeForm
        countryCode={userCountry?.countryCode as never}
        login={login}
        isPhone={isPhone}
        schema={Signup}
        onSubmit={async ({ code }) => {
          try {
            await signupMutation({
              code,
              ...(isPhone ? { phone: login } : { email: login }),
            })
          } catch (error) {
            return { [FORM_ERROR]: error.message || error.toString() }
          }
        }}
      />
    )
  }

  return (
    <ContainerForm heading="Join Seconds today" hideLogo>
      <Flex flexDir="column" gridGap="2rem">
        <Flex flexDir="column" gridGap="1rem">
          <Link href="/api/auth/google">
            <Button
              bg="white"
              color="black"
              py="1.5rem"
              fontWeight="medium"
              leftIcon={<Google boxSize={6} />}
            >
              Continue with Google
            </Button>
          </Link>
          <Link href="/api/auth/apple">
            <Button
              bg="black"
              color="white"
              py="1.5rem"
              fontWeight="medium"
              leftIcon={<Apple boxSize={6} />}
            >
              Continue with Apple
            </Button>
          </Link>
        </Flex>
        <Text
          display="flex"
          flexDir="row"
          fontWeight="semibold"
          sx={{
            ":before, :after": {
              content: '""',
              flex: "1 1",
              borderBottom: "1px solid",
              margin: "auto",
            },
            ":after": {
              marginLeft: "1.5rem",
            },
            ":before": {
              marginRight: "1.5rem",
            },
          }}
        >
          or
        </Text>
        <Form
          schema={SendOTP}
          style={{ height: "100%" }}
          onSubmit={async ({ email, phone }) => {
            try {
              await sendOTPMutation(isPhone ? { phone } : { email })
              setLogin(
                (isPhone
                  ? parsePhoneNumber(phone!, userCountry?.countryCode)?.number || phone
                  : email)!
              )
            } catch (error) {
              if (error.name === "SendOTPTakenError") {
                return isPhone
                  ? { phone: "Phone is already used" }
                  : { email: "Email is already used" }
              }
              return { [FORM_ERROR]: error.message || error.toString() }
            }
          }}
        >
          {({ handleSubmit, dirtyFields, values }) => (
            <Flex flexDir="column" justifyContent="space-between" h="full" gridGap="2rem">
              <Flex flexDir="column" gridGap=".5rem">
                <Flex textAlign="end" w="full" justifyContent="flex-end">
                  <Text
                    color="#5798FF"
                    cursor="pointer"
                    fontWeight="semibold"
                    onClick={() => {
                      setIsPhone(!isPhone)
                    }}
                  >
                    Use {isPhone ? "email" : "phone"} instead
                  </Text>
                </Flex>
                {isPhone ? (
                  <PhoneField name="phone" defaultCountryCode={userCountry?.countryCode as never} />
                ) : (
                  <LabeledTextField
                    type="email"
                    name="email"
                    label="Email"
                    placeholder="example@seconds.app"
                  />
                )}
                <Text fontSize="xs" opacity=".75" fontWeight="semibold">
                  {isPhone ? "We will text you a code." : "We will email you a code."}
                </Text>
              </Flex>
              <Flex flexDir="column" gridGap=".5rem">
                <Button
                  type="submit"
                  bg="white"
                  color="black"
                  w="full"
                  borderRadius="3xl"
                  py="1.5rem"
                  isLoading={isLoading}
                  onSubmit={handleSubmit}
                  disabled={
                    !(isPhone
                      ? dirtyFields.phone && values.phone
                      : dirtyFields.email && values.email)
                  }
                >
                  Send Code
                </Button>
                <Text
                  opacity=".75"
                  fontSize="sm"
                  textAlign="center"
                  sx={{
                    "> a": {
                      fontWeight: "bold",
                    },
                  }}
                >
                  By signing up, you agree to our{" "}
                  <a href="/terms" target="_blank">
                    terms
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" target="_blank">
                    privacy policy
                  </a>
                  .
                </Text>
              </Flex>
            </Flex>
          )}
        </Form>
      </Flex>
    </ContainerForm>
  )
}

export default SignupForm
