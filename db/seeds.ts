//import { SecurePassword } from "blitz"
import { SecurePassword } from "@blitzjs/auth"
import Chance from "chance"
import * as fs from "fs"
import { parsePhoneNumber } from "react-phone-number-input"

import { DOLLAR_TO_GEMS } from "helpers/price"
import { initBucket, updateUserPicture } from "s3"
import db, { User } from "."
import { CALL_FEE } from "helpers/room"

const chance = Chance()

/*
 * This seed function is executed when you run `blitz db seed`.
 *
 * Probably you want to use a library like https://chancejs.com
 * or https://github.com/Marak/Faker.js to easily generate
 * realistic data.
 */

const createLinks = (username: string): any[] => [
  {
    name: username,
    type: "TWITTER",
    url: `https://twitter.com/${username}`,
  },
  {
    name: username,
    type: "FACEBOOK",
    url: `https://facebook.com/${username}`,
  },
  {
    name: username,
    type: "YOUTUBE",
    url: `https://youtube.com/${username}`,
  },
  {
    name: username,
    type: "TIKTOK",
    url: `https://twitter.com/${username}`,
  },
  {
    name: username,
    type: "INSTAGRAM",
    url: `https://instagram.com/${username}`,
  },
  {
    name: "website",
    type: "OTHER",
    url: `https://example.com/`,
  },
]

const createUser = async (params: Partial<Omit<User, "kycData">> = {}): Promise<User> => {
  const hashedPassword = await SecurePassword.hash("seconds123")
  const username = params.username || chance.word({ syllables: 3 })

  const user = await db.user.upsert({
    where: {
      username,
    },
    create: {
      username,
      hashedPassword,
      email: chance.email(),
      phone: parsePhoneNumber(chance.phone(), "US")!.number,
      name: chance.name(),
      kycVerifiedAt: null,
      birthdate: chance.date({
        year: chance.integer({
          min: 1950,
          max: 2000,
        }),
      }),
      price: chance.integer({
        min: 10,
        max: 10000,
      }),
      role: "USER",
      links: {
        createMany: {
          data: createLinks(username),
        },
      },
      ...params,
    },
    update: {},
  })

  const randomPicture = chance.integer({
    min: 0,
    max: 9,
  })

  const picture = fs.createReadStream(`./s3/seed/${randomPicture}.jpg`)
  const paths = await updateUserPicture(user.id, picture)
  await db.userImage.create({
    data: {
      userId: user.id,
      url: paths[400],
      order: 0,
    },
    select: {
      user: {
        include: {
          images: {
            orderBy: {
              order: "asc",
            },
          },
        },
      },
    },
  })
  return user
}

const seed = async () => {
  await initBucket()

  // Create main user
  const user = await createUser({
    name: "Antoine Ordonez",
    username: "antoine",
    email: "antoine@seconds.app",
    birthdate: new Date(Date.parse("1990-01-01")),
    role: "CREATOR",
  })

  // Create creators
  for (let i = 0; i < 10; i++) {
    await createUser({
      role: "CREATOR",
    })
  }

  // Create normal users
  const users: User[] = []
  for (let i = 0; i < 10; i++) {
    const user = await createUser()
    users.push(user)
  }

  // Create fake transactions
  for (let i = 0; i < 10; i++) {
    const amount = chance.integer({ min: 1, max: 100 })
    await db.transaction.create({
      data: {
        sid: chance.guid(),
        amount,
        gems: amount * DOLLAR_TO_GEMS,
        source: chance.cc(),
        currency: "USD",
        userId: user.id,
        type: "DEPOSIT",
        createdAt: chance.date({
          year: new Date().getFullYear(),
        }),
      },
    })
    await db.transaction.create({
      data: {
        sid: chance.guid(),
        amount,
        gems: amount * DOLLAR_TO_GEMS,
        source: chance.cc(),
        currency: "USD",
        userId: user.id,
        type: "WITHDRAWAL",
        createdAt: chance.date({
          year: new Date().getFullYear(),
        }),
      },
    })
  }

  // Create fake calls
  for (let i = 0; i < 10; i++) {
    const createdAt = chance.date({
      month: chance.integer({
        min: 1,
        max: 12,
      }),
      day: chance.integer({
        min: 1,
        max: new Date().getDate(),
      }),
      year: new Date().getFullYear(),
      string: false,
    }) as Date
    const duration = chance.floating({ min: 10, max: 3600 })
    const completedAt = new Date(createdAt.getTime() + duration * DOLLAR_TO_GEMS)

    const price = duration * 500
    const fee = price * CALL_FEE

    await db.call.create({
      data: {
        author: {
          connect: {
            id: user.id,
          },
        },
        sid: chance.guid(),
        createdAt,
        updatedAt: completedAt,
        completedAt,
        duration,
        price,
        fee,
        earnings: (price - price * CALL_FEE) / DOLLAR_TO_GEMS,
        participant: {
          connect: {
            id: chance.pickone(users).id,
          },
        },
      },
    })

    {
      const price = duration * 500
      const fee = price - CALL_FEE

      await db.call.create({
        data: {
          author: {
            connect: {
              id: chance.pickone(users).id,
            },
          },
          sid: chance.guid(),
          createdAt,
          updatedAt: createdAt,
          completedAt,
          duration,
          price,
          fee,
          earnings: (price - price * CALL_FEE) / DOLLAR_TO_GEMS,
          participant: {
            connect: {
              id: user.id,
            },
          },
        },
      })
    }
  }
}

export default seed
