import Head from "next/head"
import { useRouter } from "next/router"
import { useSession } from "@blitzjs/auth"
import { useQuery, useQueryErrorResetBoundary, invalidateQuery } from "@blitzjs/rpc"
import { AppProps, ErrorBoundary, ErrorFallbackProps, Routes } from "@blitzjs/next"
import {
  ChakraProvider,
  extendTheme,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
  ModalOverlay,
  withDefaultColorScheme,
  Text,
} from "@chakra-ui/react"
import { AuthenticationError, AuthorizationError } from "blitz"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { FC, ReactNode, useEffect, useState } from "react"
import { withProse } from "@nikolovlazar/chakra-ui-prose"

import { withBlitz } from "app/blitz-client"
import ErrorComponent from "app/core/components/ErrorComponent"
import LoginForm from "app/auth/components/LoginForm"
import CallHistory from "app/core/components/CallHistory"
import Layout from "app/core/components/Layout"
import getCallHistory from "app/users/queries/getCallHistory"
import getCurrentUser from "app/users/queries/getCurrentUser"
import getUser from "app/users/queries/getUser"
import UserProvider from "app/core/contexts/UserProvider"
import { numberWithCommas } from "helpers/number"
import useUserContext from "app/core/hooks/useUserContext"
import Sentry from "integrations/sentry"
import Gem from "app/core/icons/Gem"
import MenuProvider from "app/core/contexts/MenuProvider"
import presence from "app/rooms/queries/presence"
import VideoProvider from "app/core/contexts/VideoProvider"
import Dollar from "app/core/icons/Dollar"
import { gemsToDollar } from "helpers/price"
import IncomingCallButton from "app/rooms/components/IncomingCallButton"

// Add relative time extension
dayjs.extend(relativeTime)

const theme = extendTheme(
  {
    components: {
      Button: {
        variants: {
          solid: {
            color: "white",
          },
          outline: {
            color: "white",
            borderColor: "white",
          },
        },
      },
      Tabs: {
        baseStyle: {
          tab: {
            opacity: 0.5,
            borderColor: "rgba(255, 255, 255, 0.5)",
            _selected: {
              opacity: 1,
            },
          },
        },
      },
      PinInput: {
        baseStyle: {
          backgroundColor: "white !important",
          color: "black",
          height: "4rem",
          width: "4rem",
          fontWeight: "bold",
          fontSize: "4xl",
          borderRadius: "1rem",
        },
        defaultProps: {
          size: "",
        },
      },
      PinInputField: {
        defaultProps: {
          width: "4rem !important",
          height: "4rem !important",
        },
      },
      Menu: {
        baseStyle: {
          list: {
            zIndex: 1000,
            bg: "#1D1A1E",
            color: "white",
            border: "none",
          },
          item: {
            bg: "transparent",
            _hover: {
              bg: "rgba(255, 255, 255, 0.2)",
            },
          },
        },
      },
    },
    config: {
      initialColorMode: "dark",
      useSystemColorMode: false,
    },
    breakpoints: {
      sm: "30em",
      md: "48em",
      lg: "62em",
      xl: "80em",
      "2xl": "96em",
      "3xl": "112em",
      "4xl": "128em",
    },
    styles: {
      global: {
        "div[role=tablist]": {
          borderBottom: "1px solid",
        },
        "button[role=tab]": {
          borderBottom: "0 solid",
          _selected: {
            borderBottom: "3px solid",
            marginBottom: "-2px",
            color: "white",
          },
        },
        "div[role=status]": {
          minWidth: "initial !important",
          "> div[role=alert]": {
            paddingY: ".5rem",
            paddingX: "1.25rem",
            "> span": {
              display: "none",
            },
          },
        },
        "#__next": {
          minHeight: "100vh",
        },
        "html, body": {
          height: "100vh",
          margin: 0,
          zIndex: -2,
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          background: "linear-gradient(90deg, rgb(21, 15, 26) 0%, rgb(10, 7, 12) 100%)",
          backgroundColor: "rgb(10, 7, 12)",
          color: "#FFF",
          lineHeight: "tall",
        },
        "::selection": {
          backgroundColor: "#B026FF",
          textShadow: "none",
          color: "#FFFFFF",
        },
      },
    },
  },
  withDefaultColorScheme({
    colorScheme: "whiteAlpha",
  }),
  withProse()
)

