export const numberWithCommas = (num: number) => {
  return num.toString().replace(/^[+-]?\d+/, (match) => match.replace(/(\d)(?=(\d{3})+$)/g, "$1,"))
}
