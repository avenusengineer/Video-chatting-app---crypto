import { invalidateQuery, useMutation, useQuery } from "@blitzjs/rpc"
import {
  Flex,
  Text,
  Stack,
  Button,
  Alert,
  AlertIcon,
  HStack,
  useRadio,
  Box,
  UseRadioProps,
  useRadioGroup,
  Spinner,
  Center,
  Radio,
  Menu,
  RadioGroup,
  MenuItem,
  MenuList,
  MenuButton,
} from "@chakra-ui/react"
import { Field, useForm } from "react-final-form"
import { useAcceptJs } from "react-acceptjs"
import Payment from "payment"
import { FC, Suspense, useEffect, useState } from "react"
import { ChevronDownIcon } from "@chakra-ui/icons"

import Gem from "app/core/icons/Gem"
import getCurrentUser from "app/users/queries/getCurrentUser"
import addGems from "app/users/mutations/addGems"
import getUser from "app/users/queries/getUser"
import { Form, FORM_ERROR } from "app/core/components/Form"
import { AddGemsWithCard } from "app/users/validations"
import getHistory from "app/users/queries/getHistory"
import LabeledTextField from "../../LabeledTextField"
import getPaymentMethods from "app/users/queries/getPaymentMethods"
import Discover from "app/core/icons/Discover"
import Mastercard from "app/core/icons/Mastercard"
import Visa from "app/core/icons/Visa"
import Amex from "app/core/icons/Amex"

const AMOUNT_TO_GEMS = {
  4.99: "500",
  9.99: "1,000",
  19.99: "2,000",
  49.99: "5,000",
  99.99: "10,000",
  299.99: "30,000",
}

const ExpirationField = () => (
  <LabeledTextField
    name="expiration"
    label="Expiration"
    type="text"
    autoComplete="cc-exp"
    inputMode="numeric"
    placeholder="MM / YY"
    config={{
      format: (value: string) => {
        if (!value) return value

        const clearValue = value.replace(/\D/g, "")
        if (clearValue.length >= 3) {
          return `${clearValue.slice(0, 2)} / ${clearValue.slice(2, 4)}`
        }

        return clearValue
      },
    }}
  />
)

const CardNumberField = () => (
  <LabeledTextField
    name="cardNumber"
    label="Card Number"
    autoComplete="cc-number"
    inputMode="numeric"
    placeholder="Card Number"
    type="text"
    config={{
      format: (value: string) => {
        if (!value) return value
        return Payment.fns.formatCardNumber(value)
      },
    }}
  />
)

const CardCodeField = () => (
  <LabeledTextField
    name="cardCode"
    label="CVV"
    type="text"
    autoComplete="cc-csc"
    inputMode="numeric"
    placeholder="CVV"
    config={{
      format: (value: string) => {
        if (!value) return value
        return value.slice(0, 3)
      },
    }}
  />
)

const CreditCardForm = () => (
  <Stack
    spacing={8}
    pt={{
      base: "1rem",
      md: "2rem",
    }}
  >
    <Stack>
      <Flex
        alignItems="center"
        flexDir={{
          base: "row",
          md: "column",
        }}
        justifyContent="space-between"
        gap="0.5rem"
      >
        <LabeledTextField
          name="fullName"
          label="Name on card"
          type="text"
          placeholder="Name on card"
        />
        <LabeledTextField
          name="zip"
          label="Zip code"
          type="text"
          inputMode="numeric"
          placeholder="Zip code"
          config={{
            format: (value: string) => value?.replace(/[^\d]/g, ""),
          }}
        />
      </Flex>
    </Stack>
    <Stack
      mt={{
        base: "0.5rem !important",
        md: "2rem",
      }}
    >
      <CardNumberField />
      <HStack alignItems="start">
        <ExpirationField />
        <CardCodeField />
      </HStack>
    </Stack>
  </Stack>
)

interface PaymentMethodCardProps extends UseRadioProps {
  children: React.ReactNode
}

const PaymentMethodCard: FC<PaymentMethodCardProps> = ({ children, ...props }) => {
  const { getInputProps, getCheckboxProps } = useRadio(props)

  const input = getInputProps()
  const checkbox = getCheckboxProps()

  return (
    <Box as="label">
      <input {...input} />
      <Box
        {...checkbox}
        cursor="pointer"
        borderWidth="1px"
        borderRadius="md"
        boxShadow="md"
        _checked={{
          bg: "purple.600",
          color: "white",
          borderColor: "purple.600",
        }}
        _focus={{
          boxShadow: "outline",
        }}
        px={5}
        py={3}
      >
        {children}
      </Box>
    </Box>
  )
}

