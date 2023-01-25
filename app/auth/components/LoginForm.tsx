import Link from "next/link"
import { Routes } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { Button, Flex, Text } from "@chakra-ui/react"
import { useState } from "react"
import { ZodError } from "zod"
import { AuthenticationError } from "blitz"
import { Country, isValidPhoneNumber, parsePhoneNumber } from "react-phone-number-input"

import { Form, FORM_ERROR } from "app/core/components/Form"
import login from "app/auth/mutations/login"
import { Login } from "app/auth/validations"
import ContainerForm from "app/core/components/ContainerForm"
import sendOTP from "app/auth/mutations/sendOTP"
import verifyOTP from "app/auth/mutations/verifyOTP"
import { VerifyOTP, SendOTP } from "app/auth/validations"
import PinCodeForm from "./PinCodeForm"
import useLoginFormContext from "app/core/hooks/useLoginFormContext"
import AnimatedTextField from "app/core/components/AnimatedTextField"
import Google from "app/core/icons/Google"
import getUserInfo from "app/users/mutations/getUserInfo"
import { GetUserInfo } from "app/users/validations"
import getUserCountry from "app/users/queries/getUserCountry"
import Apple from "app/core/icons/Apple"

const UserLoginForm = ({ onSuccess, countryCode }: LoginFormProps) => {
  const [sendOTPMutation] = useMutation(sendOTP)
  const [, setLoginForm] = useLoginFormContext()
  const [loginMutation] = useMutation(login, { onSuccess })
  const [isOTP, setIsOTP] = useState(false)
  const [getUserInfoMutation, { data, isSuccess, variables }] = useMutation(getUserInfo)

  if (isSuccess && data && !data.phone) {
    if (isOTP) {
      return (
        <Form
          onSubmit={async (values) => {
            try {
              await sendOTPMutation(values)
              setLoginForm({ login: values.email! })
            } catch (error) {
              if (error.name === "SendOTPNotFoundError") {
                return { email: "This email is not registered" }
              } else {
                if (error instanceof ZodError) {
                  return error.formErrors.fieldErrors
                } else {
                  return {
                    [FORM_ERROR]: "Sorry, we had an unexpected error. Please try again.",
                  }
                }
              }
            }
          }}
          submitText="Send code"
          initialValues={{ email: (variables as any).login, isLogin: true }}
          schema={SendOTP}
          style={{
            height: "100%",
          }}
        >
          <Flex gridGap=".5rem" flexDir="column" pb="6rem">
            <AnimatedTextField name="email" label="Email" />
            <Flex color="#5798FF" fontSize="sm" fontWeight="semibold" cursor="pointer">
              <a onClick={() => setIsOTP(false)}>Use password instead</a>
            </Flex>
          </Flex>
        </Form>
      )
    }

    return (
      <Form
        submitText="Enter"
        schema={Login}
        initialValues={{
          password: "",
          ...(data.email
            ? { email: (variables as any).login }
            : { username: (variables as any).login }),
        }}
        onSubmit={async (values) => {
          try {
            await loginMutation(values)
          } catch (error) {
            if (error instanceof AuthenticationError) {
              return { [FORM_ERROR]: "Sorry, those credentials are invalid" }
            } else {
              return {
                [FORM_ERROR]:
                  "Sorry, we had an unexpected error. Please try again. - " + error.toString(),
              }
            }
          }
        }}
      >
        <AnimatedTextField
          name={data.email ? "email" : "username"}
          label={data.email ? "Email" : "Username"}
        />
        <Flex flexDir="column" gridGap=".4rem" pb="2rem">
          <AnimatedTextField name="password" label="Password" type="password" autoFocus />
          <Flex
            justifyContent="space-between"
            color="#5798FF"
            fontSize="sm"
            alignItems="center"
            fontWeight="semibold"
            cursor="pointer"
            sx={{
              "a:last-child": {
                textAlign: "end",
              },
            }}
          >
            {data.email ? <a onClick={() => setIsOTP(true)}>Get code emailed instead</a> : <div />}
            <Link href={Routes.ForgotPasswordPage()}>
              <a>Forgot password</a>
            </Link>
          </Flex>
        </Flex>
      </Form>
    )
  }

  return (
    <Form
      schema={GetUserInfo}
      onSubmit={async (values) => {
        try {
          const parsedLogin =
            (isValidPhoneNumber(values.login, countryCode) &&
              parsePhoneNumber(values.login, countryCode)?.number) ||
            values.login
          const { phone } = await getUserInfoMutation({ login: parsedLogin })
          if (phone) {
            await sendOTPMutation({ phone: parsedLogin, isLogin: true })
            setLoginForm({ login: parsedLogin, isPhone: true })
          }
        } catch (error) {
          if (error.name === "NotFoundError") {
            return { login: "Sorry, we could not find your account." }
          } else if (error instanceof AuthenticationError) {
            return { [FORM_ERROR]: "Sorry, those credentials are invalid" }
          } else {
            return {
              [FORM_ERROR]:
                "Sorry, we had an unexpected error. Please try again. - " + error.toString(),
            }
          }
        }
      }}
    >
      {({ submitting, handleSubmit }) => (
        <Flex flexDir="column" h="full" justifyContent="space-between" gridGap="3rem">
          <AnimatedTextField name="login" label="Phone, email or username" />
          <Flex flexDir="column">
            <Button
              onClick={() => handleSubmit()}
              type="submit"
              isLoading={submitting}
              bg="white"
              color="black"
              w="full"
              borderRadius="2xl"
            >
              Next
            </Button>
            <Flex
              fontWeight="semibold"
              fontSize="sm"
              gridGap=".25rem"
              w="full"
              justifyContent="center"
              pt="1rem"
            >
              <Text opacity=".75">Don&apos;t have an account?</Text>
              <Link href={Routes.SignupPage()}>
                <a style={{ color: "#5798FF" }}>Sign up</a>
              </Link>
            </Flex>
          </Flex>
        </Flex>
      )}
    </Form>
  )
}

type LoginFormProps = {
  onSuccess?: () => void
  countryCode?: Country
}

export const LoginForm = (props: LoginFormProps) => {
  const [{ isPhone, login }] = useLoginFormContext()
  const [verifyOTPMutation] = useMutation(verifyOTP, { onSuccess: props.onSuccess })
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

  if (login) {
    return (
      <PinCodeForm
        countryCode={userCountry?.countryCode as never}
        isPhone={isPhone}
        login={login}
        schema={VerifyOTP}
        onSubmit={async ({ code }) => {
          try {
            await verifyOTPMutation({
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
    <ContainerForm heading="Sign in to Seconds" hideLogo>
      <Flex flexDir="column" h="full">
        <Flex flexDir="column" gridGap="2rem" h="full">
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
          <UserLoginForm {...props} countryCode={userCountry?.countryCode as never} />
        </Flex>
      </Flex>
    </ContainerForm>
  )
}

export default LoginForm
