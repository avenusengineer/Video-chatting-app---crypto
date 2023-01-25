import { useQuery } from "@blitzjs/rpc"
import { Flex, Skeleton, Text } from "@chakra-ui/react"
import { FC } from "react"

import CallHistory from "app/core/components/CallHistory"
import TransactionHistory from "app/core/components/TransactionHistory"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import getHistory from "app/users/queries/getHistory"

interface HistoryProps {
  user: NonNullable<ReturnType<typeof useCurrentUser>>
  isCreator?: boolean
}

const History: FC<HistoryProps> = ({ user, isCreator }) => {
  const [transactions, { isLoading }] = useQuery(
    getHistory,
    { isCreator },
    {
      suspense: false,
    }
  )

  return (
    <Flex
      alignSelf="center"
      flexDir="column"
      bg="rgba(255, 255, 255, 0.05)"
      borderRadius="lg"
      css="div:last-child { border: none; }"
      maxH="ml"
      w="100%"
      overflowY="auto"
      h="15rem"
    >
      {isLoading ? (
        <Skeleton w="100%" h="100%" />
      ) : !transactions?.length ? (
        <Flex justify="center" h="100%" align="center">
          <Text fontSize="lg" fontWeight="bold">
            You don&apos;t have any history
          </Text>
        </Flex>
      ) : (
        transactions.map((transaction) =>
          "duration" in transaction ? (
            <CallHistory key={transaction.id} call={transaction as never} user={user} />
          ) : (
            <TransactionHistory key={transaction.id} transaction={transaction} />
          )
        )
      )}
    </Flex>
  )
}

export default History
