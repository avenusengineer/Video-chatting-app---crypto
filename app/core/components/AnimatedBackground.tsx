import "css-doodle"
import { Flex, usePrefersReducedMotion } from "@chakra-ui/react"
import { FC, ReactNode } from "react"

interface AnimatedBackgroundProps {
  children: ReactNode
}

const AnimatedBackground: FC<AnimatedBackgroundProps> = ({ children }) => {
  const prefersReducedMotion = usePrefersReducedMotion()

  if (prefersReducedMotion) {
    return <>{children}</>
  }

  return (
    <Flex position="relative" maxW="100vw" overflowX="hidden" minH="100vh">
      <Flex
        zIndex="-1"
        left="0"
        top="0"
        position="absolute"
        w="100vmax"
        h="100hmax"
        fontSize="0"
        _after={{
          content: '""',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          position: "absolute",
          boxShadow: "inset 0px 0px 150px black",
        }}
      >
        <css-doodle>
          {`
            @grid: 2 / 100vw 100vh;
            transform: translateZ(0);
            backface-visibility: hidden;
            will-change: background-size;

            background-size: 300vmax 300vmax;
            background-position: @pn(0 0, 100% 0, 0 100%, 100% 100%);
            background-image: repeating-linear-gradient(
              @pn(-45deg, 45deg, -135deg, 135deg),
              @stripe(
                rgba(28, 15, 36, 1) 5vmin, transparent 5vmin
              )
            );

            animation: move 200s linear infinite;
            @keyframes move {
              to {
                background-size: 80vmax 80vmax;
              }
            }
        `}
        </css-doodle>
      </Flex>
      {children}
    </Flex>
  )
}

export default AnimatedBackground
