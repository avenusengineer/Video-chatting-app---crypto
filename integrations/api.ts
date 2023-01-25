import FormData from "form-data"

const generateBody = (values: Record<string, unknown>) =>
  Object.entries(values).reduce((formData, [key, value]) => {
    if (value) {
      formData.append(key, value as any)
    }

    return formData
  }, new FormData())

export const newRequester =
  (baseUrl: string, headers?: Record<string, string>) =>
  async <Response = any>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    endpoint: string,
    body?: Record<string, any>,
    contentType: "application/json" | "multipart/form-data" = "application/json"
  ): Promise<Response> => {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method,
      body:
        contentType === "application/json"
          ? JSON.stringify(body)
          : body
          ? (generateBody(body) as never)
          : undefined,
      headers: {
        ...headers,
      },
    })

    return await response.json()
  }
