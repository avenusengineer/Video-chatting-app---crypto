import { createContext, ReactNode, useReducer } from "react"

export type MenuPage =
  | "MAIN"
  | "WALLET"
  | "SETTINGS"
  | "EARN"
  | "LIST"
  | "EDIT_PROFILE"
  | "EARNINGS"
export type MenuWalletPage = "MAIN" | "DEPOSIT" | "WITHDRAW" | "PAYMENT_METHODS"
export type MenuSettingsPage = "MAIN" | "CHANGE_PASSWORD" | "PRIVACY_SETTINGS" | "LEGAL"

export type IPageContext =
  | {
      page: Exclude<MenuPage, "WALLET" | "SETTINGS" | "EDIT_PROFILE">
    }
  | {
      page: "WALLET"
      subPage: Exclude<MenuWalletPage, "DEPOSIT">
    }
  | {
      page: "WALLET"
      subPage: "DEPOSIT"
      amount?: number
    }
  | {
      page: "SETTINGS"
      subPage: MenuSettingsPage
    }
  | {
      page: "EDIT_PROFILE"
      autoFocus?: boolean
    }

export type IMenuContext = {
  isOpen: boolean
} & IPageContext

const initialState: IMenuContext = {
  isOpen: false,
  page: "MAIN",
}

export type MenuAction =
  | {
      type: "SET_PAGE"
      payload: IPageContext
    }
  | {
      type: "SET_IS_OPEN"
      payload:
        | {
            isOpen: false
          }
        | ({
            isOpen: true
          } & Partial<IPageContext>)
    }

export type MenuActionType = MenuAction["type"]

export const MenuContext = createContext<{
  state: IMenuContext
  dispatch: React.Dispatch<MenuAction>
}>({
  state: initialState,
  dispatch: () => null,
})

const menuReducer = (state: IMenuContext, action: MenuAction) => {
  switch (action.type) {
    case "SET_PAGE":
      // Force element to scroll to top
      document.getElementById("menu-container")?.scrollTo(0, 0)

      return {
        ...state,
        ...action.payload,
        isOpen: true,
      }
    case "SET_IS_OPEN":
      if (!action.payload.isOpen) {
        return {
          ...state,
          isOpen: false,
          page: "MAIN",
        }
      }

      return {
        ...state,
        ...action.payload,
      }
    default:
      return state
  }
}

const MenuProvider: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(menuReducer, initialState)

  return (
    <MenuContext.Provider value={{ state: state as IMenuContext, dispatch }}>
      {children}
    </MenuContext.Provider>
  )
}

export default MenuProvider
