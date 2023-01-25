import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"

import redis from "redis"
import video from "video"
import { Accept } from "app/rooms/validations"

// Default: 10 seconds
const ACCEPTED_EXPIRATION = process.env.ACCEPTED_EXPIRATION
  ? parseInt(process.env.ACCEPTED_EXPIRATION)
  : 10

// Accept a participant and generate a token.
export default resolver.pipe(
  resolver.authorize(),
  resolver.zod(Accept),
  async ({ participant }, { session: { username } }: Ctx) => {
    const score = await redis.zscore("room:" + username, participant!)
    if (!score) {
      throw new Error("participant is not connected")
    }

    const roomName = `room:${username}:${participant}`
    const room = await video.getOrCreateRoom(roomName)

    const participantToken = await video.addParticipant(room.id, participant)
    await redis.set(roomName, participantToken, "EX", ACCEPTED_EXPIRATION)

    const token = await video.addParticipant(room.id, username!)
    return {
      token,
    }
  }
)
