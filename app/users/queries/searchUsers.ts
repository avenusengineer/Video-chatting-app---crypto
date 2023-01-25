import db from "db"

export interface SearchUsers {
  search: string
}

export default async function searchUsers({ search }: SearchUsers) {
  return await db.user.findMany({
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      role: true,
    },
    where: {
      email: {
        contains: search,
      },
    },
  })
}
