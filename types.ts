import { SessionContext, SimpleRolesIsAuthorized } from "@blitzjs/auth"
import { LocalVideoTrack, RemoteVideoTrack } from "twilio-video"

import { User } from "db"

// Note: You should switch to Postgres and then use a DB enum for role type
export type Role = "ADMIN" | "USER" | "CREATOR"

declare module "blitz" {
  interface Ctx {
    session: SessionContext
    ipAddress?: string
  }
}

declare module "@blitzjs/auth" {
  export interface Ctx {
    session: SessionContext
    ipAddress?: string
  }
  export interface Session {
    isAuthorized: SimpleRolesIsAuthorized<Role>
    PublicData: {
      userId: User["id"]
      username: User["username"]
      role: Role
    }
  }
}

declare module "twilio-video" {
  interface LocalVideoTrack {
    isSwitchedOff: undefined
    setPriority: undefined
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "css-doodle": JSX.IntrinsicElements["style"]
    }
  }
}

// Video related
export type IVideoTrack = LocalVideoTrack | RemoteVideoTrack
