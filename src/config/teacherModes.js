export const TEACHER_MODES = [
  {
    id: 'essay',
    name: 'Проверка эссе',
    icon: '📝',
    color: '#6366f1',
    description: 'Оценка сочинений: структура, аргументация, грамматика',
    endpoint: '/agents/essay/check',
    getInputTemplate(lang) {
      const t = {
        ru: 'Тема: \nМаксимальный балл: 10\nКритерии: содержание, логика, грамматика\n\nТекст эссе ученика:\n',
        kz: 'Тақырып: \nМаксималды балл: 10\nКритерийлер: мазмұны, логика, грамматика\n\nОқушының эссе мәтіні:\n',
        en: 'Topic: \nMax score: 10\nCriteria: content, logic, grammar\n\nStudent essay text:\n',
      }
      return t[lang] || t.ru
    },
    fields: [
      { name: 'essay', label: 'Текст эссе ученика', type: 'textarea', required: true, placeholder: 'Вставьте текст сочинения ученика...', supportsFileUpload: true },
      { name: 'topic', label: 'Тема сочинения', type: 'text', placeholder: 'Например: «Роль книги в жизни человека»' },
      { name: 'maxScore', label: 'Максимальный балл', type: 'number', default: 10, min: 1, max: 100 },
      { name: 'criteria', label: 'Критерии оценки', type: 'textarea', placeholder: 'Содержание, логика, грамматика, стиль...' },
    ],
    buildPrompt(data) {
      return `Проверь эссе ученика и поставь оценку.

Тема: ${data.topic || 'не указана'}
Максимальный балл: ${data.maxScore || 10}
${data.criteria ? `Критерии: ${data.criteria}` : ''}

Текст эссе:
"""
${data.essay}
"""

Ответь строго в формате:
## Оценка: X/${data.maxScore || 10}

### Сильные стороны
- ...

### Ошибки и замечания
- ...

### Рекомендации ученику
- ...`
    },
  },
  {
    id: 'math',
    name: 'Проверка задач',
    icon: '🔢',
    color: '#0ea5e9',
    description: 'Проверка решений математических задач по шагам',
    endpoint: '/agents/math/check',
    getInputTemplate(lang) {
      const t = {
        ru: 'Условие задачи:\n\n\nРешение ученика:\n\n\nПравильный ответ (если известен): \nМаксимальный балл: 10',
        kz: 'Есеп шарты:\n\n\nОқушының шешімі:\n\n\nДұрыс жауап (белгілі болса): \nМаксималды балл: 10',
        en: 'Problem statement:\n\n\nStudent solution:\n\n\nCorrect answer (if known): \nMax score: 10',
      }
      return t[lang] || t.ru
    },
    fields: [
      { name: 'problem', label: 'Условие задачи', type: 'textarea', required: true, placeholder: 'Запишите условие задачи...', supportsFileUpload: true },
      { name: 'solution', label: 'Решение ученика', type: 'textarea', required: true, placeholder: 'Вставьте решение ученика...', supportsFileUpload: true },
      { name: 'correctAnswer', label: 'Правильный ответ (если известен)', type: 'text', placeholder: 'Например: x = 5' },
      { name: 'maxScore', label: 'Максимальный балл', type: 'number', default: 10, min: 1, max: 100 },
    ],
    buildPrompt(data) {
      return `Проверь решение математической задачи ученика.

Условие:
"""
${data.problem}
"""

Решение ученика:
"""
${data.solution}
"""

${data.correctAnswer ? `Правильный ответ: ${data.correctAnswer}` : ''}
Максимальный балл: ${data.maxScore || 10}

Ответь строго в формате:
## Оценка: X/${data.maxScore || 10}

### Проверка по шагам
1. ...

### Найденные ошибки
- ...

### Правильное решение
...`
    },
  },
  {
    id: 'test',
    name: 'Проверка теста',
    icon: '✅',
    color: '#10b981',
    description: 'Автоматическая проверка тестов и контрольных работ',
    endpoint: '/agents/test/check',
    getInputTemplate(lang) {
      const t = {
        ru: 'Вопросы и правильные ответы:\n1. Вопрос? — Ответ\n2. Вопрос? — Ответ\n\nОтветы ученика:\n1. \n2. \n\nМаксимальный балл: 10',
        kz: 'Сұрақтар мен дұрыс жауаптар:\n1. Сұрақ? — Жауап\n2. Сұрақ? — Жауап\n\nОқушының жауаптары:\n1. \n2. \n\nМаксималды балл: 10',
        en: 'Questions and correct answers:\n1. Question? — Answer\n2. Question? — Answer\n\nStudent answers:\n1. \n2. \n\nMax score: 10',
      }
      return t[lang] || t.ru
    },
    fields: [
      { name: 'questions', label: 'Вопросы и правильные ответы', type: 'textarea', required: true, placeholder: 'Формат:\n1. Столица Казахстана? — Астана\n2. 2+2=? — 4', supportsFileUpload: true },
      { name: 'studentAnswers', label: 'Ответы ученика', type: 'textarea', required: true, placeholder: 'Формат:\n1. Астана\n2. 5', supportsFileUpload: true },
      { name: 'maxScore', label: 'Максимальный балл', type: 'number', default: 10, min: 1, max: 100 },
    ],
    buildPrompt(data) {
      return `Проверь тест ученика.

Вопросы и правильные ответы:
"""
${data.questions}
"""

Ответы ученика:
"""
${data.studentAnswers}
"""

Максимальный балл: ${data.maxScore || 10}

Ответь строго в формате:
## Оценка: X/${data.maxScore || 10}

### Результаты по вопросам
| № | Ответ ученика | Верно | Комментарий |
|---|---------------|-------|-------------|
| 1 | ... | ✅/❌ | ... |

### Итог
- Правильных: X из Y
- Процент: Z%`
    },
  },
]

export function getModeById(id) {
  return TEACHER_MODES.find((m) => m.id === id)
}

export function extractScore(content) {
  const match = content.match(/##\s*Оценка:\s*(\d+(?:[.,]\d+)?)\s*\/\s*(\d+(?:[.,]\d+)?)/i)
  if (!match) return null
  return {
    score: parseFloat(match[1].replace(',', '.')),
    maxScore: parseFloat(match[2].replace(',', '.')),
  }
}
