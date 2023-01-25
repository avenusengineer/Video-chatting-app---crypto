import { memo } from "react"
import { createIcon, IconProps } from "@chakra-ui/react"

const ArrowCircleRight = createIcon({
  displayName: "ArrowCircleRight",
  viewBox: "0 0 27 27",
  defaultProps: {
    color: "white",
  },
  d: "M13.5 0a13.5 13.5 0 1 1 .001 27A13.5 13.5 0 0 1 13.5 0ZM7.185 15.895H13.5v3.86a.653.653 0 0 0 1.115.464l6.222-6.255a.647.647 0 0 0 0-.92l-6.222-6.262a.653.653 0 0 0-1.115.464v3.86H7.185a.655.655 0 0 0-.653.652v3.484a.655.655 0 0 0 .653.653Z",
})

export default memo(ArrowCircleRight) as React.FC<IconProps>
