import { passportAuth } from "@blitzjs/auth"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import AppleStrategy from "passport-apple"
import jwtDecode from "jwt-decode"

import { api } from "app/blitz-server"
import db from "db"
import { generateUsername } from "app/auth/mutations/signup"

interface AppleToken {
  sub: string
  email?: string
  email_verified?: "true" | "false"
}

export default api(
  passportAuth({
    successRedirectUrl: "/",
    errorRedirectUrl: "/",
    secureProxy: true,
    strategies: [
      {
        authenticateOptions: { scope: "openid email profile" },
        strategy: new GoogleStrategy(
          {
            clientID: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
            scope: ["email", "profile"],
          },
          async (_accessToken, _refreshToken, profile, done) => {
            const email = profile.emails?.[0]?.value

            if (!email) {
              return done(new Error("Google OAuth response doesn't have email."))
            }

            const username = await generateUsername()
            const user = await db.user.upsert({
              where: { email },
              create: {
                email,
                username,
                name: profile.displayName,
              },
              update: { email },
            })

            // Check if we created a new user
            const isNewUser = user.createdAt.getTime() === user.updatedAt.getTime()

            done(undefined, {
              redirectUrl: isNewUser ? "/complete-profile" : "/",
              publicData: {
                userId: user.id,
                roles: [user.role],
                username: user.username,
                source: "google",
              },
            })
          }
        ),
      },
      {
        authenticateOptions: { scope: "email name" },
        strategy: new AppleStrategy(
          {
            clientID: process.env.APPLE_CLIENT_ID as string,
            teamID: process.env.APPLE_TEAM_ID as string,
            keyID: process.env.APPLE_KEY_ID as string,
            callbackURL: process.env.APPLE_CALLBACK_URL,
            privateKeyString: process.env.APPLE_PRIVATE_KEY_STRING as string,
            passReqToCallback: true,
            scope: ["email", "name"],
          },
          async (req, _accessToken, _refreshToken, idToken, profile, done) => {
            const { email, name } = req.body?.user ?? {}
            const displayName =
              ((name?.firstName ?? "") + " " + (name?.lastName ?? "")).trim() || undefined

            const token = jwtDecode(idToken as never) as AppleToken
            let isNewUser = false

            let user = await db.user.findFirst({
              where: {
                OR: [
                  {
                    appleUserId: token.sub,
                  },
                  ...(email ?? token.email
                    ? [
                        {
                          email: email ?? token.email,
                        },
                      ]
                    : []),
                ],
              },
            })

            if (!user) {
              const username = await generateUsername()
              user = await db.user.create({
                data: {
                  email: email ?? token.email,
                  username,
                  name: displayName,
                  appleUserId: token.sub,
                  emailVerifiedAt: token?.email_verified === "true" ? new Date() : undefined,
                },
              })

              isNewUser = true
            } else if (user.appleUserId !== token.sub) {
              await db.user.update({
                where: { id: user.id },
                data: {
                  appleUserId: token.sub,
                  emailVerifiedAt: token?.email_verified === "true" ? new Date() : undefined,
                },
              })
            }

            done(undefined, {
              redirectUrl: isNewUser ? "/complete-profile" : "/",
              publicData: {
                userId: user.id,
                roles: [user.role],
                username: user.username,
                source: "apple",
              },
            })
          }
        ),
      },
    ],
  })
)
