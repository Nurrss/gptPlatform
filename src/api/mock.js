import { TEACHER_MODES } from '../config/teacherModes'

const USERS_KEY = 'gpt_users'
const SESSION_KEY = 'gpt_session'
const CHATS_KEY = 'gpt_chats'

function read(key, fallback = []) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function generateId() {
  return crypto.randomUUID()
}

function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function mockEssayResponse(content) {
  const maxScore = content.match(/Максимальный балл:\s*(\d+)/)?.[1] || '10'
  return `## Оценка: 7/${maxScore}

### Сильные стороны
- Текст имеет логическую структуру: вступление, основная часть, заключение
- Используются аргументы и примеры
- Общий смысл понятен и соответствует теме

### Ошибки и замечания
- Есть грамматические ошибки (2–3 случая)
- Некоторые предложения слишком длинные
- Недостаточно глубокий анализ темы

### Рекомендации ученику
- Перечитать текст и исправить пунктуацию
- Добавить 1–2 конкретных примера
- Сократить сложные предложения

---
*Демо-ответ. Подключите AI-агент в Настройках для реальной проверки.*`
}

function mockMathResponse(content) {
  const maxScore = content.match(/Максимальный балл:\s*(\d+)/)?.[1] || '10'
  return `## Оценка: 8/${maxScore}

### Проверка по шагам
1. ✅ Правильно записано условие задачи
2. ✅ Первый шаг решения выполнен верно
3. ❌ Ошибка в вычислениях на 3-м шаге
4. ⚠️ Ответ записан без единиц измерения

### Найденные ошибки
- Арифметическая ошибка: 12 × 3 = 36, а не 39
- Не указаны единицы измерения в ответе
- Пропущен промежуточный шаг

### Правильное решение
Решение нужно выполнить заново, начиная с 3-го шага. Правильный ответ зависит от условия задачи.

---
*Демо-ответ. Подключите AI-агент в Настройках для реальной проверки.*`
}

function mockTestResponse(content) {
  const maxScore = content.match(/Максимальный балл:\s*(\d+)/)?.[1] || '10'
  return `## Оценка: 6/${maxScore}

### Результаты по вопросам
| № | Ответ ученика | Верно | Комментарий |
|---|---------------|-------|-------------|
| 1 | Астана | ✅ | Верно |
| 2 | 5 | ❌ | Правильный ответ: 4 |
| 3 | H₂O | ✅ | Верно |
| 4 | 1945 | ❌ | Правильный ответ: 1941 |

### Итог
- Правильных: 2 из 4
- Процент: 50%

---
*Демо-ответ. Подключите AI-агент в Настройках для реальной проверки.*`
}

export const mockApi = {
  async register({ email, password, name }) {
    await delay()
    const users = read(USERS_KEY, [])
    if (users.find((u) => u.email === email)) {
      throw new Error('Пользователь с таким email уже существует')
    }
    const user = { id: generateId(), email, password, name, role: 'teacher', createdAt: new Date().toISOString() }
    users.push(user)
    write(USERS_KEY, users)
    const token = generateId()
    write(SESSION_KEY, { token, userId: user.id })
    localStorage.setItem('auth_token', token)
    return { token, user: { id: user.id, email: user.email, name: user.name, role: 'teacher' } }
  },

  async login({ email, password }) {
    await delay()
    const users = read(USERS_KEY, [])
    const user = users.find((u) => u.email === email && u.password === password)
    if (!user) throw new Error('Неверный email или пароль')
    const token = generateId()
    write(SESSION_KEY, { token, userId: user.id })
    localStorage.setItem('auth_token', token)
    return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role || 'teacher' } }
  },

  async getMe() {
    await delay(100)
    const session = read(SESSION_KEY, null)
    if (!session) throw new Error('Не авторизован')
    const users = read(USERS_KEY, [])
    const user = users.find((u) => u.id === session.userId)
    if (!user) throw new Error('Не авторизован')
    return { id: user.id, email: user.email, name: user.name, role: user.role || 'teacher' }
  },

  async logout() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem(SESSION_KEY)
  },

  async getChats(userId) {
    await delay(100)
    const all = read(CHATS_KEY, [])
    return all.filter((c) => c.userId === userId).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  },

  async createChat(userId, { title, agentId, modeId }) {
    await delay(100)
    const mode = TEACHER_MODES.find((m) => m.id === (modeId || agentId))
    const chat = {
      id: generateId(),
      userId,
      title: title || (mode ? `${mode.icon} ${mode.name}` : 'Новая проверка'),
      agentId: modeId || agentId || 'essay',
      modeId: modeId || agentId || 'essay',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const all = read(CHATS_KEY, [])
    all.push(chat)
    write(CHATS_KEY, all)
    return chat
  },

  async getChat(chatId) {
    await delay(100)
    const all = read(CHATS_KEY, [])
    const chat = all.find((c) => c.id === chatId)
    if (!chat) throw new Error('Чат не найден')
    return chat
  },

  async updateChat(chatId, updates) {
    const all = read(CHATS_KEY, [])
    const idx = all.findIndex((c) => c.id === chatId)
    if (idx === -1) throw new Error('Чат не найден')
    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() }
    write(CHATS_KEY, all)
    return all[idx]
  },

  async deleteChat(chatId) {
    const all = read(CHATS_KEY, [])
    write(CHATS_KEY, all.filter((c) => c.id !== chatId))
  },

  async addMessage(chatId, message) {
    const chat = await this.getChat(chatId)
    const newMessage = { id: generateId(), ...message, createdAt: new Date().toISOString() }
    chat.messages.push(newMessage)
    chat.updatedAt = new Date().toISOString()
    await this.updateChat(chatId, { messages: chat.messages, title: chat.title })
    return newMessage
  },

  async getAgents() {
    await delay(100)
    return TEACHER_MODES.map((m) => ({
      id: m.id,
      name: m.name,
      description: m.description,
      avatar: m.icon,
      endpoint: m.endpoint,
    }))
  },

  async sendToAgent(modeId, { messages, agentConfig }) {
    await delay(800)
    const lastMessage = messages[messages.length - 1]?.content || ''

    if (agentConfig?.apiUrl && agentConfig?.apiKey) {
      return {
        role: 'assistant',
        content: `AI-агент настроен (${agentConfig.apiUrl}), но бэкенд ещё не подключён.\n\nПоставьте VITE_USE_MOCK=false и реализуйте эндпоинт на сервере.`,
      }
    }

    switch (modeId) {
      case 'essay':
        return { role: 'assistant', content: mockEssayResponse(lastMessage) }
      case 'math':
        return { role: 'assistant', content: mockMathResponse(lastMessage) }
      case 'test':
        return { role: 'assistant', content: mockTestResponse(lastMessage) }
      default:
        return { role: 'assistant', content: mockEssayResponse(lastMessage) }
    }
  },
}
