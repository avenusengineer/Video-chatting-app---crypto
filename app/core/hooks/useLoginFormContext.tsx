import { useContext } from "react"

import { LoginFormContext } from "app/core/contexts/LoginFormProvider"

export const useLoginFormContext = () => {
  const context = useContext(LoginFormContext)
  if (!context) {
    throw new Error("useLoginFormContext must be used within a LoginFormProvider")
  }

  return context
}

export default useLoginFormContext
