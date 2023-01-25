import { newRequester } from "./api"

const { NEXTFORM_BASE_URL = "https://api.nextform.app", NEXT_FORM_API_KEY } = process.env

const client = newRequester(NEXTFORM_BASE_URL, {
  Authorization: NEXT_FORM_API_KEY || "",
})

interface FormEntry {
  id: string
  reference?: string
  type: string
  createdAt: string
  data: W9FormData
  signatures: ReadonlyArray<Signature>
}

interface Signature {
  id: string
  reference?: string
  consent: boolean
  name: string
  email: string
  party: string
  createdAt: string
}

// https://nextform.app/docs/w9-oct-2018
interface W9FormData {
  name: string
  businessName?: string
  taxClassification:
    | "individual"
    | "cCorp"
    | "sCorp"
    | "partnership"
    | "trustOrEstate"
    | "llc"
    | "orother"
  llcClassification?: "c" | "s" | "l"
  otherClassification?: string
  payeeExemption?: string
  factaExemption?: string
  country: string
  address: string
  city: string
  state: string
  zip: string
  account?: string
  ssn?: string
  ein?: string
  hasWithholding: boolean
}

export const listForms = async () => await client<ReadonlyArray<FormEntry>>("GET", "/forms")

export const exportForm = async (id: string) =>
  await client<{ pdf: string }>("GET", `/forms/${id}/pdf`)

interface CreateSession {
  formType: "w9Oct2018"
  reference?: string
  successUrl?: string
  signerEmail?: string
  formData?: Partial<W9FormData>
}

interface CreateSessionResponse {
  id: string
  reference?: any
  status: string
  url: string
  successUrl?: any
  signerEmail?: any
  formType: string
  formData?: any
}

export const createSession = async (data: CreateSession) =>
  await client<CreateSessionResponse>("POST", "/sessions", data)

export const deleteForm = async (id: string) =>
  await client<{ id: string; deleted: boolean }>("DELETE", `/forms/${id}`)
