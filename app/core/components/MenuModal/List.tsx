import Link from "next/link"
import Image from "next/image"
import { Routes } from "@blitzjs/next"
import { useQuery, useMutation, invalidateQuery } from "@blitzjs/rpc"
import { Box, Flex, Text } from "@chakra-ui/react"
import { Star } from "react-feather"

import removeFavorite from "app/users/mutations/removeFavorite"
import getFavorites from "app/users/queries/getFavorites"
import Gem from "app/core/icons/Gem"
import OnlineIndicator from "app/core/components/OnlineIndicator"

const List = () => {
  const [favorites = []] = useQuery(getFavorites, null, {
    suspense: false,
  })

  const [removeFavoriteMutation] = useMutation(removeFavorite, {
    onSuccess: async () => {
      await invalidateQuery(getFavorites)
    },
  })

  return (
    <Flex flexDir="column" gridGap="2rem">
      <Text fontSize="xl" fontWeight="semibold">
        My list
      </Text>
      {favorites.length === 0 && (
        <Flex alignItems="center" bg="rgba(255, 255, 255, 0.05)" h="md" w="100%" borderRadius="lg">
          <Flex flexDir="column" alignItems="center" w="100%" gridGap="1.5rem">
            <Text fontWeight="medium" fontSize="md" opacity=".75" textAlign="center">
              You have never
              <br />
              added any creators yet
            </Text>
            <Star size="3.5rem" />
          </Flex>
        </Flex>
      )}
      {favorites.map(({ id, username, images, name, status, price }) => (
        <Link key={id} href={Routes.User({ username })}>
          <a>
            <Box
              borderRadius="3xl"
              overflow="hidden"
              px="1rem"
              py="1rem"
              h={["18rem", "28rem"]}
              w="100%"
              position="relative"
              backgroundColor={!images[0]?.url ? "rgba(196, 196, 196, 0.1)" : undefined}
            >
              {images[0] && (
                <>
                  <Image
                    alt="thumbnail"
                    objectFit="cover"
                    objectPosition="center center"
                    loader={() => images[0]!.url}
                    src={images[0].url}
                    layout="fill"
                    //placeholder="blur"
                    //blurDataURL={imageUrl}
                  />
                  <Flex
                    position="absolute"
                    width="100%"
                    height="100%"
                    boxShadow="inset 0 0 100px rgba(0, 0, 0, 0.5)"
                    top={0}
                    left={0}
                  />
                </>
              )}
              <Flex flexDir="row" justifyContent="space-between">
                <Flex flexDir="column" zIndex={1}>
                  <Text fontWeight="bold" fontSize="xl" lineHeight="1.5rem" m={0}>
                    {name}
                  </Text>
                  <Text fontWeight="bold">@{username}</Text>
                </Flex>
                <OnlineIndicator status={status} />
              </Flex>
              <Flex position="absolute" left=".5rem" bottom=".5rem">
                <Box
                  backdropFilter="blur(20px)"
                  bg="rgba(10, 7, 13, 0.5)"
                  onClick={(evt) => {
                    evt.preventDefault()
                    removeFavoriteMutation({ username })
                  }}
                  borderRadius="full"
                  w="3rem"
                  h="3rem"
                  alignContent="center"
                  justifyContent="center"
                  p=".5rem"
                >
                  <Star fill="white" cursor="pointer" width="100%" height="100%" />
                </Box>
              </Flex>
              <Flex
                position="absolute"
                bottom={0}
                right={0}
                backdropFilter="blur(20px)"
                bg="rgba(10, 7, 13, 0.5)"
                w={["100%", "50%"]}
                borderTopLeftRadius={["0", "20px"]}
                borderRightRadius="0"
                borderBottomLeftRadius="0"
                justifyContent="center"
              >
                <Flex px="1rem" py=".5rem" alignItems="flex-end" gridGap=".2rem">
                  <Gem boxSize={6} />
                  <Text>
                    <Text fontWeight="bold" mr={1} as="b">
                      {price}
                    </Text>
                    /sec
                  </Text>
                </Flex>
              </Flex>
            </Box>
          </a>
        </Link>
      ))}
    </Flex>
  )
}

export default List
