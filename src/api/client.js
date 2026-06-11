const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

function getToken() {
  return localStorage.getItem('auth_token')
}

export function isMockMode() {
  return USE_MOCK
}

export async function apiRequest(endpoint, options = {}) {
  const { method = 'GET', body, headers = {}, skipAuth = false } = options

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  }

  if (!skipAuth) {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }

  if (body !== undefined) {
    config.body = JSON.stringify(body)
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Ошибка сервера' }))
    throw new Error(error.message || error.detail || `HTTP ${response.status}`)
  }

  if (response.status === 204) return null
  return response.json()
}

export { BASE_URL, USE_MOCK }
