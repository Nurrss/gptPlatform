// ─────────────────────────────────────────────────────────────
//  AI Configuration
//  Настрой провайдера в .env — в коде ничего менять не нужно
// ─────────────────────────────────────────────────────────────

const provider = import.meta.env.VITE_AI_PROVIDER || ''

export const AI_CONFIG = {
  provider, // 'anthropic' | 'openai' | ''

  // Anthropic: запросы идут через Vite-прокси /api/claude (ключ скрыт)
  // OpenAI:    прямые запросы с VITE_AI_API_KEY
  // Кастомный: укажи VITE_AI_API_URL для production
  apiUrl: import.meta.env.VITE_AI_API_URL || (provider === 'anthropic' ? '/api/claude' : ''),
  apiKey: import.meta.env.VITE_AI_API_KEY || '',   // только для OpenAI
  model:  import.meta.env.VITE_AI_MODEL  || 'claude-sonnet-4-6',

  systemPrompt:
    'Ты опытный учитель и AI-ассистент. ' +
    'Проверяй работы учеников объективно, ' +
    'ставь оценку строго по заданным критериям и давай конкретные рекомендации. ' +
    'Отвечай на языке, на котором написан запрос.',
}

export function getAiUrl() {
  if (AI_CONFIG.apiUrl) return AI_CONFIG.apiUrl
  return 'https://api.openai.com/v1/chat/completions'
}

// Считаем AI настроенным если явно указан провайдер
export function isAiConfigured() {
  if (!AI_CONFIG.provider) return false
  if (AI_CONFIG.provider === 'anthropic') return !!AI_CONFIG.model
  return !!(AI_CONFIG.apiKey && AI_CONFIG.model)
}

