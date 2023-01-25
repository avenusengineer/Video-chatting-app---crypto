import { useQuery } from "@blitzjs/rpc"
import {
  Flex,
  Icon,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerBody,
  DrawerHeader,
} from "@chakra-ui/react"
import React, { Suspense } from "react"
import { ChevronLeft, X } from "react-feather"

import useMenu from "app/core/hooks/useMenu"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import getCurrentUser from "app/users/queries/getCurrentUser"
import Main from "./Main"
import List from "./List"
import Wallet from "./Wallet"
import EditProfile from "./EditProfile"
import Earn from "./Earn"
import Settings from "./Settings"
import Earnings from "./Earnings"

interface MenuPageProps {
  user: NonNullable<ReturnType<typeof useCurrentUser>>
}

const MenuPage = ({ user }: MenuPageProps) => {
  const { state } = useMenu()

  switch (state.page) {
    case "MAIN":
      return <Main user={user} />
    case "WALLET":
      return <Wallet user={user} />
    case "EARNINGS":
      return <Earnings user={user} />
    case "SETTINGS":
      return <Settings user={user} />
    case "EARN":
      return <Earn user={user} />
    case "LIST":
      return <List />
    case "EDIT_PROFILE":
      return <EditProfile user={user} focusOnMount={state.autoFocus} />
  }
}

interface MenuModalProps {
  onClose: () => void
}

const MenuModal = ({ onClose }: MenuModalProps) => {
  const [user] = useQuery(getCurrentUser, null)
  const { dispatch, state } = useMenu()

  return (
    <Drawer
      autoFocus={false}
      trapFocus={false}
      lockFocusAcrossFrames={false}
      size={["full", "md"]}
      placement="right"
      isOpen={state.isOpen}
      onClose={() =>
        dispatch({
          type: "SET_IS_OPEN",
          payload: {
            isOpen: false,
          },
        })
      }
    >
      <DrawerOverlay />
      <DrawerContent
        minH="100vh"
        h="full"
        w="full"
        pt="1rem"
        bg="#1D1A1E"
        flexDir="column"
        borderLeftRadius={["none", "3xl"]}
      >
        <DrawerHeader
          position="sticky"
          top="0"
          left="0"
          py={["0", "1rem"]}
          w="full"
          //backdropFilter="blur(10px)"
          //bg="rgba(255, 255, 255, 0.1)"
        >
          <Flex
            flexDir="row"
            justifyContent={state.page !== "MAIN" ? "space-between" : "end"}
            mx="-1rem"
            w="full"
          >
            {state.page !== "MAIN" && (
              <Icon
                as={ChevronLeft}
                boxSize={10}
                alignSelf="end"
                onClick={() => {
                  switch (state.page) {
                    case "SETTINGS":
                    case "WALLET":
                      return dispatch({
                        type: "SET_PAGE",
                        payload:
                          state.subPage === "MAIN"
                            ? {
                                page: "MAIN",
                              }
                            : {
                                page: state.page,
                                subPage: "MAIN",
                              },
                      })
                    default:
                      return dispatch({
                        type: "SET_PAGE",
                        payload: {
                          page: "MAIN",
                        },
                      })
                  }
                }}
                cursor="pointer"
              />
            )}
            <Icon as={X} boxSize={10} justifySelf="end" onClick={onClose} cursor="pointer" />
          </Flex>
        </DrawerHeader>
        <DrawerBody overflowY="auto" w="full" pb={["2rem", "5rem"]} id="menu-container">
          <Suspense>
            <Flex
              px={["1rem", "3rem"]}
              w="full"
              sx={{
                "> div": {
                  width: "100%",
                },
              }}
            >
              {user && <MenuPage user={user} />}
            </Flex>
          </Suspense>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export default MenuModal
