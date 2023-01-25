import { useQuery } from "@blitzjs/rpc"

import getCurrentUser from "app/users/queries/getCurrentUser"

export const useCurrentUser = (suspense = true) => {
  const [user] = useQuery(getCurrentUser, null, { suspense })
  return user
}
