import Image from "next/image"
import { useRouter } from "next/router"
import { Routes } from "@blitzjs/next"
import { invalidateQuery, useMutation } from "@blitzjs/rpc"
import { Box, Button, ButtonGroup, Flex, HStack, Icon, Text } from "@chakra-ui/react"
import { FC } from "react"
import { Star } from "react-feather"

import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import updateStatus from "app/users/mutations/updateStatus"
import getCurrentUser from "app/users/queries/getCurrentUser"
import getUser from "app/users/queries/getUser"
import useMenu from "app/core/hooks/useMenu"
import useUserContext from "app/core/hooks/useUserContext"
import Check from "app/core/icons/Check"
import Gem from "app/core/icons/Gem"
import Settings from "app/core/icons/Settings"
import useBlurHash from "app/core/hooks/useBlurHash"
import Dollar from "app/core/icons/Dollar"

interface MainProps {
  user: NonNullable<ReturnType<typeof useCurrentUser>>
}

const UserStatusIndicator = ({ user }: MainProps) => {
  const [{ onlineIndicatorEnabled }, setUserState] = useUserContext()
  const [updateStatusMutation] = useMutation(updateStatus, {
    onSuccess: async () => {
      await invalidateQuery(getCurrentUser)
      await invalidateQuery(getUser, { username: user.username })
    },
  })

  const setOnlineIndicatorEnabled = async (enabled: boolean) => {
    setUserState({ onlineIndicatorEnabled: enabled })
    await updateStatusMutation({
      status: enabled ? "CONNECTED" : "DISCONNECTED",
    })
  }

  return (
    <Flex
      position="relative"
      alignItems="center"
      width="fit-content"
      fontWeight="semibold"
      cursor="pointer"
      _after={{
        position: "absolute",
        content: "''",
        width: "full",
        height: "full",
        border: "2px solid rgba(196, 196, 196, 0.5)",
        borderRadius: "xl",
        pointerEvents: "none",
      }}
    >
      <Text
        onClick={() => setOnlineIndicatorEnabled(true)}
        p="5px 15px"
        mr="-2px"
        {...(onlineIndicatorEnabled && {
          color: "#75FF26",
          borderWidth: "2px",
          borderColor: "white",
          borderRadius: "xl",
        })}
      >
        Online
      </Text>
      <Text
        onClick={() => setOnlineIndicatorEnabled(false)}
        p="5px 15px"
        ml="-2px"
        {...(!onlineIndicatorEnabled && {
          color: "red",
          borderWidth: "2px",
          borderColor: "white",
          borderRadius: "xl",
        })}
      >
        Offline
      </Text>
    </Flex>
  )
}

