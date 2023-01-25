import Link from "next/link"
import { Routes } from "@blitzjs/next"
import { Button, Flex, Icon, IconButton } from "@chakra-ui/react"
import { FC } from "react"
import { Menu as MenuIcon } from "react-feather"
import { useRouter } from "next/router"

import Person from "app/core/icons/Person"
import useMenu from "app/core/hooks/useMenu"
import GemsBalance from "./GemsBalance"
import MenuModal from "./MenuModal"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"

const UserInfo: FC = () => {
  const router = useRouter()
  const user = useCurrentUser(false)
  const {
    state: { isOpen },
    dispatch,
  } = useMenu()

  const isUserRoute = router.pathname === Routes.User(router.query as never).pathname
  const isCurrentUserRoute = isUserRoute && router.query.username === user?.username

  const isRoomRoute = router.pathname === Routes.RoomPage(router.query as never).pathname
  const isCurrentRoomRoute = isRoomRoute && router.query.id === user?.username

  if (user) {
    return (
      <>
        <MenuModal
          onClose={() =>
            dispatch({
              type: "SET_IS_OPEN",
              payload: {
                isOpen: false,
              },
            })
          }
        />
        <Flex
          alignItems="center"
          gridGap="1rem"
          w="100%"
          justifyContent={["space-between", "flex-end"]}
        >
          {user.role !== "CREATOR" ||
          (isUserRoute && !isCurrentUserRoute) ||
          (isRoomRoute && !isCurrentRoomRoute) ? (
            <>
              <div />
              <GemsBalance
                gems={user?.gems}
                onClick={() => {
                  dispatch({
                    type: "SET_IS_OPEN",
                    payload: {
                      isOpen: true,
                      page: "WALLET",
                      subPage: "MAIN",
                    },
                  })
                }}
              />
            </>
          ) : (
            <div />
          )}
          <Icon
            as={MenuIcon}
            boxSize={6}
            cursor="pointer"
            onClick={() =>
              dispatch({
                type: "SET_IS_OPEN",
                payload: {
                  isOpen: !isOpen,
                },
              })
            }
          />
        </Flex>
      </>
    )
  }

  return (
    <Flex gridGap={["1rem", "1.5rem"]}>
      <Link href={Routes.LoginPage()}>
        <a>
          <IconButton
            w="full"
            h="full"
            bgColor="#201727"
            icon={<Person />}
            aria-label="login"
            borderRadius="full"
          />
        </a>
      </Link>
      <Link href={Routes.SignupPage()}>
        <a>
          <Button size="md" bgColor="white" color="black">
            Sign Up
          </Button>
        </a>
      </Link>
    </Flex>
  )
}

export default UserInfo
