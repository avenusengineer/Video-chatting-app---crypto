import { useCallback, useEffect, useState } from "react"
import Video, { LocalAudioTrack, LocalVideoTrack } from "twilio-video"

import {
  DEFAULT_VIDEO_CONSTRAINTS,
  SELECTED_AUDIO_INPUT_KEY,
  SELECTED_VIDEO_INPUT_KEY,
} from "app/constants"
import { getDeviceInfo } from "./useDeviceInfo"

export async function isPermissionDenied(name: PermissionName | "camera" | "microphone") {
  if (navigator.permissions) {
    try {
      const result = await navigator.permissions.query({ name: name as PermissionName })
      return result.state === "denied"
    } catch {
      return false
    }
  } else {
    return false
  }
}

// TODO: listen for changes when enabled or disabled.
export async function permissionListener(
  name: PermissionName | "camera" | "microphone",
  eventListener: (event: PermissionStatusEventMap["change"]) => void
) {
  if (navigator.permissions) {
    try {
      const result = await navigator.permissions.query({ name: name as PermissionName })
      result.addEventListener("change", eventListener)
      return () => {
        result.removeEventListener("change", eventListener)
      }
    } catch {}

    return () => {}
  }
}

export const useLocalTracks = () => {
  const [localTracksError, setLocalTracksError] = useState<Error | null>(null)
  const [audioTrack, setAudioTrack] = useState<LocalAudioTrack>()
  const [videoTrack, setVideoTrack] = useState<LocalVideoTrack>()
  const [isAcquiringLocalTracks, setIsAcquiringLocalTracks] = useState(false)

  const removeLocalAudioTrack = useCallback(() => {
    if (audioTrack) {
      audioTrack.mediaStreamTrack.stop()
      audioTrack.detach().forEach((element) => element.remove())
      audioTrack.stop()
      setAudioTrack(undefined)
    }
  }, [audioTrack])

  const removeLocalVideoTrack = useCallback(() => {
    if (videoTrack) {
      videoTrack.mediaStreamTrack.stop()
      videoTrack.detach().forEach((element) => element.remove())
      videoTrack.stop()

      setVideoTrack(undefined)
    }
  }, [videoTrack])

  const getAudioAndVideoTracks = useCallback(async () => {
    if (audioTrack || videoTrack) return Promise.resolve()

    const { audioInputDevices, videoInputDevices, hasAudioInputDevices, hasVideoInputDevices } =
      await getDeviceInfo()

    if (!hasAudioInputDevices && !hasVideoInputDevices) return Promise.resolve()

    setIsAcquiringLocalTracks(true)

    const selectedAudioDeviceId = window.localStorage.getItem(SELECTED_AUDIO_INPUT_KEY)
    const selectedVideoDeviceId = window.localStorage.getItem(SELECTED_VIDEO_INPUT_KEY)

    const selectedAudioDevice = audioInputDevices.find(
      (device) => selectedAudioDeviceId && device.deviceId === selectedAudioDeviceId
    )
    const selectedVideoDevice = videoInputDevices.find(
      (device) => selectedVideoDeviceId && device.deviceId === selectedVideoDeviceId
    )

    // In Chrome, it is possible to deny permissions to only audio or only video.
    // If that has happened, then we don't want to attempt to acquire the device.
    const isCameraPermissionDenied = await isPermissionDenied("camera")
    const isMicrophonePermissionDenied = await isPermissionDenied("microphone")

    const shouldAcquireVideo = hasVideoInputDevices
    const shouldAcquireAudio = hasAudioInputDevices

    const localTrackConstraints: Video.CreateLocalTracksOptions = {
      video: shouldAcquireVideo && {
        ...(DEFAULT_VIDEO_CONSTRAINTS as {}),
        name: selectedVideoDevice?.label,
        deviceId: selectedVideoDevice
          ? selectedVideoDevice.deviceId
          : videoInputDevices?.[0]?.deviceId,
      },
      audio: shouldAcquireAudio && {
        name: selectedAudioDevice?.label,
        deviceId: selectedAudioDevice
          ? selectedAudioDevice.deviceId
          : audioInputDevices?.[0]?.deviceId,
      },
    }

    return Video.createLocalTracks(localTrackConstraints)
      .then((tracks) => {
        const newVideoTrack = tracks.find((track) => track.kind === "video") as LocalVideoTrack
        const newAudioTrack = tracks.find((track) => track.kind === "audio") as LocalAudioTrack
        if (newVideoTrack) {
          setVideoTrack(newVideoTrack)
          // Save the deviceId so it can be picked up by the VideoInputList component. This only matters
          // in cases where the user's video is disabled.
          window.localStorage.setItem(
            SELECTED_VIDEO_INPUT_KEY,
            newVideoTrack.mediaStreamTrack.getSettings().deviceId ?? ""
          )
        }
        if (newAudioTrack) {
          setAudioTrack(newAudioTrack)
          window.localStorage.setItem(
            SELECTED_AUDIO_INPUT_KEY,
            newAudioTrack.mediaStreamTrack.getSettings().deviceId ?? ""
          )
        }
      })
      .catch((error) => {
        if (isCameraPermissionDenied && isMicrophonePermissionDenied) {
          setLocalTracksError(Error("NotAllowedError"))
        } else if (isCameraPermissionDenied) {
          setLocalTracksError(Error("CameraPermissionsDenied"))
        } else if (isMicrophonePermissionDenied) {
          setLocalTracksError(Error("MicrophonePermissionsDenied"))
        } else {
          setLocalTracksError(error)
        }
      })
      .finally(() => setIsAcquiringLocalTracks(false))
  }, [audioTrack, videoTrack])

  useEffect(() => {
    if (videoTrack) {
      window.localStorage.setItem(
        SELECTED_VIDEO_INPUT_KEY,
        videoTrack.mediaStreamTrack.getSettings().deviceId ?? ""
      )
    }
  }, [videoTrack])

  useEffect(() => {
    if (audioTrack) {
      window.localStorage.setItem(
        SELECTED_AUDIO_INPUT_KEY,
        audioTrack.mediaStreamTrack.getSettings().deviceId ?? ""
      )
    }
  }, [audioTrack])

  const localTracks = [audioTrack, videoTrack].filter((track) => track !== undefined) as (
    | LocalAudioTrack
    | LocalVideoTrack
  )[]

  return {
    localTracks,
    localTracksError,
    isAcquiringLocalTracks,
    removeLocalAudioTrack,
    removeLocalVideoTrack,
    getAudioAndVideoTracks,
    setAudioTrack,
    setVideoTrack,
  }
}

export default useLocalTracks
