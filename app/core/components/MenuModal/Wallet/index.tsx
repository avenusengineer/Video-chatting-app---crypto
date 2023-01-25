import { Flex, Text } from "@chakra-ui/react"
import { FC, Suspense } from "react"

import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import useMenu from "app/core/hooks/useMenu"
import GemsBalance from "app/core/components/GemsBalance"
import Main from "./Main"
import Deposit from "./Deposit"
import PaymentMethods from "./PaymentMethods"

interface WalletPageProps {
  user: NonNullable<ReturnType<typeof useCurrentUser>>
}

const WalletPage = ({ user }: WalletPageProps) => {
  const { state } = useMenu()

  if (state.page !== "WALLET") return null

  switch (state.subPage) {
    case "MAIN":
      return <Main user={user} />
    case "DEPOSIT":
      return <Deposit defaultAmount={state.amount} />
    case "PAYMENT_METHODS":
      return <PaymentMethods />
    default:
      return <>Coming soon...</>
  }
}

interface WalletProps {
  user: NonNullable<ReturnType<typeof useCurrentUser>>
}

const Wallet: FC<WalletProps> = ({ user }) => (
  <Flex
    flexDir="column"
    gridGap={{
      base: "1.5rem",
      md: "4rem",
    }}
  >
    <Flex
      flexDir={{
        base: "row",
        md: "column",
      }}
      alignItems={{
        base: "center",
        md: "flex-start",
      }}
      gridGap={{
        base: "1rem",
        md: ".5rem",
      }}
      justifyContent={{
        base: "center",
        md: "flex-start",
      }}
    >
      <Text fontWeight="semibold" fontSize="xl">
        Balance
      </Text>
      <GemsBalance gems={user.gems} />
    </Flex>
    <Suspense fallback={null}>
      <Flex flexDir="column">
        <WalletPage user={user} />
      </Flex>
    </Suspense>
  </Flex>
)

export default Wallet
