import { createContext, Dispatch, ReactNode, useState, SetStateAction } from "react"

export interface ILoginFormContext {
  login?: string
  isPhone?: boolean
}

const defaultValue: ILoginFormContext = {}

export const LoginFormContext = createContext<
  [ILoginFormContext, Dispatch<SetStateAction<ILoginFormContext>>]
>([defaultValue, () => {}])

interface LoginFormProviderProps {
  children: ReactNode
}

export const LoginFormProvider = ({ children }: LoginFormProviderProps) => {
  const [value, setValue] = useState<ILoginFormContext>(defaultValue)

  return <LoginFormContext.Provider value={[value, setValue]}>{children}</LoginFormContext.Provider>
}

export default LoginFormProvider
