import { useEffect } from "react"
import { Room } from "twilio-video"

export default function useHandleTrackPublicationFailed(
  room: Room | null,
  onError: (Error) => void
) {
  useEffect(() => {
    if (room) {
      room.localParticipant.on("trackPublicationFailed", onError)

      return () => {
        room.localParticipant.off("trackPublicationFailed", onError)
      }
    }
  }, [room, onError])
}
