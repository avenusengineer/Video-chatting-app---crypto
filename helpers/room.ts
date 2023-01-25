import { log } from "@blitzjs/display"

import db from "db"
import video from "video"
import { DOLLAR_TO_GEMS } from "./price"

interface endRoomParams {
  roomSid: string
  roomName: string
}

export const CALL_FEE = 0.25

export const endRoom = async ({ roomSid, roomName }: endRoomParams) => {
  const { creatorName, participantName } = getParticpantsFromName(roomName)
  const [{ price }, { gems }] = await db.$transaction([
    db.user.findFirstOrThrow({
      select: {
        price: true,
      },
      where: {
        username: creatorName,
      },
    }),
    db.user.findFirstOrThrow({
      select: {
        gems: true,
      },
      where: {
        username: participantName,
      },
    }),
  ])

  let [result, duration] = await video.getRoomParticipantAndDuration(roomSid, participantName)

  if (price * duration > gems) {
    log.warning(
      `Room ${participantName} exceeded gems limit. Difference: ${
        duration - Math.floor(gems / price)
      }s.`
    )
    duration = Math.floor(gems / price)
  }

  log.success(`Room ${participantName} -> ${creatorName} ended. Duration ${duration} seconds.`)

  const cost = Math.round(price * duration) // Calculate the video call cost
  const fee = cost * CALL_FEE // Calculate the video call fee

  await db.$transaction([
    db.user.update({
      where: {
        username: participantName,
      },
      data: {
        gems: {
          decrement: cost,
        },
      },
    }),
    db.user.update({
      where: {
        username: creatorName,
      },
      data: {
        balance: {
          increment: (cost - cost * CALL_FEE) / DOLLAR_TO_GEMS,
        },
      },
    }),
    db.call.create({
      data: {
        author: {
          connect: {
            username: participantName,
          },
        },
        participant: {
          connect: {
            username: creatorName,
          },
        },
        completedAt: result.endTime,
        createdAt: result.dateCreated,
        duration: result.duration,
        price: price > 0 ? cost : 0,
        earnings: (cost - cost * CALL_FEE) / DOLLAR_TO_GEMS,
        fee,
        sid: roomSid,
      },
    }),
  ])

  log.info(`Room ended: ${roomName}`)
}

export const getParticpantsFromName = (roomName: string) => {
  const parts = roomName.split(":")
  const [, creatorName, participantName] = parts as [string, string, string]
  return { creatorName, participantName }
}
