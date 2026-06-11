import { apiRequest, USE_MOCK } from './client'
import { mockApi } from './mock'

export async function getChats(userId) {
  if (USE_MOCK) return mockApi.getChats(userId)
  return apiRequest('/chats')
}

export async function createChat(userId, data) {
  if (USE_MOCK) return mockApi.createChat(userId, data)
  return apiRequest('/chats', { method: 'POST', body: data })
}

export async function getChat(chatId) {
  if (USE_MOCK) return mockApi.getChat(chatId)
  return apiRequest(`/chats/${chatId}`)
}

export async function updateChat(chatId, data) {
  if (USE_MOCK) return mockApi.updateChat(chatId, data)
  return apiRequest(`/chats/${chatId}`, { method: 'PATCH', body: data })
}

export async function deleteChat(chatId) {
  if (USE_MOCK) return mockApi.deleteChat(chatId)
  return apiRequest(`/chats/${chatId}`, { method: 'DELETE' })
}

export async function addMessage(chatId, message) {
  if (USE_MOCK) return mockApi.addMessage(chatId, message)
  return apiRequest(`/chats/${chatId}/messages`, { method: 'POST', body: message })
}
