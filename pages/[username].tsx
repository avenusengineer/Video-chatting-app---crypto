import { FC, useState } from "react"
import Head from "next/head"
import Link from "next/link"
import { GetServerSideProps } from "next"
import { useSession } from "@blitzjs/auth"
import {
  useQuery,
  useMutation,
  getQueryKey,
  getQueryClient,
  dehydrate,
  invokeWithCtx,
} from "@blitzjs/rpc"
import { useParam, Routes, BlitzPage } from "@blitzjs/next"
import {
  Box,
  Flex,
  Grid,
  Icon,
  Text,
  Button,
  useToast,
  Menu,
  MenuList,
  MenuItem,
  MenuButton,
  Modal,
  ModalOverlay,
  ModalHeader,
  ModalCloseButton,
  ModalContent,
  ModalBody,
  BoxProps,
  HStack,
  FlexProps,
} from "@chakra-ui/react"
import humanize from "humanize-duration"
import { Star, Share, MoreVertical } from "react-feather"
import { useRouter } from "next/router"

import { gSSP } from "app/blitz-server"
import Check from "app/core/icons/Check"
import db, { UserStatus } from "db"
import addFavorite from "app/users/mutations/addFavorite"
import removeFavorite from "app/users/mutations/removeFavorite"
import getUser from "app/users/queries/getUser"
import isFavorite from "app/users/queries/isFavorite"
import Gem from "app/core/icons/Gem"
import Seconds from "app/core/icons/Second"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import Layout from "app/core/layouts/Layout"
import useMenu from "app/core/hooks/useMenu"
import getCurrentUser from "app/users/queries/getCurrentUser"
import reportUser from "app/users/mutations/reportUser"
import { DOLLAR_TO_GEMS, gemsToDollar } from "helpers/price"
import AnimatedBackground from "app/core/components/AnimatedBackground"
import getQueueLength from "app/users/queries/getQueueLength"
import Person from "app/core/icons/Person"
import ArrowWhite from "app/core/icons/ArrowWhite"

interface UserStatusTextProps {
  status: UserStatus
  lastSeenAt?: Date | null
}

const UserStatusText = ({ status, lastSeenAt }: UserStatusTextProps) => {
  const username = useParam("username", "string")!

  const [queueLength] = useQuery(
    getQueueLength,
    { room: username },
    {
      refetchInterval: 5000,
      suspense: false,
    }
  )
  switch (status) {
    case "CONNECTED":
      return (
        <HStack>
          <Text color="#75FF26">Online</Text>
          <Text>
            <Person fontSize={15} mt="-4px" mr="4px" />
            {queueLength} in queue
          </Text>
        </HStack>
      )
    case "DISCONNECTED":
      return (
        <Text color="rgba(255, 255, 255, 0.8)">
          last seen{" "}
          {lastSeenAt
            ? humanize(new Date().getTime() - new Date(lastSeenAt).getTime(), {
                round: true,
                largest: 1,
              })
            : "a while"}{" "}
          ago
        </Text>
      )
    case "AWAY":
      return <Text>Away</Text>
  }
}

interface UserStatusBadgeProps extends BoxProps {
  status: UserStatus
  lastSeenAt?: Date | null
  queue?: number
}

const UserStatusBadge = ({ status, lastSeenAt, ...boxProps }: UserStatusBadgeProps) => {
  return (
    <Box
      background="rgba(10, 7, 13, 0.5)"
      border="1px solid rgba(255, 255, 255, 0.25)"
      borderRadius={100}
      px="2rem"
      fontSize="1.25rem"
      backdropFilter="blur(10px)"
      fontWeight={600}
      {...boxProps}
    >
      <UserStatusText status={status} lastSeenAt={lastSeenAt} />
    </Box>
  )
}
const CarouselArrow = (props: FlexProps) => (
  <Flex
    position="absolute"
    top="50%"
    right="20px"
    translateX="-50%"
    translateY="-50%"
    zIndex={10}
    cursor="pointer"
    bg="rgba(10, 7, 12, 0.6)"
    h="54px"
    w="54px"
    borderRadius="50%"
    justify="center"
    align="center"
    {...props}
  >
    <ArrowWhite />
  </Flex>
)

interface UserInfoProps {
  user: Awaited<ReturnType<typeof getUser>>
}

