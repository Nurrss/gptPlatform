import { apiRequest, USE_MOCK } from './client'
import { mockApi } from './mock'
import { getModeById } from '../config/teacherModes'

export async function getAgents() {
  if (USE_MOCK) return mockApi.getAgents()
  return apiRequest('/agents')
}

export async function sendToAgent(modeId, payload) {
  if (USE_MOCK) return mockApi.sendToAgent(modeId, payload)

  const mode = getModeById(modeId)
  const agentConfig = payload.agentConfig
  const endpoint = agentConfig?.apiUrl || mode?.endpoint || `/agents/${modeId}/check`

  return apiRequest(endpoint, {
    method: 'POST',
    body: {
      messages: payload.messages,
      chat_id: payload.chatId,
      mode_id: modeId,
      model: agentConfig?.model,
    },
    headers: {
      ...(agentConfig?.apiKey && { Authorization: `Bearer ${agentConfig.apiKey}` }),
      ...(import.meta.env.VITE_AGENT_API_KEY && {
        'X-API-Key': import.meta.env.VITE_AGENT_API_KEY,
      }),
    },
  })
}

export async function sendToAgentStream(modeId, payload, onChunk) {
  if (USE_MOCK) {
    const response = await mockApi.sendToAgent(modeId, payload)
    const words = response.content.split(' ')
    let content = ''
    for (const word of words) {
      content += (content ? ' ' : '') + word
      onChunk(content)
      await new Promise((r) => setTimeout(r, 20))
    }
    return { role: 'assistant', content }
  }

  const mode = getModeById(modeId)
  const agentConfig = payload.agentConfig
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
  const url = agentConfig?.apiUrl || `${baseUrl}${mode?.endpoint || `/agents/${modeId}/check/stream`}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(localStorage.getItem('auth_token') && {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      }),
      ...(agentConfig?.apiKey && { 'X-Agent-Key': agentConfig.apiKey }),
      ...(import.meta.env.VITE_AGENT_API_KEY && {
        'X-API-Key': import.meta.env.VITE_AGENT_API_KEY,
      }),
    },
    body: JSON.stringify({
      messages: payload.messages,
      chat_id: payload.chatId,
      mode_id: modeId,
      model: agentConfig?.model,
      stream: true,
    }),
  })

  if (!response.ok) throw new Error('Ошибка API агента')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let content = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value, { stream: true })
    content += chunk
    onChunk(content)
  }

  return { role: 'assistant', content }
}
