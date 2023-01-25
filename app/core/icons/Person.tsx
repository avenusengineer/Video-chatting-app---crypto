import { memo } from "react"
import { createIcon, IconProps } from "@chakra-ui/react"

const Person = createIcon({
  displayName: "Person",
  viewBox: "0 0 15 15",
  defaultProps: {
    color: "white",
  },
  path: (
    <>
      <path
        fill="currentColor"
        d="M7.5 7.5a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5zm0 1.875c-2.503 0-7.5 1.256-7.5 3.75V15h15v-1.875c0-2.494-4.997-3.75-7.5-3.75z"
      ></path>
    </>
  ),
})

export default memo(Person) as React.FC<IconProps>
