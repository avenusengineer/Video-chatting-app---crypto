import { Track } from "twilio-video"
import { useEffect, useRef, useState } from "react"
import { Skeleton } from "@chakra-ui/react"

import { IVideoTrack } from "types"
import useVideoTrackDimensions from "app/core/hooks/useVideoTrackDimensions"

interface VideoTrackProps {
  track?: IVideoTrack
  isLocal?: boolean
  priority?: Track.Priority | null
}

export const VideoTrack = ({ track, isLocal, priority }: VideoTrackProps) => {
  const ref = useRef<HTMLVideoElement>(null!)
  const dimensions = useVideoTrackDimensions(track)
  const isPortrait = (dimensions?.height ?? 0) > (dimensions?.width ?? 0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!ref.current || !track) return

    const el = ref.current

    el.muted = true

    if (track.setPriority && priority) {
      track.setPriority(priority)
    }

    const onStarted = () => {
      setIsLoading(false)
    }

    track.once("started", onStarted)
    setIsLoading(true)

    track.attach(el)

    return () => {
      track.detach(el)

      el.srcObject = null

      if (track.setPriority && priority) {
        track.setPriority(null)
      }
    }
  }, [track, priority])

  const isFrontFacing = track?.mediaStreamTrack.getSettings().facingMode !== "environment"

  return (
    <>
      {isLoading && <Skeleton w="100%" pb={["0", "56.25%"]} pt={["56.25%", "0"]} />}
      <video
        ref={ref}
        style={{
          display: isLoading ? "none" : "inherit",
          transform: isLocal && isFrontFacing ? "rotateY(180deg)" : "",
          objectFit:
            isPortrait || track?.name.includes("screen")
              ? ("contain" as const)
              : ("cover" as const),
        }}
      />
    </>
  )
}