const Main: FC<MainProps> = ({ user }) => {
  const router = useRouter()
  const { dispatch } = useMenu()
  const imageHash = useBlurHash(user.images?.[0]?.hash)

  return (
    <Flex flexDir="column" gridGap="1rem">
      <Flex flexDir="column" lineHeight="2rem">
        <Flex flexDir="row" alignItems="center" gridGap=".5rem">
          <Text fontSize="3xl" fontWeight="semibold" p="0" m="0">
            {user.name}
          </Text>
          {user.role === "CREATOR" && <Check w="1.2rem" h="1.2rem" />}
        </Flex>
        <Text fontSize="lg" fontWeight="medium" color="rgba(255, 255, 255, 0.5)" p="0" m="0">
          @{user.username}
        </Text>
      </Flex>

      {user.role === "CREATOR" && <UserStatusIndicator user={user} />}

      <Flex flexDir="row">
        <Box
          borderRadius="xl"
          overflow="hidden"
          position="relative"
          w="6rem"
          h="7.5rem"
          cursor="pointer"
          onClick={() =>
            dispatch({
              type: "SET_PAGE",
              payload: {
                page: "EDIT_PROFILE",
                autoFocus: true,
              },
            })
          }
        >
          {user.images[0] ? (
            <>
              <Image
                alt="thumbnail"
                objectFit="cover"
                objectPosition="center center"
                src={user.images[0].url}
                layout="fill"
                {...(imageHash && {
                  blurDataURL: imageHash,
                  placeholder: "blur",
                })}
              />
              {/* <Flex
                w="100%"
                h="100%"
                position="absolute"
                left="0"
                top="0"
                opacity="0"
                alignItems="center"
                justifyContent="center"
                bg="black"
                transition="opacity 0.1s"
                _hover={{
                  opacity: "0.8",
                }}
              >
                <Text textAlign="center" fontWeight="semibold" color="white">
                  Edit picture
                </Text>
              </Flex> */}
            </>
          ) : (
            <Flex
              bg="rgba(255, 255, 255, 0.1)"
              cursor="pointer"
              _hover={{
                bg: "rgba(255, 255, 255, 0.2)",
              }}
              borderRadius="xl"
              overflow="hidden"
              position="relative"
              w="6rem"
              h="7.5rem"
              alignItems="center"
              justifyContent="center"
            >
              <Text fontWeight="semibold" fontSize="0.8rem">
                + Add picture
              </Text>
            </Flex>
          )}
        </Box>
      </Flex>

      <HStack spacing="1rem">
        {user.role === "CREATOR" && (
          <Button
            variant="outline"
            w="fit-content"
            colorScheme="grey"
            borderColor="rgba(255,255,255,0.35)"
            onClick={async () => {
              await router.push(Routes.User({ username: user.username }))
              dispatch({
                type: "SET_IS_OPEN",
                payload: {
                  isOpen: false,
                },
              })
            }}
          >
            View Profile
          </Button>
        )}
        <Button
          variant="outline"
          w="fit-content"
          colorScheme="grey"
          display="grid"
          borderColor="rgba(255,255,255,0.35)"
          onClick={() =>
            dispatch({
              type: "SET_PAGE",
              payload: {
                page: "EDIT_PROFILE",
              },
            })
          }
        >
          Edit Profile
        </Button>
      </HStack>

      <ButtonGroup
        flexDir="column"
        variant="outline"
        colorScheme="grey"
        spacing={0}
        mt={["1rem", "3rem"]}
        gridGap="1rem"
        size="lg"
        w="100%"
        justifyContent="flex-start"
        maxW="100%"
        sx={{
          "&>button": {
            bgColor: "rgba(255, 255, 255, 0.05)",
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            fontSize: "xl",
            border: "none",
          },
        }}
      >
        {user.role === "CREATOR" && (
          <Button
            leftIcon={<Dollar boxSize={6} color="#B026FF" />}
            onClick={() =>
              dispatch({
                type: "SET_PAGE",
                payload: {
                  page: "EARNINGS",
                },
              })
            }
          >
            Earnings
          </Button>
        )}
        <Button
          leftIcon={<Gem boxSize={6} />}
          onClick={() =>
            dispatch({
              type: "SET_PAGE",
              payload: {
                page: "WALLET",
                subPage: "MAIN",
              },
            })
          }
        >
          Wallet
        </Button>
        <Button
          leftIcon={<Icon as={Star} boxSize={6} fill="white" />}
          onClick={() =>
            dispatch({
              type: "SET_PAGE",
              payload: {
                page: "LIST",
              },
            })
          }
        >
          My List
        </Button>
        {user.role !== "CREATOR" && (
          <Button
            leftIcon={<Dollar boxSize={6} color="#B026FF" />}
            onClick={() =>
              dispatch({
                type: "SET_PAGE",
                payload: {
                  page: "EARN",
                },
              })
            }
          >
            Earn
          </Button>
        )}
        <Button
          leftIcon={<Settings boxSize={6} />}
          onClick={() =>
            dispatch({
              type: "SET_PAGE",
              payload: {
                page: "SETTINGS",
                subPage: "MAIN",
              },
            })
          }
        >
          Settings
        </Button>
      </ButtonGroup>
    </Flex>
  )
}

export default Main
