import { useQuery, useMutation } from "@blitzjs/rpc"
import { useCallback, useEffect, useState } from "react"

import getUsers from "app/users/queries/getUsers"
import participants from "app/rooms/queries/participants"
import useVideoContext from "./useVideoContext"
import accept from "app/rooms/mutations/accept"

interface UseCreatorRoomProps {
  autoAcceptUsername?: string
}

const useCreatorRoom = (props?: UseCreatorRoomProps) => {
  const { connect, room } = useVideoContext()
  const [acceptParticipant, { isLoading: isAcceptParticipantLoading }] = useMutation(accept)
  const [currentParticipant, setCurrentParticipant] = useState<string | null>(null)
  const [awaitingUsers = [], { isFetched }] = useQuery(participants, null, {
    refetchInterval: 1000,
    refetchIntervalInBackground: true,
    suspense: false,
  })
  const [users = []] = useQuery(
    getUsers,
    {
      usernames: awaitingUsers,
    },
    {
      enabled: awaitingUsers.length > 0,
      suspense: false,
    }
  )

  useEffect(() => {
    if (!awaitingUsers.some((username) => username === currentParticipant)) {
      setCurrentParticipant(null)
      room?.disconnect()
    }
  }, [currentParticipant, setCurrentParticipant, awaitingUsers, room])

  useEffect(() => {
    if (room) {
      const onDisconnect = () => {
        setCurrentParticipant(null)
      }

      room.on("disconnected", onDisconnect)

      return () => {
        room.off("disconnected", onDisconnect)
      }
    }
  }, [room])

  const onAcceptParticipant = useCallback(
    (username: string) => {
      if (currentParticipant !== username) {
        setCurrentParticipant(username)
        acceptParticipant({
          participant: username,
        })
          .then(({ token }) => connect(token, username))
          .catch((err) => console.error("Failed to accept participant:", err))
      }
    },
    [acceptParticipant, connect, currentParticipant]
  )

  useEffect(() => {
    if (isFetched && awaitingUsers.length > 0 && awaitingUsers[0] === props?.autoAcceptUsername) {
      onAcceptParticipant(awaitingUsers[0]!)
    }
  }, [isFetched, awaitingUsers, props?.autoAcceptUsername, onAcceptParticipant])

  return {
    onAcceptParticipant,
    isAcceptParticipantLoading,
    users,
  }
}

export default useCreatorRoom
