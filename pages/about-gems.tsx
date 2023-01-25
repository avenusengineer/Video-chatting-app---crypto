import { useRouter } from "next/router"
import { useMutation } from "@blitzjs/rpc"
import { BlitzPage, Routes } from "@blitzjs/next"
import { Button, Flex, Heading, Text } from "@chakra-ui/react"

import { gSSP } from "app/blitz-server"
import Layout from "app/core/layouts/Layout"
import getDefaultServerSideProps from "app/core/helpers/getDefaultServerSideProps"
import Gem from "app/core/icons/Gem"
import Form, { FORM_ERROR } from "app/core/components/Form"
import { EditUser } from "app/users/validations"
import LabeledTextField from "app/core/components/LabeledTextField"
import { numberWithCommas } from "helpers/number"
import editUser from "app/users/mutations/editUser"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import { gemsToDollar } from "helpers/price"

const AboutGems: BlitzPage = () => {
  const router = useRouter()
  const [editUserMutation, { isSuccess }] = useMutation(editUser)
  const user = useCurrentUser()

  if (isSuccess) {
    return (
      <Flex w="full" h="full" justifyContent="center" alignContent="center">
        <Flex
          flexDir="column"
          textAlign="center"
          alignItems="center"
          gridGap="4rem"
          w="container.sm"
          bg="#150F1A"
        >
          <Heading>You’re all done.</Heading>
          <Flex
            borderRadius="xl"
            border="1px solid white"
            flexDir="column"
            gridGap="2rem"
            textAlign="center"
            py="3rem"
            px="4rem"
            fontWeight="medium"
            fontSize="xl"
          >
            <Text>
              Your profile is currently under review. Please give our team up to 24 hours to verify
              your account.
            </Text>
            <Text>Thanks for signing up to become a Seconds creator.</Text>
          </Flex>
          <Button
            bg="white"
            color="black"
            borderRadius="2xl"
            w="xs"
            onClick={() => router.push(Routes.Home())}
          >
            Done
          </Button>
        </Flex>
      </Flex>
    )
  }

  return (
    <Flex w="full" h="full" justifyContent="center" alignContent="center">
      <Flex
        flexDir="column"
        textAlign="center"
        alignItems="center"
        gridGap={["1rem", "3rem"]}
        w="container.sm"
        bg="#150F1A"
        borderRadius="xl"
        px={[".5rem", "2rem"]}
        py="2rem"
      >
        <Flex justifyContent="space-between" alignItems="center" w="full" px="2rem">
          <Gem transform="rotate(-15deg)" boxSize={[8, 12]} />
          <Heading fontSize={["xl", "3xl"]}>Let’s talk about gems.</Heading>
          <Gem transform="rotate(15deg)" boxSize={[8, 12]} />
        </Flex>
        <Flex
          borderRadius="xl"
          border="1px solid white"
          flexDir="column"
          gridGap="2rem"
          textAlign="center"
          py="1rem"
          px="1rem"
          fontWeight="medium"
          fontSize="xl"
        >
          <Flex flexDir="column">
            <Text alignItems="center" display="flex" justifyContent="center">
              <Gem mr=".2rem" /> 10 = $0.1
            </Text>
            <Text opacity=".7" fontSize="md">
              (1 gem = 1 cent)
            </Text>
          </Flex>
          <Text>We collect a service fee during video calls.</Text>
          <Text
            color="rgba(255, 255, 255, 0.7)"
            sx={{
              "> b": {
                color: "white",
                fontWeight: "medium",
              },
            }}
          >
            For example, if you set your rate to <b style={{ color: "#AF26FF" }}>250 gems</b>{" "}
            ($0.25), your earnings are <b style={{ color: "#A0FEA0" }}>$0.19</b> <b>per second</b>.
          </Text>
        </Flex>
        <Flex flexDir="column" gridGap="1rem">
          <Text fontSize="2xl" fontWeight="semibold">
            Set your secondly rate for video chat
          </Text>
          <Form
            schema={EditUser}
            initialValues={{ price: user?.price || 0 }}
            onSubmit={async (values) => {
              try {
                await editUserMutation({
                  price: values.price || 0,
                })
              } catch (error) {
                return { [FORM_ERROR]: error.message || error.toString() }
              }
            }}
            submitText="Continue"
          >
            {({ values }) => (
              <Flex flexDir="column" gridGap=".5rem" mb="2rem" textAlign="left">
                <LabeledTextField
                  name="price"
                  label="Price per second"
                  placeholder="Price"
                  type="number"
                  inputLeftElement={<Gem boxSize={5} />}
                />
                <Text fontWeight="medium" ml=".5rem">
                  {values.price ? (
                    <>$ {numberWithCommas(gemsToDollar(values.price ?? 0))} / second</>
                  ) : (
                    <>Free</>
                  )}
                </Text>
              </Flex>
            )}
          </Form>
        </Flex>
      </Flex>
    </Flex>
  )
}

AboutGems.authenticate = true
AboutGems.getLayout = (page) => <Layout title="About gems">{page}</Layout>

export const getServerSideProps = gSSP(getDefaultServerSideProps)

export default AboutGems
