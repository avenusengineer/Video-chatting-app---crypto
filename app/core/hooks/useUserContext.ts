import { useContext } from "react"

import { UserContext } from "app/core/contexts/UserProvider"

export const useUserContext = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider")
  }

  return context
}

export default useUserContext
