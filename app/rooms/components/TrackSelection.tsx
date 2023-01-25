import Link from "next/link"
import { Routes, useParam } from "@blitzjs/next"
import Video, { LocalAudioTrack, LocalVideoTrack } from "twilio-video"
import { ReactNode, useEffect, useMemo } from "react"
import { Circle, Flex, Grid, Icon, Select, Text } from "@chakra-ui/react"
import { Camera, ChevronLeft, Mic } from "react-feather"

import useVideoContext from "app/core/hooks/useVideoContext"
import getUser from "app/users/queries/getUser"
import Gem from "app/core/icons/Gem"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import useDeviceInfo from "app/core/hooks/useDeviceInfo"
import LocalVideoPreview from "./VideoPreview"
import ChromeCamera from "app/core/icons/ChromeCamera"
import { gemsToDollar } from "helpers/price"

export const VideoSelector = () => {
  const { localTracks, setVideoTrack } = useVideoContext()
  const { videoInputDevices, hasAudioInputDevices } = useDeviceInfo()

  const videoTrack = localTracks.find((track) => track.kind === "video") as LocalVideoTrack

  return (
    <Select
      icon={
        <Circle
          bgColor="rgba(255, 255, 255, .1)"
          borderRadius="full"
          size=".5rem"
          alignItems="center"
          justifyContent="center"
        >
          <Camera size="1.2rem" />
        </Circle>
      }
      iconSize="1.8rem"
      fontWeight="medium"
      color="rgba(255, 255, 255, .75)"
      bgColor="rgba(10, 7, 12, .5)"
      borderRadius="10px"
      border="none"
      disabled={!hasAudioInputDevices}
      placeholder={!videoTrack?.name ? "No video input devices found" : undefined}
      value={videoTrack?.mediaStreamTrack.getSettings().deviceId}
      onChange={async ({ target: { value } }) => {
        const track = videoInputDevices.find(({ deviceId }) => deviceId === value)
        if (track) {
          videoTrack?.stop()
          const newVideoTrack = await Video.createLocalVideoTrack({
            name: track.label,
            deviceId: track.deviceId,
          })

          setVideoTrack(newVideoTrack)
        }
      }}
    >
      {videoInputDevices
        ?.sort((a, b) => {
          if (a.deviceId === videoTrack?.mediaStreamTrack.getSettings().deviceId) {
            return -1
          } else if (b.deviceId === videoTrack?.mediaStreamTrack.getSettings().deviceId) {
            return 1
          }

          return 0
        })
        ?.map(({ deviceId, label }) => (
          <option key={deviceId} value={deviceId}>
            {label}
          </option>
        ))}
    </Select>
  )
}

export const AudioSelector = () => {
  const { localTracks, setAudioTrack } = useVideoContext()
  const { audioInputDevices, hasAudioInputDevices } = useDeviceInfo()

  const audioTrack = localTracks.find((track) => track.kind === "audio") as LocalAudioTrack

  return (
    <Select
      fontWeight="medium"
      color="rgba(255, 255, 255, .75)"
      bgColor="rgba(10, 7, 12, .5)"
      borderRadius="10px"
      border="none"
      iconSize="1.8rem"
      value={audioTrack?.mediaStreamTrack.getSettings().deviceId}
      disabled={!hasAudioInputDevices}
      icon={
        <Circle
          bgColor="rgba(255, 255, 255, .1)"
          borderRadius="full"
          size=".5rem"
          alignItems="center"
          justifyContent="center"
        >
          <Icon as={Mic} boxSize={5} />
        </Circle>
      }
      placeholder={!audioTrack?.name ? "No audio input devices found" : undefined}
      onChange={async ({ target: { value } }) => {
        const track = audioInputDevices.find(({ deviceId }) => deviceId === value)
        if (track) {
          audioTrack?.stop()
          const newAudioTrack = await Video.createLocalAudioTrack({
            name: track.label,
            deviceId: track.deviceId,
          })

          setAudioTrack(newAudioTrack)
        }
      }}
    >
      {audioInputDevices
        ?.sort((a, b) => {
          if (a.deviceId === audioTrack?.mediaStreamTrack.getSettings().deviceId) {
            return -1
          } else if (b.deviceId === audioTrack?.mediaStreamTrack.getSettings().deviceId) {
            return 1
          }

          return 0
        })
        ?.map(({ deviceId, label }) => (
          <option key={deviceId} value={deviceId}>
            {label}
          </option>
        ))}
    </Select>
  )
}

