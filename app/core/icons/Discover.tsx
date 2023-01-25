import { memo } from "react"
import { createIcon, IconProps } from "@chakra-ui/react"

const Discover = createIcon({
  displayName: "Discover",
  viewBox: "0 0 95.69 62.85",
  defaultProps: {
    color: "white",
  },
  path: (
    <>
      <path d="M3.3 5.3v52.26c0 1.1.9 2 2 2h55.48c15.53 0 28.13-12.59 28.13-28.13C88.91 15.9 76.32 3.3 60.78 3.3H5.3c-1.11 0-2 .89-2 2z" />
      <path
        fill="currentColor"
        d="M10.06 25.1H6.51v12.38h3.53c1.87 0 3.23-.44 4.42-1.43 1.41-1.17 2.25-2.93 2.25-4.75-.01-3.65-2.74-6.2-6.65-6.2zm2.82 9.3c-.76.68-1.74.98-3.3.98h-.65V27.2h.65c1.56 0 2.51.28 3.3 1 .84.74 1.34 1.9 1.34 3.08 0 1.19-.51 2.38-1.34 3.12zM17.82 25.1h2.41v12.38h-2.41zM26.13 29.85c-1.45-.54-1.87-.89-1.87-1.56 0-.78.76-1.37 1.8-1.37.72 0 1.32.3 1.95 1l1.26-1.65a5.41 5.41 0 0 0-3.64-1.37c-2.19 0-3.86 1.52-3.86 3.55 0 1.71.78 2.58 3.05 3.39.94.33 1.43.56 1.67.7.48.31.72.76.72 1.28 0 1-.8 1.75-1.88 1.75-1.15 0-2.08-.58-2.64-1.65l-1.56 1.5c1.11 1.63 2.45 2.36 4.29 2.36 2.51 0 4.27-1.67 4.27-4.06 0-1.97-.81-2.86-3.56-3.87zM30.46 31.3c0 3.64 2.86 6.46 6.53 6.46 1.04 0 1.93-.2 3.03-.72V34.2c-.97.97-1.82 1.36-2.92 1.36-2.43 0-4.16-1.76-4.16-4.27 0-2.38 1.78-4.25 4.05-4.25 1.15 0 2.02.41 3.03 1.39v-2.84c-1.06-.54-1.93-.76-2.97-.76-3.66-.01-6.59 2.87-6.59 6.47zM59.16 33.42l-3.3-8.32h-2.64l5.26 12.7h1.3l5.34-12.7h-2.61zM66.22 37.48h6.84v-2.09h-4.43v-3.34h4.27v-2.1h-4.27V27.2h4.43v-2.1h-6.84zM82.63 28.76c0-2.32-1.6-3.65-4.38-3.65h-3.58v12.38h2.41v-4.97h.32l3.34 4.97h2.97l-3.9-5.22c1.81-.37 2.82-1.62 2.82-3.51zm-4.85 2.04h-.71v-3.75h.74c1.5 0 2.32.63 2.32 1.84.01 1.24-.81 1.91-2.35 1.91zM84.55 25.75c0-.22-.15-.34-.41-.34h-.35v1.09h.26v-.42l.31.42h.32l-.36-.45c.14-.03.23-.14.23-.3zm-.46.15h-.04v-.29h.05c.13 0 .2.05.2.14-.01.1-.08.15-.21.15z"
      />
      <path
        fill="currentColor"
        d="M84.19 25.01c-.53 0-.95.42-.95.95s.43.95.95.95.94-.43.94-.95-.43-.95-.94-.95zm-.01 1.73a.77.77 0 0 1-.76-.78c0-.43.34-.78.76-.78s.75.36.75.78c.01.43-.33.78-.75.78zM53.91 31.28c0 3.62-2.93 6.56-6.56 6.56s-6.56-2.93-6.56-6.56c0-3.62 2.93-6.56 6.56-6.56s6.56 2.94 6.56 6.56z"
      />
      <path
        fill="currentColor"
        d="M90.39 2.3H5.3c-1.66 0-3 1.34-3 3v52.26c0 1.66 1.34 3 3 3h85.09c1.66 0 3-1.34 3-3V5.3c0-1.66-1.34-3-3-3zm-1.48 29.13c0 15.53-12.59 28.13-28.13 28.13H5.3c-1.1 0-2-.9-2-2V5.3c0-1.1.9-2 2-2h55.48c15.53 0 28.13 12.59 28.13 28.13z"
      />
    </>
  ),
})

export default memo(Discover) as React.FC<IconProps>