import Image from "next/image"
import { useRouter } from "next/router"
import { invalidateQuery, useMutation } from "@blitzjs/rpc"
import { BlitzPage, Routes } from "@blitzjs/next"
import { Alert, AlertIcon, Box, Button, Flex, Icon, Input, Text } from "@chakra-ui/react"
import { FC, ReactNode, useMemo, useRef, useState } from "react"
import { Plus } from "react-feather"
import { FormSpy } from "react-final-form"
import { z } from "zod"

import { gSSP } from "app/blitz-server"
import ContainerForm from "app/core/components/ContainerForm"
import Layout from "app/core/layouts/Layout"
import { Form, FORM_ERROR } from "app/core/components/Form"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import AddPictureModal from "app/core/components/MenuModal/EditProfile/AddPictureModal"
import { EditUser } from "app/users/validations"
import editUser from "app/users/mutations/editUser"
import getCurrentUser from "app/users/queries/getCurrentUser"
import getDefaultServerSideProps from "app/core/helpers/getDefaultServerSideProps"
import AnimatedTextField from "app/core/components/AnimatedTextField"

interface UserPictureInputProps {
  imageUrl?: string | null
}

const UserPictureInput = ({ imageUrl }: UserPictureInputProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [image, setImage] = useState<File | null>(null)

  if (image) {
    return (
      <AddPictureModal
        isOpen
        onClose={() => setImage(null)}
        refetchUser={async () => {
          await invalidateQuery(getCurrentUser)
        }}
        image={image}
      />
    )
  }

  if (imageUrl) {
    return (
      <Box
        borderRadius="xl"
        overflow="hidden"
        position="relative"
        w="10rem"
        h="11.5rem"
        cursor="pointer"
        onClick={() => inputRef.current?.click()}
        _hover={{
          "&>div:last-child": {
            filter: "brightness(0.4)",
          },
        }}
      >
        <Input
          type="file"
          display="none"
          ref={inputRef}
          accept="image/*"
          onChange={(evt) => setImage(evt.target.files?.[0] || null)}
        />
        <Image
          src={imageUrl}
          alt="Profile picture"
          objectFit="cover"
          objectPosition="center center"
          layout="fill"
        />
      </Box>
    )
  }

  return (
    <>
      <Flex
        borderRadius="full"
        border="1px dashed white"
        w="4rem"
        h="4rem"
        onClick={() => inputRef.current?.click()}
        justifyContent="center"
        alignItems="center"
        cursor="pointer"
      >
        <Icon as={Plus} boxSize={8} />
        <Input
          type="file"
          display="none"
          ref={inputRef}
          accept="image/*"
          onChange={(evt) => setImage(evt.target.files?.[0] || null)}
        />
      </Flex>
      <Flex flexDir="row">
        <Flex flexDir="column">
          <Text fontWeight="semibold">Upload a picture</Text>
          <Text fontSize="sm" opacity=".7" fontWeight="semibold">
            Optional
          </Text>
        </Flex>
      </Flex>
    </>
  )
}

type StepProps = {
  isLoading?: boolean
  user: NonNullable<ReturnType<typeof useCurrentUser>>
  children?: ReactNode
}

const PasswordStep = ({ isLoading, user, children }: StepProps) => (
  <ContainerForm
    heading={
      <>
        Set a password for
        <br />
        {user.email}
      </>
    }
  >
    <Flex flexDir="column" h="full" justifyContent={["flex-start", "space-between"]} gridGap="4rem">
      {children}
      <AnimatedTextField name="password" type="password" label="Password" />
      <FormSpy<z.infer<typeof EditUser>> subscription={{ values: true, invalid: true }}>
        {({ values }) => (
          <Button
            textColor="black"
            type="submit"
            isLoading={isLoading}
            disabled={!values.password}
            size="lg"
            borderRadius="50"
            bg="white"
          >
            Continue
          </Button>
        )}
      </FormSpy>
    </Flex>
  </ContainerForm>
)

