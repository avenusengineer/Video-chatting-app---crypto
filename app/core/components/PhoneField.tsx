import { FC, forwardRef } from "react"
import { useField } from "react-final-form"
import PhoneInput, { Country, parsePhoneNumber, isValidPhoneNumber } from "react-phone-number-input"
import { Flex, Input, InputProps, Text } from "@chakra-ui/react"
import "react-phone-number-input/style.css"

const ForwardedInput = forwardRef<any, InputProps>((props, ref) => (
  <Input
    type="text"
    ref={ref}
    fontWeight="semibold"
    fontSize="1rem"
    minH="3rem"
    placeholder="+1 555 123 4567"
    py="2rem"
    {...props}
  />
))

interface PhoneFieldProps {
  name: string
  defaultCountryCode?: Country
}

const PhoneField: FC<PhoneFieldProps> = ({ name, defaultCountryCode = "US" }) => {
  const { input, meta } = useField(name, {
    type: "phone",
    format: (value) => {
      if (!value) return undefined

      const phone = parsePhoneNumber(value, defaultCountryCode)
      if (phone) {
        return phone.number
      }
    },
    validate: (value: string) => {
      if (!value) return undefined
      console.log({ value, defaultCountryCode })
      return isValidPhoneNumber(value, defaultCountryCode) ? undefined : "Invalid phone number"
    },
  })

  return (
    <Flex flexDir="column" w="100%">
      <PhoneInput
        defaultCountry={defaultCountryCode}
        international
        autoComplete="tel"
        inputComponent={ForwardedInput}
        style={{ width: "100%" }}
        {...input}
      />
      {meta.error && meta.touched && <Text color="red.500">{meta.error}</Text>}
    </Flex>
  )
}

export default PhoneField
