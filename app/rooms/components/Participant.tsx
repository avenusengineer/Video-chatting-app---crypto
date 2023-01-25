import Video from "twilio-video"
import { useEffect, useRef, useState } from "react"
import { Flex } from "@chakra-ui/react"

export interface ParticipantProps {
  participant: Video.Participant
}

export const Participant = ({ participant }: ParticipantProps) => {
  const [videoTracks, setVideoTracks] = useState<Video.VideoTrack[]>([])
  const [audioTracks, setAudioTracks] = useState<Video.AudioTrack[]>([])

  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const trackSubscribed = (track) => {
      if (track.kind === "video") {
        setVideoTracks((videoTracks) => [...videoTracks, track])
      } else {
        setAudioTracks((audioTracks) => [...audioTracks, track])
      }
    }

    const trackUnsubscribed = (track) => {
      if (track.kind === "video") {
        setVideoTracks((videoTracks) => videoTracks.filter((v) => v !== track))
      } else {
        setAudioTracks((audioTracks) => audioTracks.filter((a) => a !== track))
      }
    }

    const trackpubsToTracks = (trackMap: Video.Participant["tracks"]) =>
      Array.from(trackMap.values())
        .map((publication) => (publication as any).track)
        .filter((track) => track !== null)

    if (participant) {
      setVideoTracks(trackpubsToTracks(participant.videoTracks) as Video.VideoTrack[])
      setAudioTracks(trackpubsToTracks(participant.audioTracks) as Video.AudioTrack[])

      participant.on("trackSubscribed", trackSubscribed)
      participant.on("trackUnsubscribed", trackUnsubscribed)

      return () => {
        setVideoTracks([])
        setAudioTracks([])
        participant.removeAllListeners()
      }
    }
  }, [participant])

  useEffect(() => {
    const videoTrack = videoTracks[0]
    if (videoTrack && videoRef.current) {
      videoTrack.attach(videoRef.current)
      return () => {
        videoTrack.detach().forEach((ref) => {
          ref.remove()
          ref.srcObject = null
        })
      }
    }
  }, [videoTracks, videoRef])

  useEffect(() => {
    const audioTrack = audioTracks[0]
    if (audioTrack && audioRef.current) {
      audioTrack.attach(audioRef.current)
      return () => {
        audioTrack.detach().forEach((ref) => {
          ref.remove()
          ref.srcObject = null
        })
      }
    }
  }, [audioTracks, audioRef])

  return (
    <Flex
      zIndex={1}
      bg="linear-gradient(151.05deg, #150F1A -1.98%, #0A070C 42.25%)"
      flexDir="column"
      position="absolute"
      left={0}
      top={0}
      height="100vh"
      w="100vw"
      overflow="hidden"
      justifyContent="center"
    >
      {!(videoTracks?.[0]?.isStarted && videoTracks?.[0]?.isEnabled) && (
        <Flex
          left="0"
          top="0"
          position="absolute"
          w="100vw"
          h="100vh"
          bg="black"
          color="white"
          align="center"
          justify="center"
          fontWeight="semibold"
          fontSize="xl"
        >
          Camera is disabled
        </Flex>
      )}
      <video
        ref={videoRef}
        autoPlay={true}
        style={{ objectFit: "contain", width: "100%", height: "100%" }}
      />
      <audio ref={audioRef} autoPlay={true} />
    </Flex>
  )
}

export default Participant
