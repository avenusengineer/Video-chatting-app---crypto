import { Flex } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import Video from "twilio-video"

import useVideoContext from "app/core/hooks/useVideoContext"
import Participant from "./Participant"

const RoomView = () => {
  const { room, isConnecting } = useVideoContext()
  const [participants, setParticipants] = useState<Video.Participant[]>([])

  useEffect(() => {
    const participantConnected = (participant: Video.Participant) => {
      if (participants.findIndex((p) => p.sid === participant.sid) === -1) {
        setParticipants((prevParticipants) => [...prevParticipants, participant])
      }
    }

    const participantDisconnected = (participant: Video.Participant) => {
      setParticipants((prevParticipants) => prevParticipants.filter((p) => p !== participant))
    }

    if (room) {
      room.participants.forEach(participantConnected)

      room.on("participantConnected", participantConnected)
      room.on("participantDisconnected", participantDisconnected)

      return () => {
        room.off("participantConnected", participantConnected)
        room.off("participantDisconnected", participantDisconnected)
      }
    }
  }, [participants, room])

  return (
    <Flex
      flexDirection="column"
      gridGap="4rem"
      w="100vw"
      h="100vh"
      zIndex="999"
      bg="#09070B"
      position="fixed"
      left="0"
      top="0"
    >
      {isConnecting && <div>Connecting...</div>}
      <Flex flexDir="column" w="100%">
        {participants.map((participant) => (
          <Participant key={participant.sid} participant={participant} />
        ))}
      </Flex>
    </Flex>
  )
}

export default RoomView