export interface TrackSelectionProps {
  informationContainer?: ReactNode
  bottomContainer?: ReactNode
  cameraOverlay?: ReactNode
  user?: Awaited<ReturnType<typeof getUser>>
  currentUser: ReturnType<typeof useCurrentUser>
  isReady: boolean
}

const TrackSelection = ({
  informationContainer,
  bottomContainer,
  cameraOverlay,
  user,
  isReady,
}: TrackSelectionProps): JSX.Element => {
  const roomId = useParam("id", "string")!
  const { isAcquiringLocalTracks, localTracks, getAudioAndVideoTracks, localTracksError } =
    useVideoContext()

  const [videoTrack, audioTrack] = useMemo(
    () => [
      localTracks.find((track) => track.kind === "video") as LocalVideoTrack,
      localTracks.find((track) => track.kind === "audio") as LocalAudioTrack,
    ],
    [localTracks]
  )

  useEffect(() => {
    void getAudioAndVideoTracks()
  }, [getAudioAndVideoTracks])

  if (!user) {
    return <>Not found</>
  }

  if (!isAcquiringLocalTracks && localTracksError && !videoTrack && !audioTrack) {
    return (
      <Flex justifyContent="center" alignItems="center" textAlign="center" w="100%" pt="4rem">
        <Flex flexDir="column" textAlign="center" gridGap="1rem" w="md">
          <Text fontSize="2xl" fontWeight="semibold">
            Camera and microphone are disabled
          </Text>
          <Text>
            Seconds needs to access your camera and microphone. Click on the icon of the disabled
            camera <ChromeCamera /> in your browser navigation bar and refresh this page.
          </Text>
        </Flex>
      </Flex>
    )
  }

  return (
    <Flex alignItems="center" w="100%" h="100%" justifyContent="center">
      <Flex flexDir={["column", "row"]} gridGap={["1rem", "3rem"]}>
        <Link href={isReady ? "#" : Routes.User({ username: roomId })}>
          <ChevronLeft
            cursor={isReady ? "default" : "pointer"}
            opacity={isReady ? ".2" : undefined}
            size="2rem"
          />
        </Link>
        <Flex
          flexDir="column"
          borderRadius="xl"
          backgroundColor="rgba(255, 255, 255, 0.02)"
          alignItems="center"
          border="1px solid"
          minW={["100%", "lg"]}
          minH={["38rem", "2xl"]}
          maxW={["90vw", "30vw"]}
          //maxH="75vh"
          borderColor={
            user.status === "CONNECTED" ? "#75FF26" : user.status === "AWAY" ? "#E5D85F" : "white"
          }
          w={["100%", "container.sm"]}
        >
          <Grid gridTemplateColumns="1fr auto" w="100%">
            <Flex px="1rem" py=".5rem" backgroundColor="#19141C" borderTopLeftRadius="xl">
              <Flex flexDir="column" justifyContent="center">
                <Text fontWeight="bold" fontSize={["xl", "3xl"]}>
                  {user.name}
                </Text>
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
                $ {gemsToDollar(user.price)} per second
              </Text>
            </Flex>
          </Grid>
          <Flex w="100%" py=".5rem" px=".5rem" flexDir="column" gridGap="1rem">
            {informationContainer}
            <Flex
              flexDir={["column", "row"]}
              gridGap={[".5rem", "1rem"]}
              w="100%"
              justifyContent="center"
            >
              <VideoSelector />
              <AudioSelector />
            </Flex>
            <Flex
              w="100%"
              bgColor="rgba(255, 255, 255, 0.05)"
              borderRadius="10px"
              position="relative"
            >
              {isReady && cameraOverlay && (
                <Flex opacity=".9" bg="black" w="full" h="full" zIndex="1000" position="absolute">
                  {cameraOverlay}
                </Flex>
              )}
              <LocalVideoPreview
                zIndex="999"
                borderRadius="md"
                position={["fixed", "relative"]}
                right={["2rem", "inherit"]}
                bottom={["2rem", "inherit"]}
                w={["6rem", "inherit"]}
              />
            </Flex>
            {bottomContainer}
          </Flex>
        </Flex>
        <div />
      </Flex>
    </Flex>
  )
}

export default TrackSelection
