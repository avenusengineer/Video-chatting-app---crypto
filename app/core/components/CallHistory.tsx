import Link from "next/link"
import { Routes } from "@blitzjs/next"
import { Flex, Grid, Tooltip, Text } from "@chakra-ui/react"
import humanize from "humanize-duration"

import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import getCalls from "app/users/queries/getCalls"
import { numberWithCommas } from "helpers/number"
import Gem from "app/core/icons/Gem"
import ProfilePicture from "app/users/components/ProfilePicture"
import Dollar from "../icons/Dollar"

interface CallHistory {
  user: NonNullable<ReturnType<typeof useCurrentUser>>
  call: NonNullable<Awaited<ReturnType<typeof getCalls>>>[number]
}

const CallHistory = ({ call, user }: CallHistory) => {
  const { author, participant, duration, price, completedAt, createdAt, earnings } = call
  const isEmittedCall = author.id === user.id
  const caller = isEmittedCall ? participant : author

  return (
    <Grid
      borderBottom="rgba(255, 255, 255, 0.2) solid 1px"
      px="10px"
      py="14px"
      flexDir="row"
      justifyContent="space-between"
      gridTemplateColumns="2fr 1fr"
      minH="6.5rem"
    >
      {caller && (
        <Link
          href={
            caller.role === "CREATOR"
              ? Routes.User({
                  username: caller.username,
                })
              : "#"
          }
        >
          <Flex flexDir="row" gridGap="0.5rem" alignItems="center" cursor="pointer">
            <ProfilePicture
              url={caller.images?.[0]?.url}
              name={caller.name ?? caller.username}
              imageHash={caller.images?.[0]?.hash}
            />
            <Flex flexDir="column" cursor="pointer">
              <Text fontWeight="medium" fontSize="lg">
                {caller.name}
              </Text>
              <Text opacity="50%">@{caller.username}</Text>
            </Flex>
          </Flex>
        </Link>
      )}
      <Tooltip
        label={`${(completedAt ?? createdAt).toLocaleDateString()} ${(
          completedAt ?? createdAt
        ).toLocaleTimeString()}`}
      >
        <Flex flexDir="column" justifyContent="center" textAlign="end" alignItems="flex-end">
          {isEmittedCall ? (
            <Flex flexDir="row" alignItems="center" gridGap="0.3rem">
              <Text color="whit" fontWeight="medium" fontSize="md">
                {numberWithCommas(price)}
              </Text>
              <Gem boxSize={5} />
            </Flex>
          ) : (
            <Flex flexDir="row" alignItems="center">
              <Dollar color="#75FF26" boxSize={4} />
              <Text color="#75FF26" fontWeight="medium" fontSize="md">
                {numberWithCommas(earnings)}
              </Text>
            </Flex>
          )}
          <Text opacity="50%" fontSize="sm">
            {humanize(duration! * 1000, { round: true })}
          </Text>
        </Flex>
      </Tooltip>
    </Grid>
  )
}

export default CallHistory
