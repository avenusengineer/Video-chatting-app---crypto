import { resolver } from "@blitzjs/rpc"
import fetch from "node-fetch"
import { Country } from "react-phone-number-input"

interface IpAPIResponse {
  country: string
  country_code: string
  country_calling_code: string
  error: boolean
}

export default resolver.pipe(async (_, { ipAddress }) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => {
    controller.abort()
  }, 2000) // 2 seconds

  let countryCode: Country = "US"

  try {
    const response = await fetch(`https://ipapi.co/${ipAddress}/json/`, {
      signal: controller.signal,
    })
    const { country_code } = (await response.json()) as IpAPIResponse
    countryCode = country_code as Country
  } catch (error) {
    console.error("Failed to get user's country code. Error:", error)
  } finally {
    clearTimeout(timeout)
  }

  return { countryCode }
})
