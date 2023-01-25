import Head from "next/head"
import { ErrorComponent as DefaultErrorComponent } from "@blitzjs/next"
import { Flex, Heading } from "@chakra-ui/react"
import { ComponentProps } from "react"

const ErrorComponent = ({ statusCode, title }: ComponentProps<typeof DefaultErrorComponent>) => (
  <Flex
    h="100%"
    w="100%"
    py="5rem"
    textAlign="center"
    flexDir="column"
    alignItems="center"
    justifyContent="center"
  >
    <Head>
      <title>
        {statusCode
          ? `${statusCode}: ${title}`
          : "Application error: a client-side exception has occurred"}
      </title>
    </Head>
    <Flex display="inline-block" textAlign="center" verticalAlign="middle">
      <style dangerouslySetInnerHTML={{ __html: "body { margin: 0 }" }} />
      {statusCode ? (
        <Heading as="h1" fontSize="8xl">
          {statusCode}
        </Heading>
      ) : null}
      <Flex px="1rem">
        <Heading as="h2" maxW="90vw" overflowWrap="break-word" display="inline-block">
          {title || statusCode ? (
            title
          ) : (
            <>
              Application error: a client-side exception has occurred (see the browser console for
              more information)
            </>
          )}
          .
        </Heading>
      </Flex>
    </Flex>
  </Flex>
)

export default ErrorComponent
