import { ReactNode, PropsWithoutRef } from "react"
import { Form as FinalForm, FormProps as FinalFormProps, FormRenderProps } from "react-final-form"
import { z } from "zod"
import { Alert, AlertIcon, Button } from "@chakra-ui/react"
import { validateZodSchema } from "blitz"
export { FORM_ERROR } from "final-form"

export type FormChildProps<S extends z.ZodType<any, any>> = FormRenderProps<z.infer<S>>

// @ts-ignore
export interface FormProps<S extends z.ZodType<any, any>>
  extends Omit<PropsWithoutRef<JSX.IntrinsicElements["form"]>, "onSubmit"> {
  /** All your form fields */
  children?: ReactNode | ((props: FormChildProps<S>) => ReactNode)
  /** Text to display in the submit button */
  submitText?: string
  schema?: S
  onSubmit: FinalFormProps<z.infer<S>>["onSubmit"]
  initialValues?: FinalFormProps<z.infer<S>>["initialValues"]
  hideError?: boolean
}

export function Form<S extends z.ZodType<any, any>>({
  children,
  submitText,
  schema,
  initialValues,
  onSubmit,
  hideError,
  ...props
}: FormProps<S>) {
  return (
    <FinalForm
      initialValues={initialValues}
      validate={validateZodSchema(schema)}
      onSubmit={onSubmit}
      render={({ handleSubmit, submitting, submitError, values, ...rest }) => (
        <form onSubmit={handleSubmit} className="form" {...props}>
          {!hideError && !submitting && submitError && (
            <Alert role="alert" status="error" variant="solid">
              <AlertIcon />
              {submitError}
            </Alert>
          )}

          {/* Form fields supplied as children are rendered here */}
          {typeof children === "function"
            ? children({ handleSubmit, submitting, submitError, values, ...rest })
            : children}

          {submitText && (
            <Button
              type="submit"
              isLoading={submitting}
              bg="white"
              color="black"
              w="full"
              borderRadius="2xl"
            >
              {submitText}
            </Button>
          )}

          <style>{`
            .form > * + * {
              margin-top: 1rem;
            }
          `}</style>
        </form>
      )}
    />
  )
}

export default Form
