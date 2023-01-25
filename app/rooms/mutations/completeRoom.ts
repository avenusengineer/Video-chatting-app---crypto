import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"

import { getParticpantsFromName } from "helpers/room"
import redis from "redis"
import video from "video"
import { CompleteRoom } from "app/rooms/validations"

export default resolver.pipe(
  resolver.authorize(),
  resolver.zod(CompleteRoom),
  async ({ roomId, roomName }, { session: { username } }: Ctx) => {
    const { creatorName, participantName } = getParticpantsFromName(roomName)
    const participant = creatorName === username ? participantName : username

    await Promise.all([
      video.completeRoom(roomId),
      redis
        .pipeline()
        .zrem(`room:queue:${roomId}`, participant!)
        .zrem(`room:${roomId}`, participant!)
        .exec(),
    ])
  }
)
