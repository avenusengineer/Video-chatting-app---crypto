import { resolver } from "@blitzjs/rpc"

import video from "video"
import { CreateRoom } from "app/rooms/validations"

export default resolver.pipe(resolver.authorize(), resolver.zod(CreateRoom), async ({ name }) => {
  return await video.getOrCreateRoom(name)
})
