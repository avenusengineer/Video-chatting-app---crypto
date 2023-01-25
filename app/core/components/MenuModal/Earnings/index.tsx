import { useQuery } from "@blitzjs/rpc"
import { Button, Divider, Flex, Text } from "@chakra-ui/react"
import { FC } from "react"

import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import Dollar from "app/core/icons/Dollar"
import ArrowCircleRight from "app/core/icons/ArrowCircleRight"
import { numberWithCommas } from "helpers/number"
import getEarningsRanking from "app/users/queries/getEarningsRanking"
import History from "app/users/components/History"

// const formatPercentage = (percentage: BigInt) => {
//   return 5 * Math.round((Number(percentage) * DOLLAR_TO_GEMS) / 5)
// }

interface EarningsProps {
  user: NonNullable<ReturnType<typeof useCurrentUser>>
}

const Earnings: FC<EarningsProps> = ({ user }) => {
  const [ranking] = useQuery(getEarningsRanking, null)

  return (
    <Flex flexDir="column" gridGap="2rem">
      <Flex flexDir="column" gridGap="1rem">
        <Text fontWeight="semibold" fontSize="xl">
          Earnings
        </Text>
        <Flex flexDir="row" alignItems="center" justifyContent="center">
          <Dollar />
          <Text fontWeight="medium" fontSize="xl">
            {numberWithCommas(Math.round(user.balance * 100) / 100)}
          </Text>
        </Flex>
        <Flex alignItems="center" justifyContent="center" flexDir="column" gridGap=".75rem">
          <Button
            disabled
            bg="rgba(196, 196, 196, .10)"
            w="xs"
            leftIcon={<ArrowCircleRight color="#75FF26" />}
          >
            Cash Out
          </Button>
          <Button bg="rgba(196, 196, 196, .10)" w="xs" disabled>
            Manage
          </Button>
        </Flex>
      </Flex>
      <Divider opacity=".25" />
      <Flex flexDir="column">
        <Text fontWeight="semibold" fontSize="lg" opacity=".75">
          Total Earnings
        </Text>
        <Flex flexDir="row" gridGap="1rem" alignItems="center">
          <Flex flexDir="row" alignItems="center" gridGap=".3rem" opacity=".75">
            <Dollar boxSize="5" />
            <Text fontWeight="medium" fontSize="2xl">
              {numberWithCommas(ranking?.totalEarnings || 0)}
            </Text>
          </Flex>
          {/* {ranking?.earningsRank != null && (
            <Text color="#B026FF" fontWeight="semibold" fontSize="lg">
              Top {formatPercentage(ranking.earningsRank as never)}%
            </Text>
          )} */}
        </Flex>
      </Flex>
      <Flex flexDir="column" gridGap="1rem">
        <Text fontWeight="semibold" fontSize="2xl">
          Earnings History
        </Text>
        <History user={user} isCreator />
      </Flex>
    </Flex>
  )
}

export default Earnings
