import { useParam, Routes } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { Flex, Button, Fade, Text } from "@chakra-ui/react"
import { useRouter } from "next/router"
import { useState, useRef, useEffect, useMemo } from "react"

import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import useVideoContext from "app/core/hooks/useVideoContext"
import Gem from "app/core/icons/Gem"
import { numberWithCommas } from "helpers/number"
import { DOLLAR_TO_GEMS } from "helpers/price"
import completeRoom from "../mutations/completeRoom"
import participants from "../queries/participants"
import AudioToggle from "./AudioToggle"
import DisconnectButton from "./DisconnectButton"
import LocalVideoPreview from "./VideoPreview"
import VideoToggle from "./VideoToggle"

interface VideoControlsProps {
  participant: NonNullable<ReturnType<typeof useVideoContext>["participant"]>
  currentUser: NonNullable<ReturnType<typeof useCurrentUser>>
  elapsedTime: number
  onAcceptParticipant?: (username: string) => void
}

export const VideoControls = ({
  elapsedTime,
  participant,
  currentUser,
  onAcceptParticipant,
}: VideoControlsProps) => {
  const router = useRouter()
  const [completeRoomMutation] = useMutation(completeRoom)
  const { participant: other, room } = useVideoContext()
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const roomId = useParam("id", "string")! || currentUser.username
  const [awaitingUsers = []] = useQuery(participants, null, {
    enabled: currentUser.username === roomId,
  })

  useEffect(() => {
    const handleClick = (event) => {
      if (!isVisible) {
        setIsVisible(true)
      } else if (ref.current && !ref.current.contains(event.target)) {
        setIsVisible(false)
      }
    }

    document.addEventListener("click", handleClick, true)

    return () => {
      document.removeEventListener("click", handleClick, true)
    }
  }, [setIsVisible, isVisible])

  const ModalContent = useMemo(
    () => (
      <Flex
        flexDir="column"
        gridGap="1.5rem"
        justifyContent="space-between"
        textAlign="right"
        w="100%"
        alignItems="flex-end"
      >
        {currentUser.username === roomId ? (
          <>
            <Flex flexDir="column">
              <Flex flexDir="row" alignItems="center">
                <Gem boxSize={4} mr=".3rem" />
                <Text fontWeight="semibold">
                  {numberWithCommas(
                    Math.round(elapsedTime * currentUser.price * DOLLAR_TO_GEMS) / DOLLAR_TO_GEMS
                  )}
                </Text>
              </Flex>
              <Text fontWeight="semibold">{awaitingUsers.length} people in queue</Text>
            </Flex>
            <Flex flexDir="row" gridGap="1rem" alignItems="center">
              <Button
                variant="outline"
                disabled={awaitingUsers.length <= 1}
                onClick={async () => {
                  if (room) {
                    await Promise.all([
                      room.disconnect(),
                      completeRoomMutation({
                        roomId: room.sid,
                        roomName: room.name,
                      }),
                      ...(awaitingUsers?.[1] ? [onAcceptParticipant?.(awaitingUsers[1])] : []),
                    ])
                  }
                }}
              >
                Next
              </Button>
              <Button
                variant="outline"
                colorScheme="red"
                onClick={async () => {
                  if (room) {
                    await Promise.all([
                      room.disconnect(),
                      completeRoomMutation({
                        roomId: room.sid,
                        roomName: room.name,
                      }).finally(() => {
                        if (router.pathname !== Routes.Home().pathname) {
                          router.push(Routes.Home())
                        }
                      }),
                    ])
                  }
                }}
              >
                Stop
              </Button>
            </Flex>
          </>
        ) : (
          <>
            <Flex flexDir="column">
              <Flex flexDir="row" alignItems="center">
                <Gem boxSize={4} mr=".3rem" />
                <Text fontWeight="semibold">
                  {numberWithCommas(
                    Math.round(elapsedTime * (other?.price ?? 0) * DOLLAR_TO_GEMS) / DOLLAR_TO_GEMS
                  )}
                </Text>
              </Flex>
              <Text fontWeight="semibold">{elapsedTime}s</Text>
            </Flex>
            <DisconnectButton w="50px" h="50px" iconProps={{ boxSize: 5 }} />
          </>
        )}
      </Flex>
    ),
    [
      currentUser.username,
      currentUser.price,
      roomId,
      elapsedTime,
      awaitingUsers,
      other?.price,
      room,
      completeRoomMutation,
      onAcceptParticipant,
      router,
    ]
  )

  return (
    <>
      <Flex position="fixed" top="0" left="0" p="1rem" maxW="100%" zIndex="10000">
        <Fade in={isVisible} style={{ maxWidth: "100%" }}>
          <Flex
            ref={ref}
            gridGap="1rem"
            w="sm"
            justifyContent="space-between"
            bg="rgba(10, 7, 12, 0.8)"
            backdropFilter="blur(4px)"
            borderRadius="md"
            px="1rem"
            py=".8rem"
            flexDir="row"
            maxW="100%"
          >
            <Flex flexDir="column" gridGap="1.5rem" justifyContent="space-between">
              <Flex flexDir="column">
                <Text fontWeight="semibold" m={0} p={0}>
                  {participant.name}
                </Text>
                <Text fontWeight="small" m={0} p={0}>
                  @{participant.username}
                </Text>
              </Flex>
              <Flex flexDir="row" gridGap="1rem">
                <VideoToggle
                  iconProps={{ boxSize: 5, color: "black" }}
                  w="50px"
                  h="50px"
                  bg="white"
                />
                <AudioToggle
                  iconProps={{ boxSize: 5, color: "black" }}
                  w="50px"
                  h="50px"
                  bg="white"
                />
              </Flex>
            </Flex>
            {ModalContent}
          </Flex>
        </Fade>
      </Flex>
      <Flex position="fixed" bottom={0} right={0} zIndex="10000">
        <LocalVideoPreview
          position="absolute"
          bottom="0"
          right="0"
          w={isVisible ? ["12rem", "20rem"] : ["6rem", "10rem"]}
          pb={["0", "56.25%"]}
          pt={["56.25%", "0"]}
          zIndex={2}
          m="1rem"
          borderRadius="lg"
          transition="width .2s"
        />
      </Flex>
    </>
  )
}

export default VideoControls
