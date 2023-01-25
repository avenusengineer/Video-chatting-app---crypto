import { UserStatus } from "db"

export interface OnlineIndicatorProps {
  status?: UserStatus
}

const getStatusColor = (status: UserStatus): string => {
  switch (status) {
    case "CONNECTED":
      return "#75FF26"
    case "DISCONNECTED":
      return "red"
    case "AWAY":
      return "orange"
  }
}

const OnlineIndicator = ({ status = "AWAY" }: OnlineIndicatorProps) => (
  <span
    style={{
      height: "12px",
      width: "12px",
      backgroundColor: getStatusColor(status),
      borderRadius: "50%",
      display: "inline-block",
      zIndex: 1,
    }}
  />
)

export default OnlineIndicator
