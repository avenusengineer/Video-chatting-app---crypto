export const debounce = (func: (...args: any[]) => void, wait = 0) => {
  let timer: ReturnType<typeof setTimeout>

  return (...args: any[]): any => {
    clearTimeout(timer)

    timer = setTimeout(func, wait, ...args)
  }
}

export default debounce
