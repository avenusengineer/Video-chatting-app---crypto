import { log } from "@blitzjs/display"
import Bull, { Queue } from "bull"

import redis, { parseOptionsFromURL } from "redis"
import video from "video"

export interface RoomQueueProps {
  roomID: string
  roomName: string
}

export const roomQueue: Queue<RoomQueueProps> = new Bull("ROOM", {
  redis: parseOptionsFromURL() as never,
  defaultJobOptions: {
    removeOnComplete: true,
  },
})

roomQueue.process(async ({ data: { roomID, roomName } }) => {
  log.info(`Time limit reached, closing room: ${roomName}`)

  const parts = roomName.split(":")
  const [, creatorName, participantName] = parts as [string, string, string]

  return await Promise.all([
    redis.pipeline().del(roomName).zrem(`room:${creatorName}`, participantName).exec(),
    video.completeRoom(roomID),
  ])
})