const UserInfo = ({ user }: UserInfoProps) => {
  const toast = useToast()
  const router = useRouter()
  const { dispatch } = useMenu()
  const username = useParam("username", "string")!
  const session = useSession({
    suspense: false,
  })
  const isCurrentUser = session.username === username
  const currentUser = useCurrentUser(false)

  const [isUserFavorite] = useQuery(
    isFavorite,
    { username },
    {
      enabled: !!session.userId,
      suspense: false,
    }
  )

  const favoriteQueryKey = getQueryKey(isFavorite, { username })

  const [reportUserMutation, reportUserResult] = useMutation(reportUser, {})
  const [addFavoriteMutation] = useMutation(addFavorite, {
    onMutate: () => {
      getQueryClient().setQueryData(favoriteQueryKey, true)
    },
    onSuccess: async () => {
      await getQueryClient().refetchQueries([favoriteQueryKey])
    },
  })
  const [removeFavoriteMutation] = useMutation(removeFavorite, {
    onMutate: () => {
      getQueryClient().setQueryData(favoriteQueryKey, false)
    },
    onSuccess: async () => {
      await getQueryClient().refetchQueries([favoriteQueryKey])
    },
  })
  const [selectedImage, setSelectedImage] = useState(0)

  const duration = Math.floor((currentUser?.gems ?? 0) / user.price) * 1000

  const nextImage = () =>
    setSelectedImage((prev) => {
      if (prev === user.images.length - 1) return prev
      return prev + 1
    })

  const prevImage = () =>
    setSelectedImage((prev) => {
      if (prev === 0) return prev
      return prev - 1
    })

  const isTheLastImage = selectedImage === user.images.length - 1
  const isTheFirstImage = selectedImage === 0
  const onlyOne = user.images.length === 1
  const currentImage = user.images[selectedImage]

  return (
    <Flex
      flexDir="column"
      gridGap=".5rem"
      alignItems="flex-start"
      justifyContent="center"
      alignSelf="center"
      w="100%"
    >
      <Flex
        alignSelf="center"
        flexDir="column"
        w={["100%", "627px"]} // Figma's width value, the closes charka's is xl
        maxW={["90vw", "80vw"]}
        gridGap=".5rem"
      >
        <Flex flexDir={["column", "row"]} gridGap="1rem">
          <Flex
            h={["38rem", "2xl"]}
            maxH="80vh"
            w="100%"
            flexDir="column"
            border="1px solid"
            borderColor={
              user.status === "CONNECTED"
                ? "#75FF26"
                : user.status === "AWAY"
                ? "#E5D85F"
                : "transparent"
            }
            borderRadius="xl"
          >
            <Grid gridTemplateColumns="1fr auto" w="100%">
              <Flex p="1rem" backgroundColor="#19141C" borderTopLeftRadius="xl">
                <Flex flexDir="column">
                  <Flex flexDir="row" gridGap="0.5rem" alignItems="center">
                    <Text fontWeight="bold" fontSize={["xl", "3xl"]}>
                      {user.name}
                    </Text>
                    {user.role === "CREATOR" && <Check w="1.2rem" h="1.2rem" />}
                  </Flex>
                  <Text fontSize="md">@{user.username}</Text>
                </Flex>
              </Flex>
              <Flex backgroundColor="#211D23" p="1rem" borderTopRightRadius="xl" flexDir="column">
                <Flex alignItems="center" justifyContent="center" w="100%" flexDir="row">
                  <Gem boxSize={6} mr=".3rem" />
                  <Text fontSize={["xl", "3xl"]} mr=".3rem">
                    {user.price}
                  </Text>
                  <Text fontSize="sm" pt={[".25rem", ".5rem"]}>
                    / sec
                  </Text>
                </Flex>
                <Text textAlign="center" opacity=".75" fontSize="sm">
                  {user.price === 0 ? "Free" : `$ ${gemsToDollar(user.price)} per second`}
                </Text>
              </Flex>
            </Grid>
            <Flex h="100%" w="100%" bg="grey" position="relative" borderBottomRadius="xl">
              <Flex w="100%" position="absolute" bottom={0} left={0} zIndex={10} direction="column">
                <UserStatusBadge
                  transform="translateY(50%)"
                  position="relative"
                  zIndex={11}
                  alignSelf="center"
                  justifySelf="center"
                  status={user.status}
                  lastSeenAt={user.lastSeenAt}
                />
                <Flex
                  backgroundColor="rgba(10, 7, 13, 0.5)"
                  backdropFilter="blur(20px)"
                  py="2rem"
                  pb="1rem"
                  alignItems="center"
                  justifyContent="center"
                  flexDir="column"
                  gridGap=".75rem"
                  borderBottomRadius="xl"
                  px="1rem"
                >
                  {!isCurrentUser && duration === 0 && !!currentUser ? (
                    <Button
                      w={["2xs", "xs"]}
                      size="lg"
                      color="black"
                      backgroundColor="white"
                      leftIcon={<Gem boxSize={7} />}
                      onClick={() => {
                        dispatch({
                          type: "SET_PAGE",
                          payload: {
                            page: "WALLET",
                            subPage: "DEPOSIT",
                            amount: ((user.price ?? 0) - (currentUser?.gems ?? 0)) / DOLLAR_TO_GEMS,
                          },
                        })
                      }}
                    >
                      Buy more gems
                    </Button>
                  ) : (
                    <Link
                      href={
                        !currentUser
                          ? Routes.SignupPage()
                          : currentUser?.username === user.username
                          ? Routes.Home()
                          : Routes.RoomPage({
                              id: username,
                            })
                      }
                    >
                      <a>
                        <Button
                          w={["2xs", "xs"]}
                          size="lg"
                          color="black"
                          backgroundColor="white"
                          leftIcon={<Icon as={Seconds} color="black" boxSize={7} />}
                          disabled={
                            (isCurrentUser && duration === 0) ||
                            (isCurrentUser && user.status !== "CONNECTED")
                          }
                        >
                          {user.status !== "CONNECTED" ? "User is offline" : "Video Chat"}
                        </Button>
                      </a>
                    </Link>
                  )}
                  <Text textAlign="center" fontWeight="medium">
                    {(() => {
                      if (!currentUser) return null

                      if (user.status !== "CONNECTED" && isCurrentUser) {
                        return <>You must be online to receive calls</>
                      }

                      if (isCurrentUser) {
                        return null
                      }

                      if (duration === 0) {
                        return (
                          <>
                            You need <b>{(user.price ?? 0) - (currentUser?.gems ?? 0)}</b> more gems
                            to have a call with <b>{user.name}</b>.
                          </>
                        )
                      }

                      return <>You have up to {humanize(duration, { round: true, largest: 2 })}</>
                    })()}
                  </Text>
                </Flex>
              </Flex>

              {user?.images?.[0] && (
                <Box
                  borderBottomRadius="xl"
                  overflow="hidden"
                  position="relative"
                  w="100%"
                  h="100%"
                >
                  <Flex
                    mx="auto"
                    px="11px"
                    py="7px"
                    bg="linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%)"
                    w="100%"
                    position="absolute"
                    justify="space-between"
                    zIndex={10}
                  >
                    {!onlyOne &&
                      user.images.map((tab, idx) => (
                        <Box
                          key={tab.id}
                          w="100%"
                          h="7px"
                          borderRadius="100px"
                          top={0}
                          left={0}
                          zIndex={1}
                          onClick={() => setSelectedImage(idx)}
                          bg={idx === selectedImage ? "#0A070C" : "rgba(10, 7, 12, 0.3)"}
                          mr={idx === user.images.length - 1 ? 0 : "11px"}
                          cursor="pointer"
                        />
                      ))}
                  </Flex>
                  {!isTheFirstImage && !onlyOne && (
                    <>
                      <CarouselArrow
                        onClick={prevImage}
                        rotate="180deg"
                        right="0px"
                        left="20px"
                        transform="rotate(180deg)"
                      />
                      <Box
                        w="20%"
                        h="100%"
                        position="absolute"
                        left="0"
                        top="0"
                        bg="transparent"
                        onClick={prevImage}
                        cursor="pointer"
                      />
                    </>
                  )}
                  {!isTheLastImage && !onlyOne && (
                    <>
                      <CarouselArrow onClick={nextImage} />
                      <Box
                        w="20%"
                        h="100%"
                        position="absolute"
                        right="0"
                        top="0"
                        bg="transparent"
                        onClick={nextImage}
                        cursor="pointer"
                      />
                    </>
                  )}
                  <Box
                    w="100%"
                    h="100%"
                    backgroundImage={`url(${currentImage?.url?.replace("_400", "_800")})`}
                    backgroundPosition="center"
                    backgroundSize="cover"
                    backgroundRepeat="no-repeat"
                  />
                </Box>
              )}
            </Flex>
          </Flex>
          <Flex
            flexDir={["row", "column"]}
            gridGap="3rem"
            justifyContent={["center", "flex-start"]}
          >
            {!isCurrentUser && (
              <Star
                size="2rem"
                fill={isUserFavorite ? "white" : undefined}
                cursor="pointer"
                onClick={() => {
                  if (!currentUser) {
                    return router.push(Routes.LoginPage())
                  }

                  if (isUserFavorite) {
                    removeFavoriteMutation({ username })
                  } else {
                    addFavoriteMutation({ username })
                  }
                }}
              />
            )}
            <Share
              size="2rem"
              cursor="pointer"
              onClick={() => {
                const url = location.protocol + "//" + location.host + location.pathname
                const text = `Check out ${user.name || user.username} on Seconds!`

                if (navigator?.canShare?.({ url })) {
                  navigator.share({
                    title: "Seconds",
                    text,
                    url,
                  })
                } else if (!!navigator?.clipboard) {
                  navigator.clipboard.writeText(url)
                  if (!toast.isActive("clipboard")) {
                    toast({
                      id: "clipboard",
                      title: "Copied to clipboard",
                    })
                  }
                }
              }}
            />
            {!isCurrentUser && (
              <Menu autoSelect={false} flip isLazy closeOnSelect={false}>
                <MenuButton as={MoreVertical} size="2rem" cursor="pointer" />
                <MenuList>
                  <MenuItem
                    isDisabled={reportUserResult.isSuccess}
                    onClick={async () => {
                      if (!currentUser) {
                        return router.push(Routes.LoginPage())
                      }

                      await reportUserMutation({ userId: user.id })
                    }}
                  >
                    {reportUserResult.isSuccess ? "✓ Reported" : "Report"}
                  </MenuItem>
                </MenuList>
              </Menu>
            )}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  )
}