const CreatorWrapper: FC<{ children?: ReactNode }> = ({ children }) => {
  const router = useRouter()
  const session = useSession({ suspense: false })
  const [{ onlineIndicatorEnabled }] = useUserContext()

  useQuery(presence, null, {
    enabled: session?.role === "CREATOR" && onlineIndicatorEnabled,
    refetchIntervalInBackground: true,
    refetchInterval: 5000,
    suspense: false,
  })

  const displayCallModal =
    session.role === "CREATOR" && router.pathname !== "/room/[id]" && router.pathname !== "/"

  return (
    <>
      {displayCallModal && <IncomingCallButton onClick={() => router.push(Routes.Home())} />}
      {children}
    </>
  )
}

const VideoHistoryModal = () => {
  const router = useRouter()
  const [user] = useQuery(getCurrentUser, null, {
    suspense: false,
    keepPreviousData: true,
  })
  const [showCallModal, setShowCallModal] = useState(false)
  const session = useSession({ suspense: false })
  const [calls = []] = useQuery(getCallHistory, null, {
    enabled: !!session.userId && router.pathname !== "/room/[id]" && !showCallModal,
    suspense: false,
    refetchInterval: 10000,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    onSuccess: async (data) => {
      if (data.length > 0) {
        await invalidateQuery(getUser)
        setShowCallModal(true)
      }
    },
    onError: () => {},
  })

  const totalSpent = gemsToDollar(
    calls.reduce(
      (total, { price, author, fee }) =>
        author.id === user?.id ? total - price! : total + (price! - fee!),
      0
    )
  )

  return (
    <Modal
      onClose={() => setShowCallModal(false)}
      isOpen={showCallModal && calls.length > 0 && !!user}
      isCentered
    >
      <ModalOverlay />
      <ModalContent
        backgroundColor="rgba(255, 255, 255, 0.05)"
        borderRadius="xl"
        overflow="hidden"
        backdropFilter="blur(50px)"
        css={{
          "@supports not (backdrop-filter: blur)": {
            backgroundColor: "#0A070C",
          },
        }}
      >
        <ModalHeader textAlign="center" borderBottom="1px solid rgba(255, 255, 255, 0.25)">
          Video Call Summary
          <ModalCloseButton onClick={() => setShowCallModal(false)} />
        </ModalHeader>
        <ModalBody pb="2rem" maxH="80vh" overflowY="auto">
          <Flex flexDir="column" gridGap="2rem">
            <Flex flexDir="column" css="*:not(:first-child) { border-top: none; }">
              {calls.map((call) => (
                <CallHistory key={call.id} call={call} user={user!} />
              ))}
            </Flex>
            <Flex flexDir="column" fontWeight="medium" gridGap="1rem">
              {calls.length > 1 && (
                <Flex flexDir="row" justifyContent="space-between">
                  <Text>Total {totalSpent >= 0 ? "earned" : "spent"}</Text>
                  <Text>
                    {totalSpent >= 0 ? (
                      <Flex flexDir="row" alignItems="center" color="#75FF26">
                        <Dollar boxSize={4} color="#75FF26" />
                        {numberWithCommas(gemsToDollar(totalSpent))}
                      </Flex>
                    ) : (
                      <Flex flexDir="row" alignItems="center" gridGap="0.3rem" color="#EB5545">
                        {numberWithCommas(totalSpent)}
                        <Gem boxSize={5} />
                      </Flex>
                    )}
                  </Text>
                </Flex>
              )}
              {totalSpent < 0 && (
                <Flex flexDir="row" justifyContent="space-between">
                  <Text>Remaining balance</Text>
                  <Text>{numberWithCommas(user?.gems ?? 0)}</Text>
                </Flex>
              )}
            </Flex>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

const AppWrapper: FC<{ children?: ReactNode }> = ({ children }) => {
  const session = useSession({ suspense: false })
  const [user] = useQuery(getCurrentUser, null, {
    suspense: false,
    enabled: session.role === "USER",
  })

  useEffect(() => {
    if (session.userId) {
      Sentry.setUser({
        id: session.userId.toString(),
        username: session.username,
      })
    }
  }, [session])

  return (
    <>
      {session.userId && <VideoHistoryModal />}
      {(user?.role || session.role) === "CREATOR" && <CreatorWrapper />}
      {children}
    </>
  )
}

export default withBlitz(function App({ Component, pageProps }: AppProps) {
  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>)
  const [changeOrientation, setChangeOrientation] = useState(false)
  const orientationChange = () => {
    switch (window.orientation) {
      case 0:
        setChangeOrientation(false)
        break
      case 90:
      case -90:
        setChangeOrientation(true)
        break
      default:
        break
    }
  }

  useEffect(() => {
    window.addEventListener("orientationchange", orientationChange)
    if (window.orientation === 90 || window.orientation === -90) {
      setChangeOrientation(true)
    } else {
      setChangeOrientation(false)
    }
    return () => {
      window.removeEventListener("orientationchange", orientationChange)
    }
  }, [])

  return (
    <>
      <Head>
        <meta name="theme-color" content="#110B14" />
        <meta
          name="description"
          content="Meet your favorite creators with pay-per-second Video Chat."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
      </Head>
      <ChakraProvider theme={theme}>
        <ErrorBoundary
          FallbackComponent={RootErrorFallback}
          onReset={useQueryErrorResetBoundary().reset}
          onError={(error, componentStack) => {
            Sentry.captureException(error, { contexts: { react: { componentStack } } })
          }}
        >
          <UserProvider>
            <MenuProvider>
              <VideoProvider onError={(error) => console.error("Video error:", error)}>
                <AppWrapper>
                  {changeOrientation && (
                    <Flex
                      position="absolute"
                      top="0"
                      left="0"
                      w="100%"
                      h="100%"
                      zIndex="999"
                      justifyContent="center"
                      alignItems="center"
                      backgroundColor="rgba(0, 0, 0, 0.5)"
                      overflow="hidden"
                    >
                      <Flex
                        flexDir="column"
                        alignItems="center"
                        justifyContent="center"
                        backgroundColor="#201727"
                        borderRadius="0.5rem"
                        p="3rem"
                        gridGap="1rem"
                        color={theme.colors.white}
                      >
                        <Text fontSize="xl" fontWeight="bold">
                          Please rotate your device
                        </Text>
                        <Text fontSize="md" fontWeight="medium">
                          For a better experience for mobile devices.
                        </Text>
                      </Flex>
                    </Flex>
                  )}
                  {getLayout(<Component {...pageProps} />)}
                </AppWrapper>
              </VideoProvider>
            </MenuProvider>
          </UserProvider>
        </ErrorBoundary>
      </ChakraProvider>
    </>
  )
})

function RootErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  if (error instanceof AuthenticationError) {
    return (
      <Layout>
        <Flex w="100%" justifyContent="center">
          <LoginForm onSuccess={resetErrorBoundary} />
        </Flex>
      </Layout>
    )
  } else if (error instanceof AuthorizationError) {
    return (
      <Layout>
        <ErrorComponent
          statusCode={error.statusCode}
          title="Sorry, you are not authorized to access this"
        />
      </Layout>
    )
  }

  Sentry.captureException(error)

  return (
    <Layout>
      <Flex w="100%" h="100%">
        <ErrorComponent statusCode={error.statusCode || 400} title={error.message || error.name} />
      </Flex>
    </Layout>
  )
}
