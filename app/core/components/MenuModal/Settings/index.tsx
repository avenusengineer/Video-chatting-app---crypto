import { FC } from "react"

import { useMenu } from "app/core/hooks/useMenu"
import Main from "./Main"
import ChangePassword from "./ChangePassword"
import PrivacySettings from "./PrivacySettings"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"

interface SettingsProps {
  user: NonNullable<ReturnType<typeof useCurrentUser>>
}

const Settings: FC<SettingsProps> = ({ user }) => {
  const { state } = useMenu()

  if (state.page !== "SETTINGS") return null

  switch (state.subPage) {
    case "MAIN":
      return <Main />
    case "CHANGE_PASSWORD":
      return <ChangePassword />
    case "PRIVACY_SETTINGS":
      return <PrivacySettings user={user} />
    default:
      return null
  }
}

export default Settings
