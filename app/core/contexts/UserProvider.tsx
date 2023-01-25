import { createContext, Dispatch, ReactNode, useEffect, useState, SetStateAction } from "react"

export interface IUserContext {
  onlineIndicatorEnabled: boolean
}

const defaultValue: IUserContext = {
  onlineIndicatorEnabled: true,
}

export const UserContext = createContext<[IUserContext, Dispatch<SetStateAction<IUserContext>>]>([
  defaultValue,
  () => {},
])

interface UserProviderProps {
  children: ReactNode
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [value, setValue] = useState<IUserContext>(defaultValue)

  useEffect(() => {
    if (defaultValue !== value) {
      localStorage.setItem("user_context_value", JSON.stringify(value))
    }
  }, [value])

  useEffect(() => {
    const rawValue = localStorage.getItem("user_context_value")
    if (rawValue) {
      setValue(JSON.parse(rawValue))
    }
  }, [])

  return <UserContext.Provider value={[value, setValue]}>{children}</UserContext.Provider>
}

export default UserProvider
