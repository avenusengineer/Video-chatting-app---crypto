import { invalidateQuery, useMutation, useQuery } from "@blitzjs/rpc"
import { Button, Center, Flex, Spinner, Text } from "@chakra-ui/react"

import useMenu from "app/core/hooks/useMenu"
import Plus from "app/core/icons/Plus"
import deletePaymentMethod from "app/users/mutations/deletePaymentMethod"
import getPaymentMethods from "app/users/queries/getPaymentMethods"

const PaymentMethods = () => {
  const { dispatch } = useMenu()
  const [paymentMethods, { isLoading, isFetched }] = useQuery(getPaymentMethods, null, {
    suspense: false,
  })
  const [deletePaymentMethodMutation, deletePaymentMethodResult] = useMutation(
    deletePaymentMethod,
    {
      onSuccess: async () => {
        await invalidateQuery(getPaymentMethods)
      },
    }
  )

  if (isLoading && !isFetched) {
    return (
      <Center>
        <Spinner />
      </Center>
    )
  }

  if ((paymentMethods ?? []).length === 0) {
    return (
      <Flex gridGap="2rem" flexDir="column">
        <Text textAlign="center" fontSize="md" fontWeight="semibold">
          No saved payment methods
        </Text>
        <Button
          leftIcon={<Plus />}
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
          Make first payment
        </Button>
      </Flex>
    )
  }

  return (
    <Flex flexDir="column" gridGap="1rem" justifyItems="flex-start" w="100%">
      {paymentMethods?.map(({ paymentProfileId, cardNumber, cardType, customerProfileId }) => (
        <Flex
          key={paymentProfileId}
          flexDir="row"
          gridGap="1rem"
          justifyContent="space-between"
          alignItems="center"
          w="100%"
          bg="rgba(196, 196, 196, 0.1)"
          p="1rem"
          borderRadius="md"
        >
          <Flex flexDir="column" gridGap=".5rem">
            <Text fontWeight="semibold" fontSize="xl">
              {cardType}
            </Text>
            <Text fontWeight="semibold" fontSize="md">
              {cardNumber}
            </Text>
          </Flex>
          <Button
            isLoading={
              deletePaymentMethodResult.isLoading &&
              paymentProfileId === (deletePaymentMethodResult?.variables as any)?.paymentProfileId
            }
            onClick={() => deletePaymentMethodMutation({ paymentProfileId, customerProfileId })}
          >
            Delete
          </Button>
        </Flex>
      ))}
    </Flex>
  )
}

export default PaymentMethods
