import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/router"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { BlitzPage, Routes } from "@blitzjs/next"
import {
  Box,
  Flex,
  Heading,
  Input,
  InputGroup,
  Stack,
  Text,
  Grid,
  Button,
  Circle,
  useClipboard,
  Link as StyledLink,
  IconButton,
  InputLeftAddon,
  InputRightElement,
} from "@chakra-ui/react"
import { motion } from "framer-motion"
import debounce from "lodash.debounce"
import { FC, Suspense, useEffect, useMemo, useRef, useState } from "react"
import { CheckIcon, LinkIcon, SearchIcon } from "@chakra-ui/icons"
import { X } from "react-feather"

import { gSSP } from "app/blitz-server"
import Gem from "app/core/icons/Gem"
import Layout from "app/core/layouts/Layout"
import getDefaultServerSideProps from "app/core/helpers/getDefaultServerSideProps"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import getFavorites from "app/users/queries/getFavorites"
import getUser from "app/users/queries/getUser"
import useBlurHash from "app/core/hooks/useBlurHash"
import LocalVideoPreview from "app/rooms/components/VideoPreview"
import useVideoContext from "app/core/hooks/useVideoContext"
import { AudioSelector, VideoSelector } from "app/rooms/components/TrackSelection"
import getQueueLength from "app/users/queries/getQueueLength"
import ChromeCamera from "app/core/icons/ChromeCamera"
import Plus from "app/core/icons/Plus"
import useMenu from "app/core/hooks/useMenu"
import useCreatorRoom from "app/core/hooks/useCreatorRoom"
import ProfilePicture from "app/users/components/ProfilePicture"
import Second from "app/core/icons/Second"
import refuse from "app/rooms/mutations/refuse"
import RoomView from "app/rooms/components/RoomView"
import VideoControls from "app/rooms/components/VideoControls"
import AnimatedBackground from "app/core/components/AnimatedBackground"

interface CreatorRoomProps {
  user: NonNullable<ReturnType<typeof useCurrentUser>>
}

const CreatorRoom: FC<CreatorRoomProps> = ({ user }) => {
  const { elapsedTime, isConnected, participant } = useVideoContext()
  const { users, isAcceptParticipantLoading, onAcceptParticipant } = useCreatorRoom()
  const [refuseMutation, { isLoading: refuseParticipantIsLoading }] = useMutation(refuse)

  const currentParticipant = users[0]

  return (
    <Suspense fallback="Loading...">
      {currentParticipant && (
        <Flex flexDir="row" alignItems="stretch" gridGap="1rem" h="10rem">
          <ProfilePicture
            h="100%"
            w="auto"
            name={currentParticipant.name || currentParticipant.username}
            url={currentParticipant.images[0]?.url}
            imageHash={currentParticipant.images[0]?.hash}
          />
          <Flex
            w="full"
            py="1.5rem"
            flexDir="column"
            alignItems="center"
            justifyContent="space-between"
            bgColor="rgba(10, 7, 12, 0.5)"
            borderRadius="md"
          >
            <Text opacity=".75" fontWeight="bold" fontSize="2xl">
              {currentParticipant.name || currentParticipant.username}
            </Text>
            <Flex flexDir="row" gridGap="2rem">
              <IconButton
                aria-label="Accept call"
                w="3.5rem"
                h="3.5rem"
                bg="#75FF26"
                icon={<Second width="2.5rem" height="2.5rem" />}
                borderRadius="full"
                onClick={() => onAcceptParticipant(currentParticipant.username)}
                isLoading={isAcceptParticipantLoading}
              />
              <IconButton
                aria-label="Refuse call"
                w="3.5rem"
                h="3.5rem"
                bg="#EB5545"
                icon={<X width="2.5rem" height="2.5rem" />}
                borderRadius="full"
                onClick={() => refuseMutation({ participant: currentParticipant.username })}
                isLoading={refuseParticipantIsLoading}
              />
            </Flex>
          </Flex>
        </Flex>
      )}
      {isConnected && participant && (
        <>
          <VideoControls
            elapsedTime={elapsedTime}
            participant={participant}
            currentUser={user}
            onAcceptParticipant={onAcceptParticipant}
          />
          <RoomView />
        </>
      )}
    </Suspense>
  )
}

interface CreatorPreviewProps {
  user: NonNullable<ReturnType<typeof useCurrentUser>>
}

