import { Facebook, Instagram, Link as LinkIcon, Twitter, Youtube } from "react-feather"
import { Flex, Icon, Text } from "@chakra-ui/react"

import { UserLink } from "db"
import Tiktok from "./Tiktok"

const getLinkIcon = (type: UserLink["type"]) => {
  switch (type) {
    case "TWITTER":
      return Twitter
    case "FACEBOOK":
      return Facebook
    case "YOUTUBE":
      return Youtube
    case "INSTAGRAM":
      return Instagram
    case "TIKTOK":
      return Tiktok
    default:
      return LinkIcon
  }
}

interface ProfileLinkProps {
  link: UserLink
}

const ProfileLink = ({ link }: ProfileLinkProps) => (
  <a target="_blank" href={link.url} rel="noreferrer">
    <Flex alignItems="center" gridGap=".2rem">
      <Icon as={getLinkIcon(link.type)} boxSize={5} />
      <Text>{link.name}</Text>
    </Flex>
  </a>
)

export default ProfileLink
