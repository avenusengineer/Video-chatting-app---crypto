import { Dispatch, useEffect, useState } from "react"

const useTimer = (isPaused = false): [number, Dispatch<number>] => {
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    if (!isPaused) {
      const timer = setInterval(() => setElapsedTime((elapsedTime) => elapsedTime + 0.1), 100)
      return () => clearInterval(timer)
    }
  }, [isPaused])

  return [Math.floor(elapsedTime), setElapsedTime]
}

export default useTimer
