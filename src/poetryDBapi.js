import { POETRY_DB_BASE_URL } from './config.js'

export async function getPoems(params) {
  const url = `${POETRY_DB_BASE_URL}/${params}`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`API error: ${response.status} - ${error.message || ''}`)
    }

    return response.json()
  } catch (error) {
    console.log(error)
    throw error
  }
}
