import { Flex, FlexProps, Image, Text } from "@chakra-ui/react"

import useBlurHash from "app/core/hooks/useBlurHash"

export interface ProfilePictureProps extends FlexProps {
  size?: string
  fontSize?: string
  url?: string | null
  imageHash?: string | null
  name: string
}

const ProfilePicture = ({
  name,
  url,
  imageHash,
  size = "4rem",
  fontSize = "2xl",
  borderRadius = "lg",
  ...props
}: ProfilePictureProps): JSX.Element => {
  const blurHash = useBlurHash(imageHash)

  return (
    <Flex
      backgroundColor="white"
      w={size}
      h={size}
      alignItems="center"
      justifyContent="center"
      borderRadius={borderRadius}
      {...props}
    >
      {url ? (
        <Image
          src={url}
          alt="Profile picture"
          objectFit="cover"
          w="100%"
          h="100%"
          borderRadius={borderRadius}
          {...(blurHash && {
            blurDataURL: blurHash,
            placeholder: "blur",
          })}
        />
      ) : (
        <Text color="black" fontSize={fontSize}>
          {name
            .split(" ")
            .map((word) => word[0])
            .join("")}
        </Text>
      )}
    </Flex>
  )
}

export default ProfilePicture
