import { Dispatch, SetStateAction, useEffect, useState } from "react"

const usePersistentState = <T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] => {
  const [state, setState] = useState<T>(
    localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)!) : initialValue
  )

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state))
  }, [state, key])

  return [state, setState]
}

export default usePersistentState
