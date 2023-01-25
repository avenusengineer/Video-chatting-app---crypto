import Link from "next/link"
import Image from "next/image"
import { Routes } from "@blitzjs/next"
import { Container, Flex, FlexProps } from "@chakra-ui/react"
import { FC, Suspense } from "react"

import UserInfo from "./UserInfo"

export type LayoutProps = {
  hideNavigation?: boolean
} & FlexProps

const Layout: FC<LayoutProps> = ({ hideNavigation, children, ...props }) => (
  <Flex w="100vw" h="100%" pt={[".5rem", "2rem"]} px={["none", "2rem"]} {...props}>
    <Container maxW={["100vw", "xxl"]} centerContent w="100%" h="100%">
      <Flex
        h="100%"
        as="nav"
        role="navigation"
        flexDir="row"
        justifyContent="space-between"
        alignItems="center"
        w="100%"
        px={[".5rem", "5rem"]}
      >
        {hideNavigation ? (
          <div />
        ) : (
          <Link href={Routes.Home()}>
            <a>
              <Image src="/logo.svg" alt="logo" width={48} height={48} layout="fixed" />
            </a>
          </Link>
        )}
        <UserInfo />
      </Flex>
      <Flex my="2rem" w="100%" h="100%">
        <Suspense fallback={null}>{children}</Suspense>
      </Flex>
    </Container>
  </Flex>
)

export default Layout
