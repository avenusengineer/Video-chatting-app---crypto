import dynamic from "next/dynamic"
import { useRouter } from "next/router"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { Routes } from "@blitzjs/next"
import {
  Button,
  Flex,
  Text,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import useMenu from "app/core/hooks/useMenu"
import Gem from "app/core/icons/Gem"
import getPassbaseMetadata from "app/users/queries/getPassbaseMetadata"
import updateUserKYC from "app/users/mutations/updateUserKYC"

const VerifyButton = dynamic(() => import("@passbase/button/react"), {
  ssr: false,
})

export const Portal = ({ children, className = "root-portal" }) => {
  const [container] = useState(() => document.createElement("div"))

  useEffect(() => {
    container.classList.add(className)
    container.style.position = "fixed"
    container.style.top = "0"
    container.style.left = "0"
    container.style.zIndex = "2000"

    document.body.appendChild(container)

    return () => {
      document.body.removeChild(container)
    }
  }, [container, className])

  return createPortal(children, container)
}

interface EarnProps {
  user: NonNullable<ReturnType<typeof useCurrentUser>>
}

const Earn = ({ user }: EarnProps) => {
  const router = useRouter()
  const { dispatch } = useMenu()
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [updateUserKYCMutation] = useMutation(updateUserKYC)
  const [passbase] = useQuery(getPassbaseMetadata, null, {
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    enabled: !user?.kycVerifiedAt,
    suspense: false,
  })

  return (
    <>
      {!(!!passbase?.status && passbase?.status !== "declined") && (
        <Portal>
          <VerifyButton
            hidden
            apiKey={process.env.PASSBASE_PUBLISHABLE_API_KEY!}
            metaData={passbase?.metadata}
            onSubmitted={async (kycReferenceKey) => {
              await updateUserKYCMutation({ kycReferenceKey })
              return router.push(Routes.AboutGems())
            }}
            onFinish={async (kycReferenceKey) => {
              await updateUserKYCMutation({ kycReferenceKey })
              return router.push(Routes.AboutGems())
            }}
            onError={(errorCode) => {
              if (errorCode !== "CANCELLED_BY_USER") {
                alert(errorCode)
              }
            }}
          />
        </Portal>
      )}
      <Modal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} isCentered>
        <ModalOverlay />
        <ModalContent justifyItems="center" background="#1D1A1E">
          <ModalHeader>Verification in progress</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            KYC process is in progress. You will be redirected to the Veriff website to complete the
            process.
          </ModalBody>

          <ModalFooter>
            <Button
              bg="#B026FF"
              onClick={() => {
                router.push(Routes.AboutGems())
                setShowSuccessModal(false)
                dispatch({
                  type: "SET_IS_OPEN",
                  payload: {
                    isOpen: false,
                  },
                })
              }}
            >
              Learn more about gems
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Flex
        flexDir="column"
        gridGap="5rem"
        overflowY="auto"
        // mb="10rem"
      >
        <Flex
          flexDir="column"
          bgColor="#201727"
          border="1px solid rgba(176, 38, 255, 0.35)"
          borderRadius="10px"
          px="4rem"
          py="2rem"
          gridGap="2rem"
          fontSize="xl"
          textAlign="center"
          fontWeight="medium"
          sx={{
            "> p > b": {
              color: "#75FF26",
            },
          }}
        >
          <Text>
            <b>Earn money</b> by video chatting your <b>community</b>.
          </Text>
          <Text>
            Set <b>any secondly rate</b> you wish.
          </Text>
          <Text>
            <b>Video chat fans whenever</b>, hang up whenever.
          </Text>
        </Flex>
        <Flex justifyContent="center">
          {!!user.kycVerifiedAt ||
            !!user.kycSubmittedAt ||
            (!!passbase?.status && passbase?.status !== "declined" ? (
              <Button
                bgColor="#B026FF"
                leftIcon={<Gem color="white" boxSize={6} />}
                onClick={() => {
                  router.push(Routes.AboutGems())
                  dispatch({
                    type: "SET_IS_OPEN",
                    payload: {
                      isOpen: false,
                    },
                  })
                }}
              >
                Learn more about gems
              </Button>
            ) : (
              <Button
                size="lg"
                leftIcon={<Gem boxSize={6} />}
                variant="outline"
                borderColor="#B026FF"
                onClick={async () => {
                  const { start } = await import("@passbase/button/react")
                  await start()
                }}
              >
                Become A Creator
              </Button>
            ))}
        </Flex>
      </Flex>
    </>
  )
}

export default Earn
