import { apiRequest, USE_MOCK } from './client'
import { mockApi } from './mock'

export async function register(data) {
  if (USE_MOCK) return mockApi.register(data)
  return apiRequest('/auth/register', { method: 'POST', body: data, skipAuth: true })
}

export async function login(data) {
  if (USE_MOCK) return mockApi.login(data)
  return apiRequest('/auth/login', { method: 'POST', body: data, skipAuth: true })
}

export async function getMe() {
  if (USE_MOCK) return mockApi.getMe()
  return apiRequest('/auth/me')
}

export async function logout() {
  if (USE_MOCK) return mockApi.logout()
  try {
    await apiRequest('/auth/logout', { method: 'POST' })
  } finally {
    localStorage.removeItem('auth_token')
  }
}
