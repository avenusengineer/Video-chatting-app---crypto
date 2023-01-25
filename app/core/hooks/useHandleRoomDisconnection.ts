import { Room, TwilioError } from "twilio-video"
import { useEffect } from "react"

export const useHandleRoomDisconnection = (
  room: Room | null,
  onError: (Error) => void,
  removeLocalAudioTrack: () => void,
  removeLocalVideoTrack: () => void
) => {
  useEffect(() => {
    if (room) {
      const onDisconnected = (_: Room, error: TwilioError) => {
        if (error) {
          onError(error)
        }

        removeLocalAudioTrack()
        removeLocalVideoTrack()
      }

      room.on("disconnected", onDisconnected)
      return () => {
        room.off("disconnected", onDisconnected)
      }
    }
  }, [room, onError, removeLocalAudioTrack, removeLocalVideoTrack])
}

export default useHandleRoomDisconnection
