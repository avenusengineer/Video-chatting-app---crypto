import { useEffect } from "react"
import { LocalAudioTrack, LocalVideoTrack } from "twilio-video"

export const useRestartAudioTrackOnDeviceChange = (
  localTracks: (LocalAudioTrack | LocalVideoTrack)[]
) => {
  const audioTrack = localTracks.find((track) => track.kind === "audio")

  useEffect(() => {
    const handleDeviceChange = () => {
      if (audioTrack?.mediaStreamTrack.readyState === "ended") {
        void audioTrack.restart({})
      }
    }

    navigator?.mediaDevices?.addEventListener("devicechange", handleDeviceChange)

    return () => {
      navigator?.mediaDevices?.removeEventListener("devicechange", handleDeviceChange)
    }
  }, [audioTrack])
}

export default useRestartAudioTrackOnDeviceChange
