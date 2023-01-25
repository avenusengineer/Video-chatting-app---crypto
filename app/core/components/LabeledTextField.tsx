import { forwardRef, PropsWithoutRef, ComponentPropsWithoutRef, useState } from "react"
import { useField, UseFieldConfig } from "react-final-form"
import { Input, InputGroup, InputProps } from "@chakra-ui/input"
import { FormControl, FormLabel } from "@chakra-ui/form-control"
import { Flex, Textarea, Text, InputRightElement, FormErrorMessage } from "@chakra-ui/react"
import PhoneNumberInput from "react-phone-number-input/input"
import { isValidPhoneNumber, parsePhoneNumber, Country } from "react-phone-number-input"
import { z } from "zod"
import { Eye, EyeOff } from "react-feather"

export interface LabeledTextFieldProps extends ComponentPropsWithoutRef<typeof Input> {
  /** Field name. */
  name: string
  /** Field label. */
  label?: string
  /** Field type. Doesn't include radio buttons and checkboxes */
  type?: "text" | "password" | "email" | "number" | "date" | "textArea" | "phone"
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  variant?: "unstyled" | "filled"
  inputLeftElement?: JSX.Element
  inputRightElement?: JSX.Element
  inputProps?: PropsWithoutRef<InputProps>
  config?: UseFieldConfig<any>
  defaultCountryCode?: Country
}

const ForwardedPhoneInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => (
  <Input
    sx={{
      ":disabled": {
        opacity: ".5",
        pointerEvents: "none",
      },
    }}
    variant="unstyled"
    fontWeight="semibold"
    fontSize="1.2rem"
    bgColor="rga(255, 255, 255, 0.05)"
    ref={ref}
    {...props}
  />
))

export const LabeledTextField = forwardRef<HTMLInputElement, LabeledTextFieldProps>(
  (
    {
      name,
      label,
      outerProps,
      variant,
      inputLeftElement,
      inputRightElement,
      inputProps,
      config,
      defaultCountryCode = "US",
      ...props
    },
    ref
  ) => {
    const [show, setShow] = useState(false)
    const {
      input,
      meta: { touched, error, submitting, submitError },
    } = useField(name, {
      format: (value) => {
        if (props.type === "phone" && value) {
          const phone = parsePhoneNumber(value, defaultCountryCode)
          if (phone) {
            return phone.number
          }
        }

        return value
      },
      parse: (value) => {
        switch (props.type) {
          case "number":
            return Number(value)
          default:
            return value
        }
      },
      validate: (value) => {
        if (!value) return undefined

        switch (props.type) {
          case "phone":
            return isValidPhoneNumber(value, defaultCountryCode)
              ? undefined
              : "Invalid phone number"
          case "email":
            const { success } = z.string().email().safeParse(value)
            return success ? undefined : "Invalid email"
          default:
            return undefined
        }
      },
      ...config,
    })

    const normalizedError = Array.isArray(error)
      ? error.join(", ")
      : Object.keys(error || {}).length > 0
      ? error
      : submitError

    return (
      <FormControl {...outerProps} isInvalid={touched && normalizedError}>
        {variant === "unstyled" ? (
          <FormLabel>
            {label}
            {props.type === "textArea" ? (
              <Textarea
                {...input}
                p=".4rem"
                disabled={submitting}
                {...props}
                ref={ref as any}
                resize="none"
                size="md"
              />
            ) : props.type === "phone" ? (
              <PhoneNumberInput
                international
                country={defaultCountryCode}
                inputComponent={ForwardedPhoneInput as never}
                disabled={submitting}
                defaultCountry="US"
                ref={ref}
                rules={{
                  validate: isValidPhoneNumber,
                }}
                {...input}
                {...props}
              />
            ) : (
              <Input {...input} disabled={submitting} {...props} ref={ref} />
            )}
          </FormLabel>
        ) : (
          <Flex
            borderColor="rgba(255, 255, 255, 0.35)"
            position="relative"
            borderWidth="1px"
            pt={label ? "2rem" : ".5rem"}
            px=".8rem"
            pb=".5rem"
            borderRadius="10px"
            backgroundColor="rgba(255, 255, 255, 0.05)"
            flexDir="column"
            onClick={() => input.onFocus()}
            sx={{
              ":focus-within": {
                borderColor: "rgba(160, 255, 160, 0.35)",
              },
            }}
          >
            <Text
              position="absolute"
              py=".5rem"
              fontSize=".9rem"
              top={0}
              fontWeight="medium"
              color="rgba(255, 255, 255, 0.7)"
            >
              {label}
            </Text>
            <InputGroup alignItems="center" gridGap=".5rem">
              {inputLeftElement}
              {props.type === "textArea" ? (
                <Textarea {...input} />
              ) : props.type === "phone" ? (
                <PhoneNumberInput
                  country={defaultCountryCode}
                  inputComponent={ForwardedPhoneInput as never}
                  disabled={submitting}
                  defaultCountry="US"
                  ref={ref}
                  rules={{
                    validate: isValidPhoneNumber,
                  }}
                  {...input}
                  {...props}
                />
              ) : (
                <Input
                  sx={{
                    ":disabled": {
                      opacity: ".5",
                      pointerEvents: "none",
                    },
                  }}
                  variant="unstyled"
                  fontWeight="semibold"
                  fontSize="1.2rem"
                  bgColor="rga(255, 255, 255, 0.05)"
                  disabled={submitting}
                  ref={ref}
                  {...input}
                  {...props}
                  {...inputProps}
                  {...(props.type === "password" && {
                    type: show ? "text" : "password",
                  })}
                />
              )}
              {props.type === "password" && (
                <InputRightElement onClick={() => setShow(!show)} cursor="pointer">
                  {show ? <Eye color="white" /> : <EyeOff color="white" />}
                </InputRightElement>
              )}
              {inputRightElement}
            </InputGroup>
          </Flex>
        )}
        {touched && normalizedError && (
          <FormErrorMessage fontSize=".8rem" mt=".5rem" color="#ff0033">
            {normalizedError}
          </FormErrorMessage>
        )}
      </FormControl>
    )
  }
) as React.FC<LabeledTextFieldProps>

export default LabeledTextField
