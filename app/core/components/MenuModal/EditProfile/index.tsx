import Image from "next/image"
import { invalidateQuery, useMutation, useQuery } from "@blitzjs/rpc"
import { FC, useEffect, useRef, useState } from "react"
import {
  Button,
  Flex,
  Text,
  Box,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalOverlay,
  ModalProps,
  HStack,
} from "@chakra-ui/react"
import { Camera, Edit, Trash } from "react-feather"
import { isValidPhoneNumber } from "react-phone-number-input"
import { UserImage } from "@prisma/client"

import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import { EditUser } from "app/users/validations"
import editUser from "app/users/mutations/editUser"
import getCurrentUser from "app/users/queries/getCurrentUser"
import getUser from "app/users/queries/getUser"
import { numberWithCommas } from "helpers/number"
import Gem from "app/core/icons/Gem"
import removePictures from "app/users/mutations/removePictures"
import sendOTP from "app/auth/mutations/sendOTP"
import ConfirmModal from "app/core/components/ConfirmModal"
import AddPictureModal from "./AddPictureModal"
import LabeledTextField from "app/core/components/LabeledTextField"
import Form, { FORM_ERROR } from "app/core/components/Form"
import PinField from "../../PinField"
import useMenu from "app/core/hooks/useMenu"
import { gemsToDollar } from "helpers/price"
import getUserCountry from "app/users/queries/getUserCountry"
import PhoneField from "../../PhoneField"

interface EditProfileProps {
  user: NonNullable<ReturnType<typeof useCurrentUser>>
  focusOnMount?: boolean
}

