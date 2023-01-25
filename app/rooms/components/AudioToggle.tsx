import { Icon, IconButtonProps, IconButton, IconProps } from "@chakra-ui/react"
import { Mic, MicOff } from "react-feather"

import useVideoContext from "app/core/hooks/useVideoContext"
import useLocalAudioToggle from "app/core/hooks/useLocalAudioToggle"

interface AudioToggleProps extends Omit<IconButtonProps, "aria-label"> {
  disabled?: boolean
  iconProps?: IconProps
}

const AudioToggle = ({ disabled, iconProps, ...props }: AudioToggleProps) => {
  const { localTracks } = useVideoContext()
  const [isAudioEnabled, toggleAudioEnabled] = useLocalAudioToggle()

  const hasAudioTrack = localTracks.some((track) => track.kind === "audio")

  return (
    <IconButton
      isRound
      w="4rem"
      h="4rem"
      onClick={toggleAudioEnabled}
      disabled={!hasAudioTrack || disabled}
      icon={
        isAudioEnabled ? (
          <Icon as={Mic} boxSize={8} {...iconProps} />
        ) : (
          <Icon as={MicOff} boxSize={8} {...iconProps} />
        )
      }
      aria-label="Toggle audio"
      bg="rgba(196, 196, 196, 0.1)"
      _hover={{ bg: "rgba(255, 255, 255, 0.3)" }}
      {...props}
    />
  )
}

export default AudioToggle
