import Image from "next/image"
import { Routes } from "@blitzjs/next"
import { useMutation, useQuery, invoke } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { useSession } from "@blitzjs/auth"
import {
  Flex,
  IconButton,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Text,
} from "@chakra-ui/react"
import { useState, useEffect } from "react"
import { Video, X } from "react-feather"
import { useAtom } from "jotai"

import getUser from "app/users/queries/getUser"
import usePersistentState from "app/core/hooks/usePersistentState"
import refuse from "../mutations/refuse"
import participants from "../queries/participants"
import { acceptIncomingCallAtom } from "app/core/state/incomingCall"
import IncomingCallButton from "./IncomingCallButton"

const IncomingCallModal = () => {
  const session = useSession()
  const router = useRouter()
  const [acceptIncomingCall] = useAtom(acceptIncomingCallAtom)
  const [hidden, setHidden] = usePersistentState("incomingCallHidden", acceptIncomingCall)
  const [refuseParticipant] = useMutation(refuse)
  const [currentParticipant, setCurrentParticipant] = useState<Awaited<
    ReturnType<typeof getUser>
  > | null>(null)
  const [awaitingUsers] = useQuery(participants, null, {
    refetchInterval: 5000,
    enabled: acceptIncomingCall,
    suspense: false,
  })

  useEffect(() => {
    setHidden(!acceptIncomingCall)
  }, [acceptIncomingCall, setHidden])

  useEffect(() => {
    if (awaitingUsers?.[0] && awaitingUsers[0] !== currentParticipant?.username) {
      invoke(getUser, { username: awaitingUsers[0] }).then((user) => {
        setCurrentParticipant(user)
      })
    } else if (!awaitingUsers?.[0] && currentParticipant) {
      setCurrentParticipant(null)
    }
  }, [awaitingUsers, currentParticipant])

  return (
    <>
      {hidden && currentParticipant && <IncomingCallButton onClick={() => setHidden(false)} />}
      <Modal
        onClose={() => {
          setCurrentParticipant(null)
          setHidden(true)
        }}
        isOpen={!!currentParticipant && !hidden}
        isCentered
      >
        <ModalOverlay />
        <ModalContent
          backgroundColor="#0A070C"
          border="2px solid #B026FF"
          borderRadius="xl"
          overflow="hidden"
        >
          {currentParticipant && (
            <>
              <ModalHeader
                as={Flex}
                flexDir="row"
                justifyContent="space-between"
                alignItems="center"
                zIndex={1}
                bg="black"
              >
                <Flex flexDir="column" flex="2">
                  <Text fontWeight="semibold" fontSize="2xl">
                    {currentParticipant.name}
                  </Text>
                  <Text fontWeight="medium" fontSize="md">
                    @{currentParticipant.username}
                  </Text>
                </Flex>
                <Flex flex="1">
                  <Text fontWeight="bold" fontSize="2xl">
                    Incoming Video Call
                  </Text>
                </Flex>
              </ModalHeader>
              <ModalBody
                w="100%"
                minH="30rem"
                backgroundColor={!currentParticipant.images[0]?.url ? "grey" : undefined}
              >
                {currentParticipant.images[0] && (
                  <Image
                    alt="thumbnail"
                    objectFit="cover"
                    objectPosition="center center"
                    loader={() => currentParticipant.images[0]!.url}
                    src={currentParticipant.images[0].url}
                    layout="fill"
                    //placeholder="blur"
                    //blurDataURL={currentParticipant.imageUrl}
                  />
                )}
                <Flex
                  position="absolute"
                  bottom={0}
                  left={0}
                  px="1rem"
                  py="1rem"
                  bg="rgba(0, 0, 0, 0.5)"
                  w="100%"
                  backdropFilter="blur(5px)"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Button variant="outline">Block</Button>
                  <Flex gridGap="1rem">
                    <IconButton
                      aria-label="accept"
                      icon={<Icon as={Video} boxSize={8} />}
                      bg="#75FF26"
                      borderRadius="100%"
                      w="3.5rem"
                      h="3.5rem"
                      color="black"
                      onClick={() => {
                        router.push(
                          Routes.RoomPage({
                            id: session.username!,
                            accept: currentParticipant.username,
                          })
                        )
                        setCurrentParticipant(null)
                        setHidden(true)
                      }}
                    />
                    <IconButton
                      aria-label="refuse"
                      icon={<Icon as={X} boxSize={8} />}
                      bg="#EB5545"
                      borderRadius="100%"
                      w="3.5rem"
                      h="3.5rem"
                      onClick={() =>
                        refuseParticipant({
                          participant: currentParticipant.username,
                        })
                      }
                    />
                  </Flex>
                </Flex>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}

export default IncomingCallModal
