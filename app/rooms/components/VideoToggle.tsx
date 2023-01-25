import { Icon, IconButton, IconButtonProps, IconProps } from "@chakra-ui/react"
import { Video, VideoOff } from "react-feather"

import useVideoContext from "app/core/hooks/useVideoContext"
import useLocalVideoToggle from "app/core/hooks/useLocalVideoToggle"

interface AudioToggleProps extends Omit<IconButtonProps, "aria-label"> {
  disabled?: boolean
  iconProps?: IconProps
}

const VideoToggle = ({ disabled, iconProps, ...props }: AudioToggleProps) => {
  const { localTracks } = useVideoContext()
  const [isVideoEnabled, toggleVideoEnabled] = useLocalVideoToggle()

  const hasVideoTrack = localTracks.some((track) => track.kind === "video")

  return (
    <IconButton
      isRound
      w="4rem"
      h="4rem"
      onClick={toggleVideoEnabled}
      disabled={!hasVideoTrack || disabled}
      icon={
        isVideoEnabled ? (
          <Icon as={Video} boxSize={8} {...iconProps} />
        ) : (
          <Icon as={VideoOff} boxSize={8} {...iconProps} />
        )
      }
      aria-label="Toggle video"
      bg="rgba(196, 196, 196, 0.1)"
      _hover={{ bg: "rgba(255, 255, 255, 0.3)" }}
      {...props}
    />
  )
}

export default VideoToggle
