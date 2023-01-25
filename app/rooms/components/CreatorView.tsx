import { useRouter } from "next/router"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { CheckIcon, LinkIcon } from "@chakra-ui/icons"
import { Avatar, AvatarGroup, Button, Flex, Text, useClipboard } from "@chakra-ui/react"
import { useState } from "react"

import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import refuse from "app/rooms/mutations/refuse"
import getQueueLength from "app/users/queries/getQueueLength"
import getUsers from "app/users/queries/getUsers"
import useVideoContext from "app/core/hooks/useVideoContext"
import RoomView from "./RoomView"
import TrackSelection from "./TrackSelection"
import useCreatorRoom from "app/core/hooks/useCreatorRoom"
import VideoControls from "./VideoControls"

interface AcceptUserViewProps {
  user: NonNullable<Awaited<ReturnType<typeof getUsers>>>[number]
  onAccept: () => void
  onRefuse: () => void
  isLoading: boolean
}

const AcceptUserView = ({ user, onAccept, onRefuse, isLoading }: AcceptUserViewProps) => (
  <Flex w="full" h="full" alignItems="center" justifyContent="center">
    <Flex
      alignItems="center"
      justifyContent="center"
      flexDir="column"
      gridGap="1rem"
      bg="rgba(0, 0, 0, 50)"
      w="full"
      py="1rem"
      px=".5rem"
    >
      <Avatar name={user.name || user.username} src={user.images[0]?.url} size="xl" />
      <Text fontSize="xl" fontWeight="bold">
        {user.name || user.username} is calling you
      </Text>
      <Flex gridGap="1rem">
        <Button colorScheme="red" onClick={onRefuse} isLoading={isLoading}>
          Refuse
        </Button>
        <Button colorScheme="green" onClick={onAccept} isLoading={isLoading}>
          Accept
        </Button>
      </Flex>
    </Flex>
  </Flex>
)

interface CreatorViewProps {
  currentUser: NonNullable<ReturnType<typeof useCurrentUser>>
}

const CreatorView = ({ currentUser }: CreatorViewProps): JSX.Element => {
  const router = useRouter()
  const { isConnected, isConnecting, participant, elapsedTime } = useVideoContext()
  const [isReady, setIsReady] = useState(true)
  const { onCopy, hasCopied } = useClipboard(window?.location.href)
  const [refuseParticipant, { isLoading: isRefuseParticipantLoading }] = useMutation(refuse)
  const { users, onAcceptParticipant, isAcceptParticipantLoading } = useCreatorRoom({
    autoAcceptUsername: router.query.accept as string,
  })
  const [queueLength] = useQuery(
    getQueueLength,
    { room: currentUser.username },
    {
      refetchInterval: 1000,
      suspense: false,
    }
  )

  if (isConnected) {
    return (
      <>
        {isConnected && currentUser && participant && (
          <VideoControls
            elapsedTime={elapsedTime}
            participant={participant}
            currentUser={currentUser}
            onAcceptParticipant={onAcceptParticipant}
          />
        )}
        <RoomView />
      </>
    )
  }

  return (
    <TrackSelection
      user={currentUser}
      isReady={isReady}
      currentUser={currentUser}
      cameraOverlay={
        users.length > 0 ? (
          <AcceptUserView
            isLoading={isAcceptParticipantLoading || isRefuseParticipantLoading || isConnecting}
            user={users[0]!}
            onAccept={() => onAcceptParticipant(users[0]!.username)}
            onRefuse={() => refuseParticipant({ participant: users[0]!.username })}
          />
        ) : null
      }
      informationContainer={
        <Flex
          flexDir="row"
          w="100%"
          bgColor="black"
          gridGap="1rem"
          border="2px solid rgba(255, 255, 255, 0.2)"
          textAlign="center"
          justifyContent="center"
          borderRadius="md"
          p="1rem"
        >
          <Flex
            align="center"
            justify="center"
            gridGap=".5rem"
            flexDir="column"
            position="relative"
            w="full"
          >
            <Text fontSize="md">This room is created by you. You can invite others to join.</Text>
            <Button
              leftIcon={hasCopied ? <CheckIcon /> : <LinkIcon />}
              onClick={onCopy}
              bg="#201727"
            >
              {hasCopied ? "Copied" : "Copy link"}
            </Button>
            <Text fontSize="md">There are {queueLength} people in the queue.</Text>
            {users.length > 0 && (
              <Flex position="absolute" right="0" bottom="0">
                <AvatarGroup size="md" max={2}>
                  {users.map(({ id, username, name, images }) => (
                    <Avatar key={id} name={name || username} src={images[0]?.url} />
                  ))}
                </AvatarGroup>
              </Flex>
            )}
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
          <Button
            bgColor="white"
            color="black"
            w="fit-content"
            px="3rem"
            disabled={isReady}
            onClick={() => setIsReady(true)}
            isLoading={isReady}
            loadingText="Waiting..."
          >
            Ready
          </Button>
          {isReady && (
            <Button w="fit-content" onClick={() => setIsReady(false)} variant="ghost">
              Cancel
            </Button>
          )}
        </Flex>
      }
    />
  )
}

export default CreatorView
