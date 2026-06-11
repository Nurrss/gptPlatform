import { storeToRefs } from 'pinia'
import { useLangStore } from '../stores/lang'

const translations = {
  ru: {
    newCheck: 'Новая проверка',
    noChecks: 'Нет проверок',
    aiAgents: 'AI-агенты',
    teacher: 'Учитель',
    logout: 'Выйти',
    menu: 'Меню',
    back: '← Назад',
    check: 'Проверить',
    checking: 'Проверяю...',
    messagePlaceholder: 'Напишите сообщение...',
    disclaimer: 'GPT Platform может ошибаться. Проверяйте важную информацию.',
    deleteConfirm: 'Удалить эту проверку?',
    aiConnected: 'AI подключён',
    demoMode: 'Демо-режим',
    inputFormat: 'Формат ввода',
    formatText: 'Текст',
    formatImage: 'Рисунок',
    formatPdf: 'PDF',
    uploadImageHint: 'Загрузить изображение (JPG, PNG)',
    uploadPdfHint: 'Загрузить PDF документ',
    fileLoaded: 'Файл загружен',
    changeFile: 'Изменить файл',
    dragOrClick: 'Перетащите файл или нажмите для выбора',
    welcomeTitle: 'AI-помощник для учителей',
    welcomeSubtitle: 'Выберите тип проверки — AI оценит работу и даст рекомендации',
    checkLabel: 'Запрос на проверку',
    attachFile: 'Прикрепить файл',
    selectFormat: 'Выберите тип проверки',
    modes: {
      essay: {
        name: 'Проверка эссе',
        desc: 'Оценка сочинений: структура, аргументация, грамматика',
        fields: {
          essay: { label: 'Текст эссе ученика', placeholder: 'Вставьте текст сочинения ученика...' },
          topic: { label: 'Тема сочинения', placeholder: 'Например: «Роль книги в жизни человека»' },
          maxScore: { label: 'Максимальный балл', placeholder: '' },
          criteria: { label: 'Критерии оценки', placeholder: 'Содержание, логика, грамматика, стиль...' },
        },
      },
      math: {
        name: 'Проверка задач',
        desc: 'Проверка решений математических задач по шагам',
        fields: {
          problem: { label: 'Условие задачи', placeholder: 'Запишите условие задачи...' },
          solution: { label: 'Решение ученика', placeholder: 'Вставьте решение ученика...' },
          correctAnswer: { label: 'Правильный ответ (если известен)', placeholder: 'Например: x = 5' },
          maxScore: { label: 'Максимальный балл', placeholder: '' },
        },
      },
      test: {
        name: 'Проверка теста',
        desc: 'Автоматическая проверка тестов и контрольных работ',
        fields: {
          questions: { label: 'Вопросы и правильные ответы', placeholder: 'Формат:\n1. Столица Казахстана? — Астана\n2. 2+2=? — 4' },
          studentAnswers: { label: 'Ответы ученика', placeholder: 'Формат:\n1. Астана\n2. 5' },
          maxScore: { label: 'Максимальный балл', placeholder: '' },
        },
      },
    },
  },
  kz: {
    newCheck: 'Жаңа тексеру',
    noChecks: 'Тексерулер жоқ',
    aiAgents: 'AI-агенттер',
    teacher: 'Мұғалім',
    logout: 'Шығу',
    menu: 'Мәзір',
    back: '← Артқа',
    check: 'Тексеру',
    checking: 'Тексеруде...',
    messagePlaceholder: 'Хабарлама жазыңыз...',
    disclaimer: 'GPT Platform қателесуі мүмкін. Маңызды ақпаратты тексеріңіз.',
    deleteConfirm: 'Бұл тексеруді жою керек пе?',
    aiConnected: 'AI қосылды',
    demoMode: 'Демо-режим',
    inputFormat: 'Енгізу форматы',
    formatText: 'Мәтін',
    formatImage: 'Сурет',
    formatPdf: 'PDF',
    uploadImageHint: 'Суретті жүктеу (JPG, PNG)',
    uploadPdfHint: 'PDF құжатты жүктеу',
    fileLoaded: 'Файл жүктелді',
    changeFile: 'Файлды өзгерту',
    dragOrClick: 'Файлды сүйреңіз немесе таңдау үшін басыңыз',
    welcomeTitle: 'Мұғалімдерге арналған AI-көмекші',
    welcomeSubtitle: 'Тексеру түрін таңдаңыз — AI жұмысты бағалап, ұсыныстар береді',
    checkLabel: 'Тексеру сұранысы',
    attachFile: 'Файл тіркеу',
    selectFormat: 'Тексеру түрін таңдаңыз',
    modes: {
      essay: {
        name: 'Эссе тексеру',
        desc: 'Шығарманы бағалау: құрылымы, дәлелдемелер, грамматика',
        fields: {
          essay: { label: 'Оқушының эссе мәтіні', placeholder: 'Оқушының шығарма мәтінін қойыңыз...' },
          topic: { label: 'Шығарма тақырыбы', placeholder: 'Мысалы: «Кітаптың адам өміріндегі рөлі»' },
          maxScore: { label: 'Максималды балл', placeholder: '' },
          criteria: { label: 'Бағалау критерийлері', placeholder: 'Мазмұны, логика, грамматика, стиль...' },
        },
      },
      math: {
        name: 'Есептерді тексеру',
        desc: 'Математика есептерін қадам бойынша тексеру',
        fields: {
          problem: { label: 'Есеп шарты', placeholder: 'Есеп шартын жазыңыз...' },
          solution: { label: 'Оқушының шешімі', placeholder: 'Оқушының шешімін қойыңыз...' },
          correctAnswer: { label: 'Дұрыс жауап (белгілі болса)', placeholder: 'Мысалы: x = 5' },
          maxScore: { label: 'Максималды балл', placeholder: '' },
        },
      },
      test: {
        name: 'Тестті тексеру',
        desc: 'Тесттер мен бақылау жұмыстарын автоматты тексеру',
        fields: {
          questions: { label: 'Сұрақтар мен дұрыс жауаптар', placeholder: 'Формат:\n1. Қазақстан астанасы? — Астана\n2. 2+2=? — 4' },
          studentAnswers: { label: 'Оқушының жауаптары', placeholder: 'Формат:\n1. Астана\n2. 5' },
          maxScore: { label: 'Максималды балл', placeholder: '' },
        },
      },
    },
  },
  en: {
    newCheck: 'New Check',
    noChecks: 'No checks',
    aiAgents: 'AI Agents',
    teacher: 'Teacher',
    logout: 'Log out',
    menu: 'Menu',
    back: '← Back',
    check: 'Check',
    checking: 'Checking...',
    messagePlaceholder: 'Write a message...',
    disclaimer: 'GPT Platform can make mistakes. Verify important information.',
    deleteConfirm: 'Delete this check?',
    aiConnected: 'AI connected',
    demoMode: 'Demo mode',
    inputFormat: 'Input format',
    formatText: 'Text',
    formatImage: 'Image',
    formatPdf: 'PDF',
    uploadImageHint: 'Upload image (JPG, PNG)',
    uploadPdfHint: 'Upload PDF document',
    fileLoaded: 'File loaded',
    changeFile: 'Change file',
    dragOrClick: 'Drag a file or click to select',
    welcomeTitle: 'AI Assistant for Teachers',
    welcomeSubtitle: 'Select a check type — AI will grade the work and give recommendations',
    checkLabel: 'Check request',
    attachFile: 'Attach file',
    selectFormat: 'Select check type',
    modes: {
      essay: {
        name: 'Essay Check',
        desc: 'Evaluate essays: structure, argumentation, grammar',
        fields: {
          essay: { label: "Student's essay text", placeholder: "Paste the student's essay text..." },
          topic: { label: 'Essay topic', placeholder: 'e.g.: "The role of books in human life"' },
          maxScore: { label: 'Maximum score', placeholder: '' },
          criteria: { label: 'Grading criteria', placeholder: 'Content, logic, grammar, style...' },
        },
      },
      math: {
        name: 'Problem Check',
        desc: 'Check math problem solutions step by step',
        fields: {
          problem: { label: 'Problem statement', placeholder: 'Write the problem statement...' },
          solution: { label: "Student's solution", placeholder: "Paste the student's solution..." },
          correctAnswer: { label: 'Correct answer (if known)', placeholder: 'e.g.: x = 5' },
          maxScore: { label: 'Maximum score', placeholder: '' },
        },
      },
      test: {
        name: 'Test Check',
        desc: 'Automatic grading of tests and control works',
        fields: {
          questions: { label: 'Questions and correct answers', placeholder: 'Format:\n1. Capital of Kazakhstan? — Astana\n2. 2+2=? — 4' },
          studentAnswers: { label: "Student's answers", placeholder: 'Format:\n1. Astana\n2. 5' },
          maxScore: { label: 'Maximum score', placeholder: '' },
        },
      },
    },
  },
}

function lookup(obj, parts) {
  let val = obj
  for (const p of parts) {
    val = val?.[p]
  }
  return val
}

export function useI18n() {
  const langStore = useLangStore()
  // storeToRefs gives back the actual Ref so templates stay reactive
  const { lang } = storeToRefs(langStore)

  function t(key) {
    const parts = key.split('.')
    const val = lookup(translations[lang.value], parts)
    if (val !== undefined) return val
    return lookup(translations.ru, parts) ?? key
  }

  return { t, lang, setLang: langStore.setLang }
}
