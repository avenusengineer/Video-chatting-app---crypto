import Image from "next/image"
import { useRouter } from "next/router"
import { useParam, Routes } from "@blitzjs/next"
import { invalidateQuery, useMutation, useQuery } from "@blitzjs/rpc"
import { usePrevious } from "@chakra-ui/hooks"
import { Flex, Text, Button } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import humanize from "humanize-duration"

import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import completeRoom from "app/rooms/mutations/completeRoom"
import heartbeat from "app/rooms/queries/heartbeat"
import getCurrentUser from "app/users/queries/getCurrentUser"
import getUser from "app/users/queries/getUser"
import useVideoContext from "app/core/hooks/useVideoContext"
import RoomView from "./RoomView"
import TrackSelection from "./TrackSelection"
import VideoControls from "./VideoControls"

interface ParticipantViewProps {
  currentUser: NonNullable<ReturnType<typeof useCurrentUser>>
}

const ParticipantView = ({ currentUser }: ParticipantViewProps): JSX.Element => {
  const roomId = useParam("id", "string")!
  const [isReady, setIsReady] = useState(false)
  const { connect, isConnecting, isConnected, room, elapsedTime, participant } = useVideoContext()
  const prevIsConnected = usePrevious(isConnected)
  const [completeRoomMutation] = useMutation(completeRoom)
  const router = useRouter()
  const [creator] = useQuery(
    getUser,
    {
      username: roomId,
    },
    {
      suspense: false,
      refetchInterval: 5000,
    }
  )
  const [queue] = useQuery(
    heartbeat,
    { roomId },
    {
      refetchInterval: 1000,
      refetchIntervalInBackground: true,
      enabled: isReady,
      suspense: false,
    }
  )

  const maximumDuration = Math.floor((currentUser?.gems ?? 0) / (creator?.price ?? 0)) * 1000

  useEffect(() => {
    if (!isConnected && creator && creator.status !== "CONNECTED") {
      router.push(Routes.User({ username: creator.username, unavailable: "true" }))
    }
  }, [creator, router, isConnected])

  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (room && isConnected) {
      timeout = setTimeout(() => {
        room.disconnect()
        completeRoomMutation({ roomId: room.sid, roomName: room.name }).finally(() =>
          router.push("/")
        )
      }, maximumDuration)
    }

    return () => {
      clearTimeout(timeout)
    }
  }, [room, isConnected, completeRoomMutation, maximumDuration, router])

  useEffect(() => {
    if (prevIsConnected && !isConnected) {
      invalidateQuery(getCurrentUser)
      if (room) {
        room.disconnect()
      }

      router.push("/")
    }
  }, [completeRoomMutation, isConnected, prevIsConnected, room, router])

  useEffect(() => {
    if (queue?.status === "refused") {
      router.push(
        Routes.User({
          username: roomId,
          unavailable: "true",
        })
      )
    }
  }, [queue?.status, router, roomId])

  useEffect(() => {
    if (queue?.status === "accepted" && !isConnecting && !isConnected) {
      // TODO: add confirmation button instead of auto-connect
      void connect(queue?.token, roomId!).catch((err) =>
        console.error("Failed to connect to room:", err)
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connect, queue?.status, isConnecting, isConnected])

  if (isConnected) {
    return (
      <>
        {isConnected && currentUser && participant && (
          <VideoControls
            elapsedTime={elapsedTime}
            participant={participant}
            currentUser={currentUser}
          />
        )}
        <RoomView />
      </>
    )
  }

  return (
    <TrackSelection
      isReady={isReady}
      user={creator}
      currentUser={currentUser}
      informationContainer={
        <Flex flexDir="row" w="100%" bgColor="black" gridGap="1rem">
          <Flex
            w="14rem"
            h="12rem"
            position="relative"
            css={{
              img: { borderRadius: "15px" },
            }}
          >
            {creator?.images[0] && (
              <Image
                src={creator.images[0].url}
                alt={creator.username}
                layout="fill"
                objectFit="cover"
              />
            )}
          </Flex>
          <Flex
            w="100%"
            flexDir="column"
            textAlign="center"
            fontSize="2xl"
            border="2px solid rgba(255, 255, 255, 0.2)"
            borderRadius="md"
            justifyContent="center"
            lineHeight="2rem"
          >
            <Text fontWeight="medium" color="rgba(255, 255, 255, 0.5)">
              Video chat for up to
            </Text>
            <Text fontWeight="bold">{humanize(maximumDuration, { round: true, largest: 2 })}</Text>
          </Flex>
        </Flex>
      }
      bottomContainer={
        <Flex
          py="1.5rem"
          justifyContent="center"
          flexDir="column"
          alignItems="center"
          gridGap=".5rem"
        >
          {queue?.status !== "refused" && (
            <>
              <Button
                bgColor="white"
                color="black"
                w="fit-content"
                px="3rem"
                disabled={isReady}
                onClick={() => setIsReady(true)}
                isLoading={isReady}
                loadingText={isConnecting ? "Connecting..." : "Waiting..."}
              >
                Ready
              </Button>
              {isReady && (
                <Button w="fit-content" onClick={() => setIsReady(false)} variant="ghost">
                  Cancel
                </Button>
              )}
            </>
          )}
        </Flex>
      }
    />
  )
}

export default ParticipantView
