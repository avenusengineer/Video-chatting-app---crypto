import { Text, Flex, HStack } from "@chakra-ui/react"
import React, { FC } from "react"
import { Field, FieldInputProps } from "react-final-form"
import OtpInput from "react-otp-input"

export type PinFieldProps = Partial<FieldInputProps<string>> & {
  name: string
  onComplete?: (value: string) => void
  isDisabled?: boolean
}

const PinField: FC<PinFieldProps> = ({ onComplete, isDisabled, ...props }) => (
  <Field {...props} type="text">
    {({ input: { onChange, ...input }, meta }) => (
      <Flex flexDir="column" gridGap=".5rem">
        <HStack>
          <OtpInput
            isDisabled={isDisabled}
            inputStyle={{
              width: "4rem",
              height: "4rem",
              color: "black",
              fontSize: "2rem",
              fontWeight: "bold",
              borderRadius: "10px",
              backgroundColor: "white",
            }}
            containerStyle={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gridGap: "1rem",
            }}
            numInputs={4}
            onChange={(value: string) => {
              onChange(value)
              if (value.length === 4) {
                onComplete?.(value)
              }
            }}
            shouldAutoFocus
            isInputNum
            {...input}
          />
        </HStack>
        {meta.error && meta.touched && <Text color="red.500">{meta.error}</Text>}
      </Flex>
    )}
  </Field>
)

export default PinField