const EditPhoneModal = ({
  isPhone,
  ...props
}: Omit<ModalProps, "children"> & { isPhone?: boolean }) => {
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
  const [sendOTPMutation, { isSuccess, isLoading, error }] = useMutation(sendOTP)
  const [editUserMutation] = useMutation(editUser, {
    onSuccess: async () => {
      await invalidateQuery(getCurrentUser)
      props.onClose()
    },
  })

  return (
    <Modal isCentered {...props}>
      <ModalOverlay />
      <ModalContent
        justifyItems="center"
        backgroundColor="black"
        background="linear-gradient(180deg, rgba(255, 255, 255, 0.05) 46.4%, rgba(10, 7, 12, 0.05) 200%)"
      >
        <ModalHeader>Edit {isPhone ? "Phone Number" : "Email"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody p="2rem">
          {!isSuccess}
          <Form
            submitText={isSuccess ? "Save" : undefined}
            onSubmit={async (values) => {
              if (!values.code) return

              try {
                await editUserMutation({
                  code: values.code,
                  ...(isPhone
                    ? {
                        phone: values.phone,
                      }
                    : {
                        email: values.email,
                      }),
                })
              } catch (error) {
                if (error.code === "P2002") {
                  // This error comes from Prisma
                  if (error.meta?.target?.includes("phone")) {
                    return { phone: "This phone is already being used" }
                  } else if (error.meta?.target?.includes("email")) {
                    return { phone: "This email is already being used" }
                  }
                }

                return {
                  [FORM_ERROR]: error.message,
                }
              }
            }}
            schema={EditUser}
          >
            {({ values, handleSubmit }) => (
              <>
                {isPhone ? (
                  <PhoneField name="phone" defaultCountryCode={userCountry?.countryCode} />
                ) : (
                  <LabeledTextField
                    name="email"
                    label="Email"
                    type="email"
                    placeholder="Email"
                    required
                  />
                )}
                {error && <Text color="red.500">{(error as Error).message}</Text>}
                {!isSuccess ? (
                  <Button
                    isLoading={isLoading}
                    onClick={() =>
                      sendOTPMutation(isPhone ? { phone: values.phone! } : { email: values.email! })
                    }
                    disabled={
                      isPhone
                        ? !values.phone ||
                          !isValidPhoneNumber(values.phone, userCountry?.countryCode)
                        : !values.email
                    }
                    bg="white"
                    color="black"
                    w="full"
                    borderRadius="2xl"
                  >
                    Send code
                  </Button>
                ) : (
                  <HStack justifyContent="center">
                    <PinField name="code" onComplete={() => handleSubmit()} />
                  </HStack>
                )}
              </>
            )}
          </Form>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

const EditProfile: FC<EditProfileProps> = ({ user, focusOnMount }) => {
  const { dispatch } = useMenu()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [image, setImage] = useState<File | null>(null)
  const [showRemovePictureModal, setShowRemovePictureModal] = useState(false)
  const [editMode, setEditMode] = useState<"email" | "phone" | null>(null)

  const refetchUser = async () =>
    await Promise.all([
      invalidateQuery(getCurrentUser),
      invalidateQuery(getUser, { username: user.username }),
    ])

  const [removePicturesMutation] = useMutation(removePictures, {
    onSuccess: refetchUser,
  })
  const [editUserMutation] = useMutation(editUser, {
    onSuccess: refetchUser,
  })

  useEffect(() => {
    if (focusOnMount && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.click()
    }
  }, [inputRef, focusOnMount])

  const [pictureToBeRemoved, setPictureToBeRemoved] = useState<UserImage | null>(null)

  return (
    <Flex flexDir="column" mt="1.5rem">
      {editMode !== null && (
        <EditPhoneModal isOpen onClose={() => setEditMode(null)} isPhone={editMode === "phone"} />
      )}
      <ConfirmModal
        title="Are you sure to remove picture?"
        isOpen={showRemovePictureModal}
        onClose={() => {
          setShowRemovePictureModal(false)
          setPictureToBeRemoved(null)
        }}
        onConfirm={() => {
          if (pictureToBeRemoved) {
            removePicturesMutation({
              id: pictureToBeRemoved.id,
              imageUrl: pictureToBeRemoved.url,
            })
            setShowRemovePictureModal(false)
          }
        }}
      >
        <Flex flexDir="column" alignItems="center">
          <Box borderRadius="xl" overflow="hidden" position="relative" w="10rem" h="11.5rem">
            {pictureToBeRemoved && (
              <Image
                alt="thumbnail"
                objectFit="cover"
                objectPosition="center center"
                src={pictureToBeRemoved.url}
                layout="fill"
                //placeholder="blur"
                //blurDataURL={user.imageUrl}
              />
            )}
          </Box>
        </Flex>
      </ConfirmModal>
      {image && (
        <AddPictureModal
          isOpen
          onClose={() => setImage(null)}
          refetchUser={refetchUser}
          image={image}
        />
      )}
      <Flex
        flexDir="column"
        h="100%"
        gridGap={{
          base: "1rem",
          md: "2rem",
        }}
      >
        <Box
          overflowX="auto"
          h="100%"
          sx={{
            paddingBottom: "7px",
            "&::-webkit-scrollbar": {
              borderRadius: "100px",
              height: "4px",
              width: "40px",
              backgroundColor: `rgba(255,255,255, 0.05)`,
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: `rgba(255,255,255, 0.05)`,
            },
          }}
        >
          <Flex flexDir="row" gridGap="1rem" w="fit-content">
            {user.images.length < 10 && (
              <Flex
                bg="rgba(10, 7, 12, 0.25)"
                border="1px dashed rgba(255, 255, 255, 0.35)"
                cursor="pointer"
                _hover={{
                  bg: "rgba(255, 255, 255, 0.2)",
                }}
                borderRadius="xl"
                overflow="hidden"
                position="relative"
                w="6rem"
                h="7.5rem"
                alignItems="center"
                justifyContent="center"
                onClick={() => inputRef.current?.click()}
              >
                <Input
                  type="file"
                  display="none"
                  ref={inputRef}
                  accept="image/*"
                  onChange={(evt) => setImage(evt.target.files?.[0] || null)}
                />
                <Box
                  border="1px solid #B026FF"
                  borderRadius="full"
                  p="1rem"
                  w="fit-content"
                  h="fit-content"
                >
                  <Camera color="#B026FF" />
                </Box>
              </Flex>
            )}
            {user.images.map((image) => (
              <Box
                borderRadius="xl"
                overflow="hidden"
                position="relative"
                w="6rem"
                h="7.5rem"
                key={image.id}
              >
                <Box
                  position="absolute"
                  right={0}
                  top={0}
                  bg="rgba(10, 7, 13, 0.5)"
                  backdropFilter="blur(20px)"
                  borderRadius="full"
                  p=".4rem"
                  m=".3rem"
                  zIndex="1"
                  cursor="pointer"
                  onClick={() => {
                    setPictureToBeRemoved(image)
                    setShowRemovePictureModal(true)
                  }}
                >
                  <Trash width={18} height={18} color="white" />
                </Box>
                <Box pos="relative" sx={{ aspectRatio: "4 / 5" }}>
                  <Image
                    alt="thumbnail"
                    objectFit="cover"
                    objectPosition="center center"
                    src={image.url}
                    layout="fill"
                    //placeholder="blur"
                    //blurDataURL={user.imageUrl}
                  />
                </Box>
              </Box>
            ))}
          </Flex>
        </Box>
        <Flex flexDir="column" h="100%" mt=".5rem">
          <Form
            style={{ height: "100%" }}
            schema={EditUser}
            initialValues={{
              name: user.name,
              price: user.price,
              phone: user.phone || undefined,
              email: user.email || undefined,
            }}
            onSubmit={async (values) => {
              try {
                await editUserMutation({
                  name: values.name || null,
                  price: values.price || 0,
                  email: values.email !== user.email ? values.email || null : undefined,
                })
              } catch (error) {
                if (error.code === "P2002") {
                  // This error comes from Prisma
                  if (error.meta?.target?.includes("phone")) {
                    return { phone: "This phone is already being used" }
                  } else if (error.meta?.target?.includes("email")) {
                    return { email: "This email is already being used" }
                  }
                } else {
                  return { [FORM_ERROR]: error.toString() }
                }
              }
            }}
          >
            {({ submitting, values }) => (
              <Flex flexDir="column" justifyContent="space-between" h="100%" gridGap="1rem">
                <Flex flexDir="column" gridGap="1rem">
                  <Flex
                    flexDir="column"
                    gridGap=".5rem"
                    mb="0.5rem"
                    onClick={() => {
                      if (user.role !== "CREATOR") {
                        dispatch({
                          type: "SET_PAGE",
                          payload: {
                            page: "EARN",
                          },
                        })
                      }
                    }}
                  >
                    <LabeledTextField
                      name="price"
                      label="Price per second"
                      placeholder="Price"
                      type="number"
                      fontSize="1rem"
                      paddingBottom="0.1rem"
                      inputLeftElement={<Gem boxSize={5} />}
                    />
                    <Text fontWeight="medium" ml=".5rem" opacity=".75">
                      {values.price ? (
                        <>$ {numberWithCommas(gemsToDollar(values.price ?? 0))} / second</>
                      ) : (
                        <>Free</>
                      )}
                    </Text>
                  </Flex>
                  <LabeledTextField name="name" label="Name" placeholder="Name" fontSize="1rem" />
                  <LabeledTextField
                    name="email"
                    label="Email"
                    placeholder="me@seconds.app"
                    disabled={user.email}
                    fontSize="1rem"
                    inputRightElement={
                      <Edit cursor="pointer" onClick={() => setEditMode("email")} />
                    }
                  />
                  <LabeledTextField
                    disabled
                    name="phone"
                    label="Phone"
                    placeholder="(555) 123-4567"
                    type="phone"
                    fontSize="1rem"
                    inputRightElement={
                      <Edit cursor="pointer" onClick={() => setEditMode("phone")} />
                    }
                  />
                </Flex>
                <Button
                  variant="outline"
                  w="100%"
                  py="1.5rem"
                  type="submit"
                  isLoading={submitting}
                  disabled={submitting}
                >
                  Save changes
                </Button>
              </Flex>
            )}
          </Form>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default EditProfile
