import Link from "next/link"
import Image from "next/image"
import { Routes } from "@blitzjs/next"
import { Flex, FlexProps, Heading } from "@chakra-ui/react"
import { FC, ReactNode } from "react"

interface ContainerFormProps extends FlexProps {
  id?: string
  heading?: ReactNode
  children?: ReactNode
  hideLogo?: boolean
}

const ContainerForm: FC<ContainerFormProps> = ({ id, heading, children, hideLogo, ...props }) => (
  <Flex
    id={id}
    flexDir="column"
    bg="#201727"
    borderRadius="20px"
    gridGap="2rem"
    px={["20px", "60px", "90px"]}
    py={["1rem", "2rem"]}
    maxW="600px"
    minH={["md", "lg"]}
    justify="flex-start"
    w="full"
    {...props}
  >
    <Flex flexDir="column" h="full">
      <Flex flexDir="column" alignItems="center" mb="2rem">
        {!hideLogo && (
          <Link href={Routes.Home()}>
            <a style={{ cursor: "pointer" }}>
              <Image src="/logo.svg" alt="logo" width="60rem" height="60rem" layout="fixed" />
            </a>
          </Link>
        )}
        {heading && (
          <Heading w="full" mx="auto" mt="1rem" fontSize={["xl", "3xl"]} textAlign="center">
            {heading}
          </Heading>
        )}
      </Flex>

      {children}
    </Flex>
  </Flex>
)

export default ContainerForm
