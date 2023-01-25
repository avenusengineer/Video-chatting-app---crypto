import { createContext, ReactNode, useCallback } from "react"
import { ConnectOptions, LocalAudioTrack, LocalVideoTrack } from "twilio-video"

import useHandleRoomDisconnection from "app/core/hooks/useHandleRoomDisconnection"
import useLocalTracks from "app/core/hooks/useLocalTracks"
import useRestartAudioTrackOnDeviceChange from "app/core/hooks/useRestartAudioTrackOnDeviceChange"
import useRoom from "app/core/hooks/useRoom"
import useHandleTrackPublicationFailed from "app/core/hooks/useHandleTrackPublicationFailed"

export interface IVideoContext extends ReturnType<typeof useRoom> {
  localTracks: (LocalAudioTrack | LocalVideoTrack)[]
  onError: (error: Error) => void
  localTracksError: Error | null
  setAudioTrack: (track: LocalAudioTrack) => void
  setVideoTrack: (track: LocalVideoTrack) => void
  isAcquiringLocalTracks: boolean
  removeLocalVideoTrack: () => void
  removeLocalAudioTrack: () => void
  getAudioAndVideoTracks: () => Promise<void>
}

export const VideoContext = createContext<IVideoContext>(null!)

interface VideoProviderProps {
  options?: ConnectOptions
  onError: (Error) => void
  children: ReactNode
}

export const VideoProvider = ({ options, children, onError = () => {} }: VideoProviderProps) => {
  const onErrorCallback = useCallback(
    (error: Error) => {
      console.error(`ERROR: ${error.message}`, error)
      onError(error)
    },
    [onError]
  )

  const {
    localTracks,
    localTracksError,
    isAcquiringLocalTracks,
    removeLocalAudioTrack,
    removeLocalVideoTrack,
    getAudioAndVideoTracks,
    setVideoTrack,
    setAudioTrack,
  } = useLocalTracks()

  const { room, isConnecting, connect, isConnected, elapsedTime, participant } = useRoom(
    localTracks,
    onErrorCallback,
    options
  )

  // Register callback functions to be called on room disconnect.
  useHandleRoomDisconnection(room, onError, removeLocalAudioTrack, removeLocalVideoTrack)
  useHandleTrackPublicationFailed(room, onError)
  useRestartAudioTrackOnDeviceChange(localTracks)

  return (
    <VideoContext.Provider
      value={{
        localTracksError,
        participant,
        room,
        localTracks,
        isConnecting,
        isConnected,
        elapsedTime,
        onError: onErrorCallback,
        connect,
        setVideoTrack,
        setAudioTrack,
        isAcquiringLocalTracks,
        removeLocalVideoTrack,
        removeLocalAudioTrack,
        getAudioAndVideoTracks,
      }}
    >
      {children}
    </VideoContext.Provider>
  )
}

export default VideoProvider
