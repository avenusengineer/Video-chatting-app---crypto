import { Flex, Text, Button } from "@chakra-ui/react"
import { FC } from "react"

import useMenu from "app/core/hooks/useMenu"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import Plus from "app/core/icons/Plus"
import History from "app/users/components/History"
import CreditCard from "app/core/icons/CreditCard"

interface MainProps {
  user: NonNullable<ReturnType<typeof useCurrentUser>>
}

const Main: FC<MainProps> = ({ user }) => {
  const { dispatch } = useMenu()

  return (
    <Flex flexDir="column" gridGap="4rem">
      <Flex flexDir="column" gridGap="1rem" justifyItems="flex-start" w="100%">
        <Button
          w="100%"
          leftIcon={<Plus boxSize={6} />}
          bg="rgba(196, 196, 196, 0.1)"
          justifyContent="start"
          gridGap=".5rem"
          size="lg"
          onClick={() =>
            dispatch({
              type: "SET_PAGE",
              payload: {
                page: "WALLET",
                subPage: "DEPOSIT",
              },
            })
          }
        >
          Buy Gems
        </Button>
        <Button
          w="100%"
          leftIcon={<CreditCard boxSize={6} />}
          bg="rgba(196, 196, 196, 0.1)"
          justifyContent="start"
          gridGap=".5rem"
          size="lg"
          onClick={() =>
            dispatch({
              type: "SET_PAGE",
              payload: {
                page: "WALLET",
                subPage: "PAYMENT_METHODS",
              },
            })
          }
        >
          Payment methods
        </Button>
      </Flex>
      <Flex flexDir="column" gridGap=".5rem">
        <Text fontWeight="semibold" fontSize="xl">
          History
        </Text>
        <History user={user} />
      </Flex>
    </Flex>
  )
}

export default Main
