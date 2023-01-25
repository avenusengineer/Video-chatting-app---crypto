import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import { render } from "test/utils"
import Home from "../pages/index"

jest.mock("app/core/hooks/useCurrentUser")
const mockUseCurrentUser = useCurrentUser as jest.MockedFunction<typeof useCurrentUser>

test.skip("renders blitz documentation link", () => {
  // This is an example of how to ensure a specific item is in the document
  // But it's disabled by default (by test.skip) so the test doesn't fail
  // when you remove the the default content from the page

  // This is an example on how to mock api hooks when testing
  mockUseCurrentUser.mockReturnValue({
    id: "ckulibsuh000107mpe7zm0rtz",
    username: "example",
    gems: 0,
    price: 0,
    balance: 0,
    name: "First Lastname",
    email: "user@email.com",
    role: "USER",
    images: [],
    emailVerifiedAt: null,
    kycVerifiedAt: null,
    kycSubmittedAt: null,
    lastSeenAt: null,
    phone: null,
    status: "CONNECTED",
    birthdate: null,
  })

  const { getByText } = render(<Home />)
  const linkElement = getByText(/Documentation/i)
  expect(linkElement).toBeInTheDocument()
})
