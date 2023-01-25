import { log } from "@blitzjs/display"
import { Twilio } from "twilio"
import AccessToken from "twilio/lib/jwt/AccessToken"
import { RoomInstance, RoomRoomStatus } from "twilio/lib/rest/video/v1/room"

import { endRoom } from "helpers/room"
import { getTwilioClient, newAccessToken } from "./client"

export interface Room {
  id: string
  name: string
  status: RoomRoomStatus
  url: string
}

const { EXTERNAL_URL = process.env.BLITZ_DEV_SERVER_ORIGIN } = process.env

interface RoomParticipantResult {
  dateCreated: Date
  dateUpdated: Date
  duration: number
  endTime: Date
}

class VideoManager {
  client?: Twilio

  getClient(): Twilio {
    if (this.client) {
      return this.client
    }

    this.client = getTwilioClient()
    return this.client
  }

  mapRoom(room: RoomInstance): Room {
    return {
      id: room.sid,
      name: room.uniqueName,
      status: room.status,
      url: room.url,
    }
  }

  async listRooms(uniqueName: string, limit = 20): Promise<Room[]> {
    return (
      await this.getClient().video.rooms.list({
        uniqueName,
        status: "in-progress",
        limit,
      })
    ).map(this.mapRoom)
  }

  async getOrCreateRoom(name: string): Promise<Room> {
    const rooms = await this.getClient().video.rooms.list({
      uniqueName: name,
      status: "in-progress",
      limit: 1,
    })

    if (rooms[0]?.status === "in-progress") {
      await this.completeRoom(rooms[0].sid)
      // return this.mapRoom(rooms[0])
    }

    return await this.createRoom(name)
  }

  async createRoom(name: string): Promise<Room> {
    const room = await this.getClient().video.rooms.create({
      statusCallbackMethod: "POST",
      statusCallback: `${EXTERNAL_URL}/api/room/callback`,
      uniqueName: name,
      type: "go",
    })

    return this.mapRoom(room)
  }

  async addParticipant(roomId: string, username: string): Promise<string> {
    const accessToken = newAccessToken(username)
    accessToken.addGrant(
      new AccessToken.VideoGrant({
        room: roomId,
      })
    )

    return accessToken.toJwt("HS256")
  }

  // Fetch all room's participants, calculate the minimum duration, so we know the exact calling time.
  async getRoomParticipantAndDuration(
    id: string,
    name: string
  ): Promise<[RoomParticipantResult, number]> {
    let duration: number | undefined
    let participant: RoomParticipantResult | undefined

    const participants = await this.getClient().video.rooms(id).participants.list()
    participants.forEach((p) => {
      if (p.identity === name) participant = p
      if (duration === undefined || duration === 0) {
        duration = p.duration
      } else {
        duration = Math.min(p.duration, duration)
      }
    })

    if (duration === undefined || participant === undefined) {
      throw new Error("Failed to fetch room participants")
    }

    return [participant, Math.floor(duration)]
  }

  async completeRoom(id: string): Promise<Room> {
    const room = await this.getClient().video.rooms(id).update({
      status: "completed",
    })

    await endRoom({
      roomName: room.uniqueName,
      roomSid: room.sid,
    })

    log.info(`Deleted room: ${id}`)

    return this.mapRoom(room)
  }
}

export default new VideoManager()
