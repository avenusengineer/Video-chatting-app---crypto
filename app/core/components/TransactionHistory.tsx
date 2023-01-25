import { Flex, Grid, Text, Tooltip } from "@chakra-ui/react"

import { numberWithCommas } from "helpers/number"
import { Transaction } from "db"
import Gem from "app/core/icons/Gem"

interface TransactionHistoryProps {
  transaction: Transaction
}

const formatDate = (date: Date) => {
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()

  return `${month < 10 ? "0" + month : month}/${day < 10 ? "0" + day : day}/${year}`
}

const formatTime = (date: Date) => {
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const hours12 = hours % 12

  const hours12String = hours12 === 0 ? "12" : hours12.toString()
  const minutesString = minutes < 10 ? `0${minutes}` : minutes.toString()

  return `${hours12String}:${minutesString} ${hours >= 12 ? "pm" : "am"}`
}

const TransactionHistory = ({ transaction }: TransactionHistoryProps) => (
  <Grid
    borderBottom="rgba(255, 255, 255, 0.2) solid 1px"
    px="10px"
    py="14px"
    flexDir="row"
    justifyContent="space-between"
    gridTemplateColumns="2fr 1fr"
    alignItems="center"
    minH="6.5rem"
  >
    <Flex flexDir="column" gridGap=".2rem">
      <Text fontWeight="semibold" fontSize="lg">
        {transaction.type === "DEPOSIT" ? "Deposit" : "Cash Out"}{" "}
        <span style={{ color: transaction.type === "DEPOSIT" ? "#75FF26" : "#EB5545" }}>
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: transaction.currency,
          }).format(transaction.amount)}
        </span>
      </Text>
      {transaction.source && <Text opacity=".5">{transaction.source}</Text>}
    </Flex>
    <Tooltip
      label={`${transaction.createdAt.toLocaleDateString()} ${transaction.createdAt.toLocaleTimeString()}`}
    >
      {transaction.type === "DEPOSIT" ? (
        <Flex flexDir="row" alignItems="center" gridGap="0.3rem" justifyContent="flex-end">
          <Text
            color={transaction.type === "DEPOSIT" ? "#75FF26" : "#EB5545"}
            fontWeight="semibold"
            fontSize="lg"
          >
            {numberWithCommas(transaction.gems)}
          </Text>
          <Gem boxSize={5} />
        </Flex>
      ) : (
        <Flex flexDir="column" alignItems="flex-end" opacity=".5">
          <Text>{formatDate(transaction.createdAt)}</Text>
          <Text>{formatTime(transaction.createdAt)}</Text>
        </Flex>
      )}
    </Tooltip>
  </Grid>
)

export default TransactionHistory