const CreatorPreview: FC<CreatorPreviewProps> = ({ user }) => {
  const videoRef = useRef<HTMLDivElement>(null)
  const { onCopy, hasCopied } = useClipboard(`${window?.location?.origin}/${user.username}`)
  const [acceptIncomingCall, setAcceptIncomingCall] = useState(false)
  const { getAudioAndVideoTracks, localTracksError } = useVideoContext()
  const [isDesktop, setIsDesktop] = useState(true)
  const [mobileVideoPreviewSize, setMobileVideoPreviewSize] = useState<"13rem" | "100%">("13rem")
  const [queueLength] = useQuery(
    getQueueLength,
    {
      room: user.username,
    },
    {
      refetchInterval: 2000,
      suspense: false,
    }
  )

  useEffect(() => {
    getAudioAndVideoTracks()
  }, [getAudioAndVideoTracks])

  useEffect(() => {
    if (window.innerWidth > 768) {
      setIsDesktop(true)
    } else {
      setIsDesktop(false)

      const width = videoRef.current?.offsetWidth ?? 0
      const height = videoRef.current?.offsetHeight ?? 0

      if (width > height) {
        setMobileVideoPreviewSize("100%")
      } else if (width < height) {
        setMobileVideoPreviewSize("13rem")
      }
    }
  }, [setIsDesktop, setMobileVideoPreviewSize])

  return (
    <>
      <Flex
        bgColor="#201727"
        py="2rem"
        px={["1rem", "4rem"]}
        borderRadius="md"
        justifyContent="center"
        flexDir="column"
        gridGap="2rem"
        w={["90vw", "3xl"]}
        maxW="90vw"
      >
        {queueLength !== undefined &&
          queueLength > 0 &&
          (acceptIncomingCall ? (
            <Flex
              flexDir="row"
              alignItems="center"
              gridGap={["1rem", "2rem"]}
              justifyContent="center"
            >
              <Text opacity=".75" fontWeight="medium" fontSize="1.2rem">
                You have an incoming video call
              </Text>
              <Button
                bgColor="#75FF26"
                color="black"
                w="8rem"
                onClick={() => setAcceptIncomingCall(!acceptIncomingCall)}
              >
                {acceptIncomingCall ? "Hide" : "Preview"}
              </Button>
            </Flex>
          ) : (
            <CreatorRoom user={user} />
          ))}
        {!localTracksError ? (
          <>
            <Flex flexDir={["column", "row"]} alignItems="center" gridGap={[".5rem", "1rem"]}>
              <AudioSelector />
              <VideoSelector />
            </Flex>
            {isDesktop && (
              <LocalVideoPreview
                borderRadius="md"
                position={["fixed", "relative"]}
                right={["2rem", "inherit"]}
                bottom={["2rem", "inherit"]}
                w={["6rem", "100%"]}
              />
            )}
            <Flex
              flexDir={["column", "row"]}
              alignItems="center"
              justifyContent="space-between"
              w="100%"
              gridGap="1rem"
            >
              <Flex flexDir="row" alignItems="center">
                <Text fontSize="md" opacity=".75" fontWeight="medium">
                  Your call queue
                </Text>
                <Circle
                  borderRadius="full"
                  ml=".25rem"
                  size="1.5rem"
                  bg="rgba(255, 255, 255, 0.1)"
                  fontWeight="medium"
                >
                  {queueLength || 0}
                </Circle>
              </Flex>
              <Flex
                flexDir="row"
                alignItems="center"
                onClick={onCopy}
                cursor="pointer"
                gridGap=".5rem"
              >
                <Text fontWeight="medium" opacity=".75">
                  seconds.app/{user.username}
                </Text>
                {hasCopied ? <CheckIcon /> : <LinkIcon />}
              </Flex>
            </Flex>
          </>
        ) : (
          <Flex flexDir="column" textAlign="center" gridGap="1rem">
            <Text fontSize="xl" fontWeight="semibold">
              Camera and microphone are disabled
            </Text>
            <Text>
              Seconds needs to access your camera and microphone. Click on the icon of the disabled
              camera <ChromeCamera /> in your browser navigation bar.
            </Text>
          </Flex>
        )}
      </Flex>
      {!isDesktop && (
        <Flex alignItems="center" justifyContent="center" w="100%" ref={videoRef}>
          <LocalVideoPreview mt="1rem" borderRadius="md" w={mobileVideoPreviewSize} />
        </Flex>
      )}
    </>
  )
}

