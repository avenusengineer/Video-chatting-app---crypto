import { BlitzPage } from "@blitzjs/next"
import { Flex, Heading, Link, Text } from "@chakra-ui/react"

import { gSSP } from "app/blitz-server"
import getDefaultServerSideProps from "app/core/helpers/getDefaultServerSideProps"
import Layout from "app/core/layouts/Layout"

const Contact: BlitzPage = () => (
  <Flex w="100%" justifyContent="center" alignItems="center">
    <Flex
      flexDir="column"
      gridGap="2rem"
      w="container.sm"
      textAlign="center"
      justifyContent="center"
      alignItems="center"
      bgColor="#201727"
      borderRadius="lg"
      p="2rem"
    >
      <Flex flexDir="column" w="sm" gridGap=".5rem">
        <Heading>Contact Us</Heading>
        <Text opacity=".75" fontWeight="medium">
          We’d love to talk about how we can support you and improve your experience on Seconds.
        </Text>
      </Flex>
      <Flex flexDir="column" fontSize="large">
        <Link href="mailto:hello@seconds.app">hello@seconds.app</Link>
        <Link href="tel:+1-551-804-7124">+1 (551) 804-7124</Link>
        <Text>251 Little Falls Drive Wilmington, DE 19808 United States</Text>
      </Flex>
    </Flex>
    <Flex left="0" bottom="0" position="fixed" p="1rem" opacity=".5" gridGap="1rem">
      <Link href="/terms">Terms</Link>
      <Link href="/privacy">Privacy</Link>
    </Flex>
  </Flex>
)

Contact.getLayout = (page) => <Layout title="Contact Us">{page}</Layout>

export const getServerSideProps = gSSP(getDefaultServerSideProps)

export default Contact
