import { LocalAudioTrack, LocalVideoTrack } from "twilio-video"
import { Flex, FlexProps, Text } from "@chakra-ui/react"
import { useEffect } from "react"

import useVideoContext from "app/core/hooks/useVideoContext"
import { VideoTrack } from "./VideoTrack"
import useLocalVideoToggle from "app/core/hooks/useLocalVideoToggle"

export type LocalVideoPreviewProps = FlexProps

export const LocalVideoPreview = (props: LocalVideoPreviewProps) => {
  const [isEnabled] = useLocalVideoToggle()
  const { localTracks } = useVideoContext()

  const audioTrack = localTracks.find((track) => track.kind === "audio") as LocalAudioTrack
  const videoTrack = localTracks.find(
    (track) => !track?.name?.includes("screen") && track?.kind === "video"
  ) as LocalVideoTrack

  useEffect(() => {
    if (videoTrack && (!videoTrack.isStarted || videoTrack.isStopped)) {
      videoTrack.restart()
    }
    if (audioTrack && (!audioTrack.isStarted || audioTrack.isStopped)) {
      audioTrack.restart()
    }

    return () => {
      audioTrack?.stop()
      videoTrack?.stop()
    }
  }, [videoTrack, audioTrack])

  useEffect(() => {
    return () => {
      audioTrack?.mediaStreamTrack?.stop()
      videoTrack?.mediaStreamTrack?.stop()
    }
  }, [videoTrack, audioTrack])

  if (!videoTrack) return null

  return (
    <Flex flexDir="column" overflow="hidden" position="relative" {...props}>
      {!isEnabled && (
        <Flex
          position="absolute"
          zIndex={1}
          justifyContent="center"
          alignItems="center"
          w="100%"
          h="100%"
        >
          <Text color="white" fontSize={["xs", "2xl"]}>
            Camera is disabled
          </Text>
        </Flex>
      )}
      <VideoTrack track={videoTrack} isLocal />
    </Flex>
  )
}

export default LocalVideoPreview