interface CreatorCardProps {
  user: Pick<
    NonNullable<Awaited<ReturnType<typeof getUser>>>,
    "name" | "username" | "price" | "status" | "images"
  >
}

const CreatorCard = ({ user: { name, username, images, price, status } }: CreatorCardProps) => {
  const blurHash = useBlurHash(images[0]?.hash)

  return (
    <motion.div layout>
      <Link href={Routes.User({ username })}>
        <a>
          <Box
            borderRadius="3xl"
            overflow="hidden"
            px="1rem"
            py="1rem"
            h="24rem"
            w="100%"
            position="relative"
            backgroundColor={!images[0] ? "#211D23" : undefined}
            border="2px solid transparent"
            borderColor={
              status === "CONNECTED" ? "#75FF26" : status === "AWAY" ? "#E5D85F" : undefined
            }
          >
            {images[0] && (
              <>
                <Image
                  alt="thumbnail"
                  objectFit="cover"
                  objectPosition="center center"
                  src={images[0].url}
                  layout="fill"
                  {...(blurHash && {
                    blurDataURL: blurHash,
                    placeholder: "blur",
                  })}
                />
                <Flex
                  position="absolute"
                  width="100%"
                  height="100%"
                  boxShadow="inset 0 0 100px rgba(0, 0, 0, 0.5)"
                  top={0}
                  left={0}
                />
              </>
            )}
            <Flex flexDir="row" justifyContent="space-between">
              <Flex flexDir="column" zIndex={1}>
                <Text fontWeight="bold" fontSize="xl" lineHeight="1.5rem" m={0}>
                  {name}
                </Text>
                <Text fontWeight="bold">@{username}</Text>
              </Flex>
            </Flex>
            <Flex
              position="absolute"
              bottom={0}
              right={0}
              backdropFilter="blur(20px)"
              bg="rgba(10, 7, 13, 0.5)"
              w="100%"
              justifyContent="center"
              borderBottomRadius="3xl"
            >
              <Flex px="1rem" py=".5rem" alignItems="flex-end" gridGap=".2rem">
                <Gem boxSize={6} />
                <Text>
                  <Text fontWeight="bold" mr={1} as="b">
                    {price}
                  </Text>
                  /sec
                </Text>
              </Flex>
            </Flex>
          </Box>
        </a>
      </Link>
    </motion.div>
  )
}