interface UnavailableModalProps {
  user: Awaited<ReturnType<typeof getUser>>
}

const UnavailableModal: FC<UnavailableModalProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size={["xs", "xl"]} isCentered>
      <ModalOverlay backdropFilter="blur(5px)" />
      <ModalContent
        backgroundColor="rgba(10, 7, 13, 0.5)"
        backdropFilter="blur(20px)"
        borderRadius="xl"
        pb="2rem"
        gridGap="2rem"
      >
        <ModalHeader>
          <ModalCloseButton />
        </ModalHeader>
        <ModalBody>
          <Flex
            flexDir="column"
            gridGap="2rem"
            justifyContent="center"
            alignItems="center"
            textAlign="center"
          >
            <Text fontSize="xl" fontWeight="semibold">
              Sorry, {user.name} is currently busy.
            </Text>
            <Text fontSize="lg" fontWeight="bold">
              Try again later
            </Text>
            <Button
              bgColor="white"
              color="black"
              borderRadius="full"
              w={["100%", "sm"]}
              onClick={() => setIsOpen(false)}
            >
              Close
            </Button>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

const User: BlitzPage<{ user: Awaited<ReturnType<typeof getUser>>; unavailable?: boolean }> = ({
  user,
  unavailable,
}) => (
  <>
    <Head>
      <title>{user.name ? `${user.name} (@${user.username})` : `@${user.username}`}</title>
      <meta
        property="og:title"
        content={user.name ? `${user.name} (@${user.username})` : `@${user.username}`}
      />
      <meta
        property="og:description"
        content="Meet your favorite creators with pay-per-second Video Chat."
      />
      <meta content="profile" property="og:type" />
      <meta property="og:url" content={`https://seconds.app/${user.username}`} />
      {user.images[0] && <meta property="og:image" content={user.images[0].url} />}
    </Head>
    {unavailable && <UnavailableModal user={user} />}
    <Flex
      flexDir="column"
      alignItems="center"
      w="100%"
      justifyContent="center"
      mt={["-1.5rem", "0"]}
    >
      <UserInfo user={user} />
    </Flex>
  </>
)

export const getServerSideProps: GetServerSideProps = gSSP(async ({ params, ctx, query }) => {
  const username = params?.username as string
  const user = await db.user.findFirst({
    where: {
      username,
      role: "CREATOR",
      deletedAt: null,
    },
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      links: true,
      price: true,
      status: true,
      lastSeenAt: true,
      images: {
        orderBy: {
          order: "asc",
        },
      },
    },
  })

  if (!user) {
    return {
      notFound: true,
      props: {} as { [key: string]: any },
    }
  }

  const queryKey = getQueryKey(getCurrentUser, null)
  await getQueryClient().prefetchQuery(
    queryKey,
    async () => await invokeWithCtx(getCurrentUser, null, ctx)
  )

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      user,
      unavailable: query.unavailable === "true",
    },
  }
})

User.authenticate = false
User.getLayout = (page) => (
  <AnimatedBackground>
    <Layout title="Seconds">{page}</Layout>
  </AnimatedBackground>
)

export default User
