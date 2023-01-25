import { log } from "@blitzjs/display"
import Bull from "bull"
import twilio from "twilio"
import { NextApiRequest, NextApiResponse } from "next"

import { api } from "app/blitz-server"
import db from "db"
import { endRoom, getParticpantsFromName } from "helpers/room"
import { roomQueue } from "queue/room"
import { DOLLAR_TO_GEMS } from "helpers/price"

interface BaseEvent {
  RoomStatus: string
  RoomSid: string
  RoomName: string
  RoomDuration: string
  ParticipantDuration: string
  SequenceNumber: string
  Timestamp: Date
  AccountSid: string
}

interface ParticipantEvent extends BaseEvent {
  ParticipantStatus: "connected" | "disconnected"
  ParticipantIdentity: string
  ParticipantSid: string
}

type RoomCreated = {
  StatusCallbackEvent: "room-created"
} & BaseEvent

type RoomEnded = {
  StatusCallbackEvent: "room-ended"
} & BaseEvent

type ParticipantDisconnected = {
  StatusCallbackEvent: "participant-disconnected"
} & ParticipantEvent

type ParticipantConnected = {
  StatusCallbackEvent: "participant-connected"
} & ParticipantEvent

type Event = RoomCreated | RoomEnded | ParticipantDisconnected | ParticipantConnected

const { EXTERNAL_URL = process.env.BLITZ_DEV_SERVER_ORIGIN, TWILIO_AUTH_TOKEN } = process.env

const validateRequest = (req: NextApiRequest) =>
  twilio.validateRequest(
    TWILIO_AUTH_TOKEN!,
    req.headers["x-twilio-signature"] as string,
    EXTERNAL_URL + req.url!,
    req.body
  )

const addRoomEndJob = async (body: Event, jobOptions: Bull.JobOptions = {}) => {
  const { creatorName, participantName } = getParticpantsFromName(body.RoomName)
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

  const maximumDuration = Math.floor(gems / price) * 1000

  await roomQueue.add(
    {
      roomID: body.RoomSid,
      roomName: body.RoomName,
    },
    {
      jobId: body.RoomSid,
      delay: maximumDuration * DOLLAR_TO_GEMS,
      ...jobOptions,
    }
  )
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!validateRequest(req)) {
    res.statusCode = 400
    return res.end()
  }

  const body = req.body as Event
  const parts = body.RoomName.split(":")

  if (parts.length !== 3) {
    res.statusCode = 400
    return res.end()
  }

  const [, , participantName] = parts as [string, string, string]

  switch (body.StatusCallbackEvent) {
    case "participant-connected":
      if (participantName === body.ParticipantIdentity) {
        await addRoomEndJob(body)
        log.info(`Participant connected: ${body.ParticipantIdentity} to ${body.RoomName}`)
      }
      break
    case "participant-disconnected":
      log.info(
        `Participant disconnected: ${body.ParticipantIdentity} after ${body.ParticipantDuration}s`
      )

      // Close room 5 seconds after user disconnects.
      await roomQueue.add(
        {
          roomID: body.RoomSid,
          roomName: body.RoomName,
        },
        {
          jobId: body.RoomSid,
          delay: 5000,
        }
      )

      break
    case "room-created":
      log.info(`Room created: ${req.body.RoomName}`)
      break
    case "room-ended":
      await endRoom({
        roomName: body.RoomName,
        roomSid: body.RoomSid,
      })
      break
  }

  res.statusCode = 200
  res.end()
}

export default api(handler)
