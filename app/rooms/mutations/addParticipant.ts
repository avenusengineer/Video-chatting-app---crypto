import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"

import video from "video"
import { AddParticipant } from "app/rooms/validations"

export default resolver.pipe(
  resolver.authorize(),
  resolver.zod(AddParticipant),
  async ({ roomId, username }, _: Ctx) => {
    return await video.addParticipant(roomId, username)
  }
)