const SavedPaymentMethods = () => {
  const { change } = useForm()
  const [isAddingPaymentMethod, setIsAddingPaymentMethod] = useState(false)
  const [paymentMethods] = useQuery(getPaymentMethods, null, {
    onSettled: (paymentMethods) => {
      if (!paymentMethods?.length) {
        setIsAddingPaymentMethod(true)
      }
    },
    onSuccess: (paymentMethods) => {
      if ((paymentMethods?.length ?? 0) > 0) {
        change("paymentProfileId", paymentMethods[0]?.paymentProfileId)
        change("customerProfileId", paymentMethods[0]?.customerProfileId)
      }
    },
  })

  const { getRadioProps, setValue } = useRadioGroup({
    name: "paymentMethod",
    defaultValue: paymentMethods?.[0]?.paymentProfileId,
    onChange: (value) => {
      if (value) {
        setIsAddingPaymentMethod(false)

        const paymentMethod = paymentMethods?.find((pm) => pm.paymentProfileId === value)
        if (paymentMethod) {
          change("paymentProfileId", paymentMethod.paymentProfileId)
          change("customerProfileId", paymentMethod.customerProfileId)
        }
      }
    },
  })

  useEffect(() => {
    if (isAddingPaymentMethod) {
      setValue("")
    }
  }, [isAddingPaymentMethod, setValue])

  return (
    <Flex flexDir="column" gridGap="1rem">
      {(paymentMethods?.length || 0) > 0 ? (
        <>
          <Text fontWeight="semibold" fontSize="lg">
            Payment methods
          </Text>
          <Flex flexDir="column" gridGap=".5rem">
            {paymentMethods?.map((paymentMethod) => {
              const radioProps = getRadioProps({ value: paymentMethod.paymentProfileId })

              return (
                <PaymentMethodCard key={paymentMethod.paymentProfileId} {...radioProps}>
                  <Flex flexDir="row" justifyContent="space-between">
                    <Flex flexDir="column">
                      <Flex alignItems="center" gridGap=".5rem">
                        <Text fontWeight="bold">
                          {paymentMethod.cardNumber.replace("XXXX", "**** ")}
                        </Text>
                      </Flex>
                      <Text>{paymentMethod.cardType}</Text>
                    </Flex>
                  </Flex>
                </PaymentMethodCard>
              )
            })}
            <Text
              color="purple.300"
              fontWeight="bold"
              cursor="pointer"
              textAlign="center"
              onClick={() => setIsAddingPaymentMethod(!isAddingPaymentMethod)}
            >
              {isAddingPaymentMethod ? "" : "+ Add a new payment method"}
            </Text>
          </Flex>
          {isAddingPaymentMethod && <CreditCardForm />}
        </>
      ) : (
        <CreditCardForm />
      )}
    </Flex>
  )
}

const getDefaultAmount = (amount: number): number | undefined => {
  const values = Object.values(AMOUNT_TO_GEMS)
  const result = values.find((value) => parseFloat(value) >= amount)

  return parseFloat(result ?? values[values.length - 1]!)
}

interface DepositProps {
  defaultAmount?: number
}

