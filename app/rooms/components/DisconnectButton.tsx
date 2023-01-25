import { useMutation } from "@blitzjs/rpc"
import { Icon, IconButton, IconButtonProps, IconProps } from "@chakra-ui/react"
import { PhoneOff } from "react-feather"

import useVideoContext from "app/core/hooks/useVideoContext"
import completeRoom from "app/rooms/mutations/completeRoom"

interface DisconnectButtonProps extends Partial<IconButtonProps> {
  iconProps?: IconProps
}

const DisconnectButton = ({ iconProps, ...props }: DisconnectButtonProps) => {
  const { room } = useVideoContext()
  const [completeRoomMutation] = useMutation(completeRoom)

  return (
    <IconButton
      isRound
      w="4rem"
      h="4rem"
      onClick={() => {
        if (room) {
          room?.disconnect()
          completeRoomMutation({
            roomId: room.sid,
            roomName: room.name,
          })
        }
      }}
      disabled={!room}
      bg="#EB5545"
      _hover={{ bg: "rgba(255, 255, 255, 0.3)" }}
      aria-label="disconnected"
      icon={<Icon as={PhoneOff} boxSize={6} {...iconProps} />}
      {...props}
    />
  )
}

export default DisconnectButton
