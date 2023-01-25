export const DOLLAR_TO_GEMS = 100

export const gemsToDollar = (gems: number) =>
  Math.round((gems / DOLLAR_TO_GEMS) * DOLLAR_TO_GEMS) / DOLLAR_TO_GEMS

export const dollarToGems = (dollar: number) => Math.round(dollar * DOLLAR_TO_GEMS)