const UsernameStep = ({ isLoading, children }: StepProps) => (
  <ContainerForm heading="Pick a username for your new account">
    <Flex flexDir="column" h="full" justifyContent={["flex-start", "space-between"]} gridGap="4rem">
      {children}
      <AnimatedTextField name="username" type="text" label="Username" />
      <FormSpy<z.infer<typeof EditUser>> subscription={{ values: true, invalid: true }}>
        {({ values }) => (
          <Button
            textColor="black"
            type="submit"
            isLoading={isLoading}
            disabled={!values.username}
            size="lg"
            borderRadius="50"
            bg="white"
          >
            Continue
          </Button>
        )}
      </FormSpy>
    </Flex>
  </ContainerForm>
)

const DisplayNameStep = ({ isLoading, children }: StepProps) => (
  <ContainerForm
    heading={
      <Flex flexDir="column" gap="1rem">
        Pick a display name
        <Text fontWeight="medium" opacity=".75" fontSize="md">
          This can be changed at any time.
        </Text>
      </Flex>
    }
  >
    <Flex flexDir="column" h="full" justifyContent={["flex-start", "space-between"]} gridGap="4rem">
      {children}
      <AnimatedTextField name="name" type="text" label="Display name" />
      <Button
        textColor="black"
        type="submit"
        isLoading={isLoading}
        size="lg"
        borderRadius="50"
        bg="white"
      >
        Continue
      </Button>
    </Flex>
  </ContainerForm>
)

const NameAndPictureStep = ({ user, isLoading, children }: StepProps) => (
  <ContainerForm
    heading={
      <Flex flexDir="column" gap=".25rem" fontSize="2xl">
        <Text>{user.name}</Text>
        <Text opacity=".5">@{user.username}</Text>
      </Flex>
    }
  >
    {children}
    <Flex h="full" justifyContent={["flex-start", "space-between"]} flexDir="column" gridGap="2rem">
      <Flex w="full" justify="center" gridGap="1rem" alignItems="center">
        <UserPictureInput imageUrl={user.images[0]?.url} />
      </Flex>
      <Button
        textColor="black"
        type="submit"
        isLoading={isLoading}
        size="lg"
        borderRadius="50"
        bg="white"
      >
        Continue
      </Button>
    </Flex>
  </ContainerForm>
)

const CompleteProfile: BlitzPage = () => {
  const router = useRouter()
  const user = useCurrentUser()
  const [step, setStep] = useState(0)
  const [editUserMutation, { isLoading }] = useMutation(editUser, {
    onSuccess: () => {
      setStep(step + 1)
      invalidateQuery(getCurrentUser)
    },
  })

  const Component: FC<StepProps> | undefined = useMemo(
    () => [PasswordStep, UsernameStep, DisplayNameStep, NameAndPictureStep][step],
    [step]
  )

  if (!Component) {
    if (user && user.role === "CREATOR") {
      router.push(Routes.User({ username: user.username }))
    } else {
      router.push(Routes.Home())
    }
  }

  return (
    <Flex w="full" justifyContent="center" alignItems="center">
      <Form
        style={{ height: "100%", width: "100%" }}
        initialValues={{
          name: user?.name,
          username: user?.username,
        }}
        hideError
        schema={EditUser}
        onSubmit={async (values) => {
          try {
            await editUserMutation(values)
          } catch (error) {
            if (error.code === "P2002") {
              // This error comes from Prisma
              if (error.meta?.target?.includes("username")) {
                return { username: "This username is already being used" }
              }
            } else {
              return { [FORM_ERROR]: error.message || error.toString() }
            }
          }
        }}
      >
        {({ submitError }) => (
          <Flex w="full" justifyContent="center">
            {user && Component && (
              <Component user={user} isLoading={isLoading}>
                {submitError && (
                  <Alert role="alert" status="error" variant="solid">
                    <AlertIcon />
                    {submitError}
                  </Alert>
                )}
              </Component>
            )}
          </Flex>
        )}
      </Form>
    </Flex>
  )
}

CompleteProfile.authenticate = true
CompleteProfile.getLayout = (page) => <Layout title="Complete Profile">{page}</Layout>

export const getServerSideProps = gSSP(getDefaultServerSideProps)

export default CompleteProfile
