import { mockApi } from './mock'
import { AI_CONFIG, getAiUrl, isAiConfigured } from '../config/api'

// ─── Content builder ──────────────────────────────────────────
// message = { content, images: [{dataUrl,mediaType}], pdfs: [{dataUrl}] }
function buildAnthropicContent(message) {
  const parts = []

  for (const img of message.images || []) {
    parts.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: img.mediaType || 'image/jpeg',
        data: img.dataUrl.replace(/^data:[^;]+;base64,/, ''),
      },
    })
  }

  // Claude reads PDFs natively — no text extraction needed
  for (const pdf of message.pdfs || []) {
    parts.push({
      type: 'document',
      source: {
        type: 'base64',
        media_type: 'application/pdf',
        data: pdf.dataUrl.replace(/^data:[^;]+;base64,/, ''),
      },
    })
  }

  if (message.content) parts.push({ type: 'text', text: message.content })
  return parts.length ? parts : (message.content || '')
}

function buildOpenAIContent(message) {
  const images = message.images || []
  const pdfs   = message.pdfs   || []

  if (!images.length && !pdfs.length) return message.content

  const parts = images.map((img) => ({
    type: 'image_url',
    image_url: { url: img.dataUrl, detail: 'auto' },
  }))

  // OpenAI doesn't support native PDF — use name as hint
  let text = message.content || ''
  if (pdfs.length) {
    const names = pdfs.map((p) => p.name).join(', ')
    text = `[PDF: ${names}]\n\n${text}`.trim()
  }
  if (text) parts.push({ type: 'text', text })
  return parts.length > 1 ? parts : (parts[0]?.text ?? message.content)
}

// ─── Anthropic streaming ──────────────────────────────────────
async function streamAnthropic(messages, onChunk) {
  const url = getAiUrl()
  const headers = { 'Content-Type': 'application/json', 'anthropic-version': '2023-06-01' }

  // Only send API key if calling Anthropic directly (not via Vite proxy)
  if (AI_CONFIG.apiKey && !url.startsWith('/')) {
    headers['x-api-key'] = AI_CONFIG.apiKey
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: AI_CONFIG.model,
      system: AI_CONFIG.systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: buildAnthropicContent(m) })),
      stream: true,
      max_tokens: 4096,
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message || `Claude API error ${response.status}`)
  }

  const reader  = response.body.getReader()
  const decoder = new TextDecoder()
  let content = ''
  let buffer  = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      try {
        const json = JSON.parse(line.slice(6))
        if (json.type === 'content_block_delta' && json.delta?.type === 'text_delta') {
          content += json.delta.text
          onChunk(content)
        }
      } catch { /* ignore */ }
    }
  }
  return content
}

// ─── OpenAI streaming ─────────────────────────────────────────
async function streamOpenAI(messages, onChunk) {
  const url = getAiUrl()
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AI_CONFIG.apiKey}`,
    },
    body: JSON.stringify({
      model: AI_CONFIG.model,
      messages: [
        { role: 'system', content: AI_CONFIG.systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: buildOpenAIContent(m) })),
      ],
      stream: true,
      max_tokens: 4096,
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message || `OpenAI API error ${response.status}`)
  }

  const reader  = response.body.getReader()
  const decoder = new TextDecoder()
  let content = ''
  let buffer  = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const raw = line.slice(6).trim()
      if (raw === '[DONE]') break
      try {
        const delta = JSON.parse(raw).choices?.[0]?.delta?.content
        if (delta) { content += delta; onChunk(content) }
      } catch { /* ignore */ }
    }
  }
  return content
}

// ─── Public ───────────────────────────────────────────────────
export async function sendToAgentStream(modeId, payload, onChunk) {
  if (!isAiConfigured()) {
    // Demo mode
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

  const messages = payload.messages.filter((m) => m.id !== 'streaming')

  const content = AI_CONFIG.provider === 'anthropic'
    ? await streamAnthropic(messages, onChunk)
    : await streamOpenAI(messages, onChunk)

  return { role: 'assistant', content }
}

export async function getAgents() { return [] }
