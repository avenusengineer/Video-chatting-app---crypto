import { Flex, FlexProps, Text } from "@chakra-ui/react"
import { FC } from "react"

import { numberWithCommas } from "helpers/number"
import Gem from "app/core/icons/Gem"
import Dollar from "app/core/icons/Dollar"
import { gemsToDollar } from "helpers/price"

type GemsBalanceProps = {
  gems?: number
  showDollar?: boolean
} & FlexProps

const GemsBalance: FC<GemsBalanceProps> = ({ gems = 0, showDollar = false, ...props }) => (
  <Flex flexDir="row" cursor="pointer" {...props}>
    <Flex
      px="1rem"
      py=".8rem"
      borderLeftRadius="10px"
      backgroundColor="rgba(196, 196, 196, 0.1)"
      alignItems="center"
      gridGap=".5rem"
      borderRightRadius={showDollar === false ? "10px" : !showDollar ? ["10px", "0"] : "0"}
    >
      <Gem boxSize={6} />
      <Text fontSize="md" fontWeight="bold">
        {numberWithCommas(gems ?? 0)}
      </Text>
    </Flex>
    <Flex
      display={showDollar === false ? "none" : !showDollar ? ["none", "flex"] : "flex"}
      fontSize="26px"
      px="1rem"
      py=".8rem"
      borderRightRadius="10px"
      backgroundColor="rgba(196, 196, 196, 0.05)"
      alignItems="center"
      gridGap=".2rem"
    >
      <Dollar boxSize={5} />
      <Text fontSize="md" fontWeight="bold">
        {numberWithCommas(gemsToDollar(gems ?? 0))}
      </Text>
    </Flex>
  </Flex>
)

export default GemsBalance
