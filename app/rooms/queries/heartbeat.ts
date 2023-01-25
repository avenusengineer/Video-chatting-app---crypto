import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"

import redis from "redis"
import { Heartbeat } from "app/rooms/validations"

interface HeartbeatWaiting {
  status: "waiting"
  size: number
  position: number
}

interface HeartbeatRefused {
  status: "refused"
}

interface HeartbeatAccepted {
  status: "accepted"
  token: string
}

type HeartbeatResponse = HeartbeatWaiting | HeartbeatRefused | HeartbeatAccepted

export default resolver.pipe(
  resolver.authorize(),
  resolver.zod(Heartbeat),
  async ({ roomId }, { session: { username } }: Ctx): Promise<HeartbeatResponse> => {
    const roomName = `room:${roomId}:${username!}`
    const token = await redis.get(roomName)

    if (token === "refused") {
      return {
        status: "refused",
      }
    }

    const roomKey = "room:queue:" + roomId
    const queue = await redis.zrevrange(roomKey, 0, 0, "WITHSCORES")

    await redis
      .pipeline()
      .zadd("room:" + roomId, Date.now(), username!)
      .zadd(roomKey, "NX", queue?.[1] ? parseInt(queue[1], 10) : 1, username!)
      .exec()

    if (token) {
      return {
        status: "accepted",
        token,
      }
    }

    const size = await redis.zcount(roomKey, 0, "+inf")
    const position = await redis.zrank(roomKey, username!)

    return {
      size,
      position: (position ?? 0) + 1,
      status: "waiting",
    }
  }
)
