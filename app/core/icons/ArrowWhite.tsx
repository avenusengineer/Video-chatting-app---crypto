import { memo } from "react"
import { createIcon, IconProps } from "@chakra-ui/react"

const ArrowWhite = createIcon({
  displayName: "ArrowWhite",
  viewBox: "0 0 14 24",
  defaultProps: {
    color: "white",
    fill: "white",
  },
  d: "M9.43388 11.8129L0.496881 20.7429C0.180743 21.06 0.00350761 21.4896 0.00416374 21.9374C0.00481987 22.3851 0.183315 22.8143 0.500381 23.1304C0.817448 23.4465 1.24711 23.6238 1.69486 23.6231C2.1426 23.6224 2.57174 23.444 2.88788 23.1269L13.0129 13.0129C13.3188 12.7058 13.4946 12.2926 13.5037 11.8592C13.5128 11.4258 13.3546 11.0056 13.0619 10.6859L2.89488 0.492889C2.57874 0.175823 2.1496 -0.0026722 1.70186 -0.00332832C1.25411 -0.00398445 0.824448 0.173252 0.507381 0.489389C0.190315 0.805527 0.0118198 1.23467 0.0111637 1.68242C0.0105076 2.13016 0.187743 2.55982 0.503881 2.87689L9.43388 11.8129Z",
})

export default memo(ArrowWhite) as React.FC<IconProps>