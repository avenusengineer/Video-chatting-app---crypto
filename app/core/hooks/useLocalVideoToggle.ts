import { useCallback } from "react"
import { LocalVideoTrack } from "twilio-video"

import useIsTrackEnabled from "./useIsTrackEnabled"
import useVideoContext from "./useVideoContext"

const useLocalVideoToggle = (): [boolean, () => void] => {
  const { localTracks } = useVideoContext()

  const videoTrack = localTracks.find((track) => track.kind === "video") as LocalVideoTrack
  const isEnabled = useIsTrackEnabled(videoTrack)

  const toggleVideoEnabled = useCallback(() => {
    if (videoTrack) {
      videoTrack.isEnabled ? videoTrack.disable() : videoTrack.enable()
    }
  }, [videoTrack])

  return [isEnabled, toggleVideoEnabled]
}

export default useLocalVideoToggle
