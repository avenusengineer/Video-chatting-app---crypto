import { log } from "@blitzjs/display"
import Bull from "bull"

import db from "db"
import redis, { parseOptionsFromURL } from "redis"

export const presenceQueue = new Bull("PRESENCE", {
  redis: parseOptionsFromURL() as never,
  defaultJobOptions: {
    removeOnComplete: true,
  },
  limiter: {
    max: 1,
    duration: 3000,
  },
})

const TIMEOUT = process.env.TIMEOUT ? parseInt(process.env.TIMEOUT) : 1000 * 10

presenceQueue.process(async () => {
  // Delete expired users
  const timestamp = Date.now() - TIMEOUT
  await redis.zremrangebyscore("presence", 0, timestamp)

  // Get connected users
  const usernames = await redis.zrange("presence", 0, -1)

  // Update users status states based on redis cache
  await db.$transaction([
    db.user.updateMany({
      where: {
        status: "CONNECTED",
        username: {
          notIn: usernames,
        },
      },
      data: {
        status: "DISCONNECTED",
        lastSeenAt: new Date()
      },
    }),
    db.user.updateMany({
      where: {
        status: "DISCONNECTED",
        username: {
          in: usernames,
        },
      },
      data: {
        status: "CONNECTED",
      },
    }),
  ])
})

presenceQueue.on("completed", async () => {
  log.debug("Synchronised user presence")
})

presenceQueue.on("error", async (job) => {
  log.error(`Error synchronising user presence. ${job.message}`)
})
