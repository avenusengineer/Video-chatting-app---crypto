import { useRouter } from "next/router"
import { useMutation } from "@blitzjs/rpc"
import { Routes } from "@blitzjs/next"
import { Flex, Button, Text, ButtonGroup } from "@chakra-ui/react"
import { FC } from "react"

import logout from "app/auth/mutations/logout"
import useMenu from "app/core/hooks/useMenu"
import useVideoContext from "app/core/hooks/useVideoContext"

const Main: FC = () => {
  const { removeLocalVideoTrack, removeLocalAudioTrack } = useVideoContext()
  const router = useRouter()
  const { dispatch } = useMenu()
  const [logoutMutation] = useMutation(logout, {
    onSuccess: () => {
      removeLocalVideoTrack()
      removeLocalAudioTrack()
    },
  })

  return (
    <Flex flexDir="column" h="100%" gridGap="2rem">
      <Text fontSize="xl" fontWeight="semibold">
        Settings
      </Text>
      <ButtonGroup
        flexDir="column"
        variant="outline"
        gridGap="2rem"
        spacing={0}
        size="lg"
        sx={{
          "&>button": {
            border: "none",
            bg: "rgba(255, 255, 255, 0.05)",
          },
        }}
      >
        <Button
          onClick={() =>
            dispatch({
              type: "SET_PAGE",
              payload: {
                page: "SETTINGS",
                subPage: "CHANGE_PASSWORD",
              },
            })
          }
        >
          Change password
        </Button>
        <Button
          onClick={() =>
            dispatch({
              type: "SET_PAGE",
              payload: {
                page: "SETTINGS",
                subPage: "PRIVACY_SETTINGS",
              },
            })
          }
        >
          Privacy settings
        </Button>
        <Button onClick={() => router.push(Routes.Terms())}>Legal</Button>
        <Button onClick={() => router.push(Routes.Contact())}>Contact</Button>
        <Button onClick={() => logoutMutation()} bg="#201727 !important">
          Log out
        </Button>
      </ButtonGroup>
    </Flex>
  )
}

export default Main
