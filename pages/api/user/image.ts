import { getSession } from "@blitzjs/auth"
import { Form } from "multiparty"
import fs from "fs"
import { parse } from "url"
import { NextApiRequest, NextApiResponse } from "next"

import { api } from "app/blitz-server"
import { updateUserPicture } from "s3"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession(req, res)
  if (!session.userId) {
    return res.writeHead(401).end()
  }

  const form = new Form()
  const { query } = parse(req.url!, true)

  const cropInfo = {
    left: parseFloat((query.x as string) ?? "0"),
    top: parseFloat((query.y as string) ?? "0"),
    width: parseFloat((query.width as string) ?? "100"),
    height: parseFloat((query.height as string) ?? "100"),
    mediaWidth: parseFloat((query.mediaWidth as string) ?? "100"),
    mediaHeight: parseFloat((query.mediaHeight as string) ?? "100"),
  }

  await new Promise((resolve, reject) => {
    form.parse(req, async (error, _, files) => {
      if (error || !files.file || files.file.length === 0) return reject(error)

      const [{ path }] = files.file

      const file = fs.createReadStream(path)
      const paths = await updateUserPicture(session.userId!, file, {
        top: Math.round((cropInfo.top / 100) * cropInfo.mediaHeight),
        left: Math.round((cropInfo.left / 100) * cropInfo.mediaWidth),
        height: Math.round((cropInfo.height / 100) * cropInfo.mediaHeight),
        width: Math.round((cropInfo.width / 100) * cropInfo.mediaWidth),
      })

      fs.rm(path, () => {})
      resolve(paths)
    })
  })

  // await db.user.update({
  //   where: {
  //     id: session.userId,
  //   },
  //   data: {
  //     imageUrl: paths[400],
  //   },
  // })
  res.statusCode = 200
  res.end()
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export default api(handler)
