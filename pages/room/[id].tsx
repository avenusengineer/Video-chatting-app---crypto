import { dehydrate, getQueryKey, invoke, invokeWithCtx, getQueryClient } from "@blitzjs/rpc"
import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { Suspense } from "react"

import { gSSP } from "app/blitz-server"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import Layout from "app/core/layouts/Layout"
import CreatorView from "app/rooms/components/CreatorView"
import ParticipantView from "app/rooms/components/ParticipantView"
import getUser from "app/users/queries/getUser"
import getCurrentUser from "app/users/queries/getCurrentUser"

const RoomPage: BlitzPage = () => {
  const currentUser = useCurrentUser(false)
  const roomId = useParam("id", "string")!

  if (!currentUser) return null

  return (
    <Suspense fallback="Loading...">
      {roomId === currentUser.username ? (
        <CreatorView currentUser={currentUser} />
      ) : (
        <ParticipantView currentUser={currentUser} />
      )}
    </Suspense>
  )
}

RoomPage.authenticate = true
RoomPage.getLayout = (page) => (
  <Layout title="Seconds - Video chat" maxH="100%" overflow="hidden">
    {page}
  </Layout>
)

export const getServerSideProps = gSSP(async ({ query, ctx, res }) => {
  const currentUserKey = getQueryKey(getCurrentUser, null)
  const userKey = getQueryKey(getUser, { username: query.id as string })

  await Promise.all([
    await getQueryClient().prefetchQuery(
      currentUserKey,
      async () => await invokeWithCtx(getCurrentUser, null, ctx)
    ),
    await getQueryClient().prefetchQuery(
      userKey,
      async () => await invokeWithCtx(getUser, { username: query.id as string }, ctx)
    ),
  ])

  const currentUser = await invokeWithCtx(getCurrentUser, null, ctx)

  if (currentUser?.username !== query.id) {
    const creator = await invoke(getUser, { username: query.id as string })

    if (creator.status !== "CONNECTED") {
      return {
        redirect: {
          destination: Routes.User({ username: creator.username }),
          permanent: false,
        },
      }
    }

    const maximumDuration = Math.floor((currentUser?.gems ?? 0) / (creator?.price ?? 0)) * 1000

    if (maximumDuration < 1000) {
      return res
        .writeHead(302, {
          Location: `/${query.id as string}`,
        })
        .end() as any
    }
  }

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  }
})

export default RoomPage