const Home: BlitzPage = () => {
  const router = useRouter()
  const { dispatch } = useMenu()
  const currentUser = useCurrentUser()
  const [search, setSearch] = useState("")
  const [favorites = []] = useQuery(getFavorites, null, {
    enabled: !!currentUser && currentUser.role !== "CREATOR",
    suspense: false,
  })
  const [creator, { isLoading, isSuccess }] = useQuery(
    getUser,
    {
      username: search,
      isCreator: true,
    },
    {
      suspense: false,
      enabled: !!search,
    }
  )

  const debouncedSetSearch = useMemo(() => debounce(setSearch, 300), [setSearch])

  return (
    <Flex w="100%" h="100%" justifyContent="center" pt={["0", "4rem"]}>
      <Flex
        flexDir="column"
        gridGap="1.5rem"
        alignItems="center"
        mx=".5rem"
        justifyItems="center"
        h="100%"
      >
        <Stack
          spacing={4}
          alignItems="center"
          h="100%"
          justifyItems="center"
          w={["90vw", "3xl"]}
          maxW="90vw"
        >
          <InputGroup bg="white" borderRadius="xl" w="100%" size={["md", "lg"]}>
            <InputLeftAddon borderLeftRadius="xl" borderRightRadius="0 !important" bg="#201727">
              seconds.app/
            </InputLeftAddon>
            <Flex w="100%" minH="100%" overflow="hidden">
              <Input
                bg="white"
                autoFocus
                borderRadius="xl"
                borderLeftRadius="0 !important"
                autoComplete="off"
                autoCorrect="off"
                placeholder="Creator's username"
                color="black"
                type="text"
                _placeholder={{ color: "gray.600" }}
                w="100%"
                h="100% !important"
                onChange={(evt) => debouncedSetSearch(evt.target.value)}
                autoCapitalize="off"
                spellCheck="false"
                onKeyDown={(evt) => {
                  if (evt.key === "Enter") {
                    if (!isLoading && search === creator?.username) {
                      router.push(Routes.User({ username: creator.username }))
                    }
                  }
                }}
              />
            </Flex>
            <InputRightElement h="100%" px=".75rem">
              <motion.div
                animate={{
                  opacity: isSuccess ? 1 : 0.25,
                  color: isSuccess ? "#B026FF" : "#000",
                  cursor: isSuccess ? "pointer" : "default",
                }}
                transition={{
                  stiffness: 260,
                  damping: 20,
                  duration: 0.25,
                  ease: "easeInOut",
                  repeat: 0,
                  repeatType: "reverse",
                  repeatDelay: 0.1,
                }}
                onClick={() => {
                  if (!isLoading && creator?.username === search) {
                    router.push(Routes.User({ username: creator.username }))
                  }
                }}
              >
                <SearchIcon />
              </motion.div>
            </InputRightElement>
          </InputGroup>
          {!search && currentUser?.role !== "CREATOR" && (
            <Flex
              w="100%"
              flexDir="column"
              bgColor="#201727"
              py={["2rem", "3rem"]}
              px={["1rem", "2rem"]}
              borderRadius="xl"
              gridGap=".5rem"
              textAlign="center"
            >
              <Heading>Every second counts…</Heading>
              <Text color="gray" fontSize="xl" lineHeight="7">
                meet your favorite creators with <br />
                pay-per-second video chat
              </Text>
            </Flex>
          )}
          {currentUser?.role === "CREATOR" && (
            <Flex display={search && "none"} w="100%">
              <CreatorPreview user={currentUser} />
            </Flex>
          )}
          {!search && currentUser?.role === "USER" && currentUser.gems === 0 && (
            <Flex
              w="100%"
              flexDir="column"
              gridGap="2rem"
              border="10px solid #201727"
              p={["1rem", "4rem"]}
              borderRadius="10px"
              backdropFilter="blur(20px)"
              alignItems="center"
              textAlign="center"
            >
              <Text opacity=".75" fontWeight="medium" fontSize={["xl", "2xl"]}>
                Add gems to spend per second.
              </Text>
              <Button
                leftIcon={<Plus />}
                bg="rgba(196, 196, 196, .1)"
                fontWeight="medium"
                w="80%"
                onClick={() =>
                  dispatch({
                    type: "SET_IS_OPEN",
                    payload: {
                      isOpen: true,
                      page: "WALLET",
                      subPage: "DEPOSIT",
                    },
                  })
                }
              >
                Buy Gems
              </Button>
            </Flex>
          )}
        </Stack>
        <Flex w="100%" justifyContent="center">
          <Flex flexDir="column" gridGap="2rem" w="100%">
            {!isLoading && !creator && (
              <Text color="white" fontSize="2xl" textAlign="center">
                No creators found. Try another search.
              </Text>
            )}
            <Grid
              position="relative"
              gridRowGap="2rem"
              gridColumnGap={["1rem", "2rem"]}
              gridTemplateColumns={[
                "repeat(auto-fit, minmax(85%, 1fr))",
                "repeat(2, minmax(16rem, 1fr))",
                "repeat(2, minmax(16rem, 1fr))",
                "repeat(3, minmax(16rem, 1fr))",
                "repeat(4, minmax(16rem, 1fr))",
                "repeat(5, minmax(16rem, 1fr))",
                "repeat(6, minmax(16rem, 1fr))",
                "repeat(7, minmax(14rem, 1fr))",
              ]}
            >
              {(creator ? [creator] : currentUser?.role !== "CREATOR" ? favorites : [])
                ?.sort((a, b) => a.status.localeCompare(b.status))
                .map((user) => (
                  <CreatorCard key={user.id} user={user} />
                ))}
            </Grid>
          </Flex>
        </Flex>
        {!currentUser && (
          <Flex left="0" bottom="0" position="fixed" p="1rem" opacity=".5" gridGap="1rem">
            <StyledLink href="/terms">Terms</StyledLink>
            <StyledLink href="/privacy">Privacy</StyledLink>
          </Flex>
        )}
      </Flex>
    </Flex>
  )
}

Home.getLayout = (page) => (
  <AnimatedBackground>
    <Layout title="Seconds">{page}</Layout>
  </AnimatedBackground>
)

export const getServerSideProps = gSSP(getDefaultServerSideProps)

export default Home
