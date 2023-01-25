import { useSession } from "@blitzjs/auth"
import { useQuery } from "@blitzjs/rpc"
import { Flex, Icon, IconButton, usePrefersReducedMotion } from "@chakra-ui/react"
import { keyframes } from "@emotion/react"
import { Video } from "react-feather"
import { FC } from "react"

import getQueueLength from "app/users/queries/getQueueLength"

const shake = keyframes`
10%, 90% {
  transform: translate3d(-1px, 0, 0);
}

20%, 80% {
  transform: translate3d(2px, 0, 0);
}

30%, 50%, 70% {
  transform: translate3d(-4px, 0, 0);
}

40%, 60% {
  transform: translate3d(4px, 0, 0);
}
`

interface IncomingCallButtonProps {
  onClick?: () => void
}

const IncomingCallButton: FC<IncomingCallButtonProps> = ({ onClick }) => {
  const prefersReducedMotion = usePrefersReducedMotion()
  const animation = prefersReducedMotion ? undefined : `${shake} infinite 1.5s ease`
  const [queueLength] = useQuery(
    getQueueLength,
    { room: useSession().username! },
    {
      refetchInterval: 5000,
      suspense: false,
    }
  )

  if (!queueLength) return null

  return (
    <Flex position="fixed" bottom={0} right={0} p="2rem" zIndex={999}>
      <IconButton
        animation={animation}
        aria-label="accept"
        icon={<Icon as={Video} boxSize={8} />}
        bg="#75FF26"
        borderRadius="100%"
        w="3.5rem"
        h="3.5rem"
        color="black"
        onClick={onClick}
      />
    </Flex>
  )
}

export default IncomingCallButton
