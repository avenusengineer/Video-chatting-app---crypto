import { z } from "zod"

export const CreateCall = z.object({
  username: z.string().nonempty(),
})

export const CompleteRoom = z.object({
  roomId: z.string().nonempty(),
  roomName: z.string().nonempty(),
})

export const Accept = z.object({
  participant: z.string().nonempty(),
})

export const Refuse = z.object({
  participant: z.string().nonempty(),
})

export const Heartbeat = z.object({
  roomId: z.string().nonempty(),
})

export const AddParticipant = z.object({
  roomId: z.string().nonempty(),
  username: z.string().nonempty(),
})

export const CreateRoom = z.object({
  name: z.string().nonempty(),
})
