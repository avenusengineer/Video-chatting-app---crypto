import { log } from "@blitzjs/display"
import next from "next"
import { createServer } from "http"

import { presenceQueue } from "queue"
import { initBucket } from "s3"
import redis from "redis"

const { PORT = "3000" } = process.env

process.env.BLITZ_DEV_SERVER_ORIGIN = `http://localhost:${PORT}`

const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })

const handler = app.getRequestHandler()

app.prepare().then(async () => {
  await initBucket()
  await redis.ping()

  presenceQueue.add(null, { repeat: { cron: "*/3 * * * * *" } })

  return createServer(handler).listen(PORT, async () => {
    log.success(`Ready on http://localhost:${PORT}`)
  })
})

export default app
