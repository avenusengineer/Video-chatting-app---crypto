import { getQueryKey, getQueryClient, invokeWithCtx, dehydrate } from "@blitzjs/rpc"

import getCurrentUser from "app/users/queries/getCurrentUser"
import { gSSP } from "app/blitz-server"

export const getDefaultServerSideProps = gSSP(async ({ ctx }) => {
  const queryKey = getQueryKey(getCurrentUser, null)
  await getQueryClient().prefetchQuery(
    queryKey,
    async () => await invokeWithCtx(getCurrentUser, null, ctx)
  )

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  }
})

export default getDefaultServerSideProps
