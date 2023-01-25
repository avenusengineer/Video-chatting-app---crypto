import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  InputProps,
} from "@chakra-ui/react"
import { ComponentPropsWithoutRef, PropsWithoutRef, forwardRef, useState, useEffect } from "react"
import { useField } from "react-final-form"

export interface AnimatedTextFieldProps extends ComponentPropsWithoutRef<typeof Input> {
  /** Field name. */
  name: string
  /** Field label. */
  label: string
  /** Field type. Doesn't include radio buttons and checkboxes */
  type?: "text" | "password" | "email" | "phone"
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  inputProps?: PropsWithoutRef<InputProps>
  withError?: boolean
  autoFocus?: boolean
}

export const AnimatedTextField = forwardRef<HTMLInputElement, AnimatedTextFieldProps>(
  ({ name, label, outerProps, inputProps, withError = true, ...props }, ref) => {
    const {
      input: { onBlur, onFocus, ...input },
      meta: { touched, error, submitting, submitError },
    } = useField(name)
    const [isFocused, setIsFocused] = useState(!!input.value)

    useEffect(() => {
      if (input.value) {
        setIsFocused(true)
      }
    }, [input.value])

    const normalizedError = Array.isArray(error)
      ? error.join(", ")
      : Object.keys(error || {}).length > 0
      ? error
      : submitError
    const hasError = withError && touched && normalizedError

    return (
      <FormControl
        {...outerProps}
        isInvalid={hasError}
        display="flex"
        flexDir="column"
        gridGap=".3rem"
      >
        <InputGroup pos="relative" h="full" w="full">
          <Input
            pos="relative"
            borderWidth="1px"
            borderColor="rgba(255, 255, 255, 0.35)"
            pb="1.5rem"
            pt="2.2rem"
            px=".8rem"
            minH="63px"
            borderRadius="10px"
            bgColor="rgba(255, 255, 255, 0.05)"
            fontSize="18px"
            color="#fff"
            top={0}
            left={0}
            id={name}
            disabled={submitting}
            ref={ref}
            onBlur={() => {
              onBlur()
              setIsFocused(!!input.value)
            }}
            onFocus={() => {
              onFocus()
              setIsFocused(true)
            }}
            {...input}
            {...props}
            {...inputProps}
          />
          <FormLabel
            htmlFor="name"
            pos="absolute"
            display="inline-block"
            fontSize="16px"
            transition={["ease 0.2s", "ease 0.4s"]}
            pointerEvents="none"
            transform="translateX(10px) translateY(calc(100% / 3 * 2))"
            fontWeight="bold"
            color="rgba(255, 255, 255, 0.7)"
            {...(isFocused && {
              transform: "translateX(12px) translateY(2px)",
              fontSize: "12px",
            })}
          >
            {label}
          </FormLabel>
        </InputGroup>
        {hasError && (
          <FormErrorMessage color="#ff0033" fontSize="12px">
            {normalizedError}
          </FormErrorMessage>
        )}
      </FormControl>
    )
  }
)

export default AnimatedTextField
