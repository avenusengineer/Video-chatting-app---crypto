import { useQuery } from "@blitzjs/rpc"
import { useCallback, useEffect, useState } from "react"
import Video, { ConnectOptions, LocalTrack, Room } from "twilio-video"

import getUser from "app/users/queries/getUser"
import { isMobile } from "app/utils"
import useTimer from "./useTimer"

export const useRoom = (
  localTracks: LocalTrack[],
  onError: (Error) => void,
  options?: ConnectOptions
) => {
  const [isPaused, setIsPaused] = useState(true)
  const [room, setRoom] = useState<Room | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [elapsedTime, setElapsedTime] = useTimer(isPaused)
  const [username, setUsername] = useState<string | null>(null)
  const [participant] = useQuery(
    getUser,
    {
      username: username ?? "",
    },
    {
      enabled: !!username,
      suspense: false,
    }
  )

  useEffect(() => {
    if (room) {
      if (room.participants.size > 0) setIsPaused(false)

      const onParticipantConnected = () => setIsPaused(false)
      const onParticipantDisconnected = () => setIsPaused(true)

      room.on("participantConnected", onParticipantConnected)
      room.on("participantDisconnected", onParticipantDisconnected)

      return () => {
        room.off("participantConnected", onParticipantConnected)
        room.off("participantDisconnected", onParticipantDisconnected)
      }
    } else {
      setIsPaused(true)
    }
  }, [room])

  const connect = useCallback(
    (token: string, participantUsername: string) => {
      setIsConnecting(true)
      setUsername(participantUsername)

      return Video.connect(token, {
        ...options,
        tracks: localTracks,
        audio: true,
        video: true,
        bandwidthProfile: {
          video: {
            clientTrackSwitchOffControl: "auto",
            contentPreferencesMode: "auto",
          },
        },
        preferredVideoCodecs: "auto",
      }).then(
        (newRoom) => {
          setRoom(newRoom)
          setElapsedTime(0)

          const disconnect = () => newRoom.disconnect()

          newRoom.setMaxListeners(3)

          newRoom.once("disconnected", () => {
            setTimeout(() => {
              setRoom(null)
              setUsername(null)
            })
            window.removeEventListener("beforeunload", disconnect)
            if (isMobile) {
              window.removeEventListener("pagehide", disconnect)
            }
          })

          newRoom.localParticipant.videoTracks.forEach((publication) =>
            publication.setPriority("low")
          )

          setIsConnecting(false)

          window.addEventListener("beforeunload", disconnect)

          if (isMobile) {
            window.addEventListener("pagehide", disconnect)
          }
        },

        (error) => {
          onError(error)
          setIsConnecting(false)
          setUsername(null)
        }
      )
    },

    [localTracks, onError, options, setElapsedTime]
  )

  return {
    room,
    isConnecting,
    isConnected: room !== null,
    connect,
    elapsedTime,
    participant: username ? participant : undefined,
  }
}

export default useRoom
