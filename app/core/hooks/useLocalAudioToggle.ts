import { useCallback } from "react"
import { LocalAudioTrack } from "twilio-video"

import useIsTrackEnabled from "./useIsTrackEnabled"
import useVideoContext from "./useVideoContext"

const useLocalAudioToggle = (): [boolean, () => void] => {
  const { localTracks } = useVideoContext()

  const audioTrack = localTracks.find((track) => track.kind === "audio") as LocalAudioTrack
  const isEnabled = useIsTrackEnabled(audioTrack)

  const toggleAudioEnabled = useCallback(() => {
    if (audioTrack) {
      audioTrack.isEnabled ? audioTrack.disable() : audioTrack.enable()
    }
  }, [audioTrack])

  return [isEnabled, toggleAudioEnabled]
}

export default useLocalAudioToggle
