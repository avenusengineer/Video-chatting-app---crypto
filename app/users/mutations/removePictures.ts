import { resolver } from "@blitzjs/rpc"

import db from "db"
import { removeUserPictures } from "s3"
import { RemovePictures } from "../validations"

export default resolver.pipe(
  resolver.authorize(),
  resolver.zod(RemovePictures),
  async ({ id, imageUrl }, { session: { userId } }) => {
    await Promise.all([
      await removeUserPictures(imageUrl),
      await db.userImage.deleteMany({
        where: {
          id,
          userId,
        },
      }),
    ])
  }
)