const Deposit: FC<DepositProps> = ({ defaultAmount }) => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768)
  }, [])
  const { dispatchData, error } = useAcceptJs({
    environment: process.env.AUTHORIZE_NET_ENVIRONMENT !== "PRODUCTION" ? "SANDBOX" : "PRODUCTION",
    authData: {
      apiLoginID: process.env.AUTHORIZE_NET_API_LOGIN_ID!,
      clientKey: process.env.AUTHORIZE_NET_CLIENT_KEY!,
    },
  })

  const [addGemsMutation, { isLoading, isSuccess }] = useMutation(addGems, {
    onSuccess: async () => {
      await Promise.all([
        invalidateQuery(getCurrentUser),
        invalidateQuery(getUser),
        invalidateQuery(getHistory),
        invalidateQuery(getPaymentMethods),
      ])
    },
  })

  if (error) {
    console.error("Failed to load AcceptJs", error)
  }

  return (
    <>
      <Form
        hideError
        initialValues={{
          currency: "USD",
          amount: defaultAmount ? getDefaultAmount(defaultAmount) : undefined,
        }}
        style={{ height: "100%" }}
        schema={AddGemsWithCard}
        onSubmit={async ({ amount, currency, ...paymentData }) => {
          let nonce: undefined | string
          let paymentProfileId: undefined | string
          let customerProfileId: undefined | string

          if ("cardNumber" in paymentData) {
            const { cardNumber, expiration, cardCode, fullName, zip } = paymentData
            const { month, year } = Payment.fns.cardExpiryVal(expiration)

            try {
              const response = await dispatchData({
                cardData: {
                  fullName,
                  zip,
                  cardNumber,
                  month: month.toString(),
                  year: year.toString(),
                  cardCode,
                },
              })

              if (response.messages.resultCode !== "Ok") {
                return {
                  [FORM_ERROR]: response.messages.message[0]?.text || "Something went wrong",
                }
              }

              nonce = response.opaqueData.dataValue
            } catch (error) {
              return { [FORM_ERROR]: error.messages.message?.[0].text || "Something went wrong" }
            }
          } else {
            paymentProfileId = paymentData.paymentProfileId
            customerProfileId = paymentData.customerProfileId
          }

          try {
            await addGemsMutation({
              amount,
              currency,
              nonce,
              paymentProfileId,
              customerProfileId,
            })
          } catch (error) {
            return { [FORM_ERROR]: error.message || error.toString() }
          }
        }}
      >
        {({ values: { amount, ...paymentData }, submitting, submitError }) => (
          <Flex
            flexDir="column"
            gridGap={{
              base: "1rem",
              md: "4rem",
            }}
          >
            {!submitting && submitError && (
              <Alert role="alert" status="error" variant="solid">
                <AlertIcon />
                {process.env.NODE_ENV === "production"
                  ? "An error occurred, please retry later"
                  : submitError}
              </Alert>
            )}
            <Flex flexDir="column" gridGap="0.5rem">
              {isSuccess && (
                <Alert status="success" textColor="black" borderRadius="sm">
                  Success
                </Alert>
              )}
              <Stack spacing={4}>
                <Text
                  fontWeight="semibold"
                  fontSize={{
                    base: "s",
                    md: "lg",
                  }}
                  textAlign={{
                    base: "center",
                    md: "left",
                  }}
                >
                  How many gems do you want to buy?
                </Text>
                <Field name="amount" type="radio" parse={(value) => parseFloat(value)}>
                  {({ input }) => (
                    <RadioGroup {...input} colorScheme="purple">
                      <Stack>
                        {isMobile ? (
                          <Menu>
                            <MenuButton
                              as={Button}
                              rightIcon={<ChevronDownIcon />}
                              colorScheme="purple"
                              size="lg"
                              borderRadius="50"
                              w="100%"
                            >
                              {amount ? (
                                <>
                                  {AMOUNT_TO_GEMS[amount]} <Gem color="purple.500" boxSize={5} /> $
                                  {amount}
                                </>
                              ) : (
                                "Select amount"
                              )}
                            </MenuButton>
                            <MenuList>
                              {Object.entries(AMOUNT_TO_GEMS).map(([key, value]) => (
                                <MenuItem
                                  key={key}
                                  value={key}
                                  onClick={() => {
                                    input.onChange(key)
                                  }}
                                  display="flex"
                                  gridGap="0.3rem"
                                  alignItems="center"
                                >
                                  {value} <Gem boxSize={5} /> ${key}
                                </MenuItem>
                              ))}
                            </MenuList>
                          </Menu>
                        ) : (
                          Object.entries(AMOUNT_TO_GEMS).map(([key, value]) => (
                            <Radio key={key} size="lg" value={key}>
                              {value} <Gem boxSize={5} /> ${key}
                            </Radio>
                          ))
                        )}
                      </Stack>
                    </RadioGroup>
                  )}
                </Field>
              </Stack>
              <Suspense
                fallback={
                  <Center>
                    <Spinner />
                  </Center>
                }
              >
                <SavedPaymentMethods />
              </Suspense>
            </Flex>
            <Flex flexDir="column" gridGap="0.5rem">
              <Button
                textColor="black"
                disabled={
                  !amount ||
                  ("paymentProfileId" in paymentData
                    ? !paymentData.paymentProfileId
                    : !paymentData.cardCode || !paymentData.cardNumber || !paymentData.expiration)
                }
                type="submit"
                isLoading={isLoading || submitting}
                size="lg"
                borderRadius="50"
                bg="white"
              >
                {amount ? `Purchase | $${amount.toFixed(2)}` : "Select amount and account"}
              </Button>
              <Text fontSize="0.7rem" opacity=".5" textAlign="center">
                By continuing you confirm that you are at least 18 years old
              </Text>
              <Flex
                flexDir="row"
                justifyContent="center"
                w="100%"
                gridGap="1rem"
                alignItems="center"
              >
                <Discover boxSize={8} />
                <Mastercard boxSize={10} />
                <Visa boxSize={10} />
                <Amex boxSize={6} />
              </Flex>
            </Flex>
          </Flex>
        )}
      </Form>
    </>
  )
}

export default Deposit
