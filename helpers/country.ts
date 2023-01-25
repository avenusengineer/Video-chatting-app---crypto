// offset between uppercase ascii and regional indicator symbols
const OFFSET = 127397

export const getCountryCodeEmoji = (cc: string) =>
  String.fromCodePoint(
    ...cc
      .toUpperCase()
      .split("")
      .map((c) => (c.codePointAt(0) ?? 0) + OFFSET)
  )
