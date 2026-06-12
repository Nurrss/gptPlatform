const SUBJECT_CHIPS = {
  ru: ['Математика', 'Физика', 'Химия', 'Биология', 'Информатика', 'История', 'Другой предмет'],
  kz: ['Математика', 'Физика', 'Химия', 'Биология', 'Информатика', 'Тарих', 'Басқа пән'],
  en: ['Math', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'History', 'Other'],
}

export const WIZARD_FLOWS = {
  essay: {
    steps(lang) {
      if (lang === 'kz') return [
        { field: 'topic', inputType: 'text', question: 'Эссенің тақырыбы қандай?' },
        { field: 'criteria', inputType: 'text', optional: true, question: 'Бағалау критерийлері бар ма? Жоқ болса — «Өткізу» батырмасын басыңыз.' },
        { field: 'essay', inputType: 'text+file', question: 'Оқушының эссе мәтінін қойыңыз немесе фото / PDF жүктеңіз.' },
      ]
      if (lang === 'en') return [
        { field: 'topic', inputType: 'text', question: 'What is the essay topic?' },
        { field: 'criteria', inputType: 'text', optional: true, question: 'Are there grading criteria? If not, click "Skip".' },
        { field: 'essay', inputType: 'text+file', question: "Paste the student's essay text or upload a photo / PDF." },
      ]
      return [
        { field: 'topic', inputType: 'text', question: 'Какая тема эссе?' },
        { field: 'criteria', inputType: 'text', optional: true, question: 'Есть ли критерии оценки? Если нет — нажмите «Пропустить».' },
        { field: 'essay', inputType: 'text+file', question: 'Вставьте текст эссе ученика или загрузите фото / PDF.' },
      ]
    },
    buildFinalPrompt(data, lang) {
      const hasCriteria = data.criteria && data.criteria.trim()
      const hasText = data.essay && data.essay.trim()
      const essaySection = hasText
        ? (lang === 'kz' ? `Эссе мәтіні:\n"""\n${data.essay}\n"""` : lang === 'en' ? `Essay text:\n"""\n${data.essay}\n"""` : `Текст эссе:\n"""\n${data.essay}\n"""`)
        : (lang === 'kz' ? '[Эссе мәтіні суретте немесе құжатта]' : lang === 'en' ? '[Essay text is in the attached image or document]' : '[Текст эссе прикреплён как изображение или документ]')

      if (lang === 'kz') {
        return `Оқушының эссесін тексер және баға қой.\n\nТақырып: ${data.topic || 'көрсетілмеген'}\nМаксималды балл: 10\n${hasCriteria ? `Критерийлер: ${data.criteria}\n` : ''}\n${essaySection}`
      }
      if (lang === 'en') {
        return `Check the student's essay and grade it.\n\nTopic: ${data.topic || 'not specified'}\nMax score: 10\n${hasCriteria ? `Criteria: ${data.criteria}\n` : ''}\n${essaySection}`
      }
      return `Проверь эссе ученика и поставь оценку.\n\nТема: ${data.topic || 'не указана'}\nМаксимальный балл: 10\n${hasCriteria ? `Критерии: ${data.criteria}\n` : ''}\n${essaySection}`
    },
  },

  math: {
    steps(lang) {
      const chips = SUBJECT_CHIPS[lang] || SUBJECT_CHIPS.ru
      if (lang === 'kz') return [
        { field: 'subject', inputType: 'chips', chips, question: 'Есеп қай пәннен?' },
        { field: 'problem', inputType: 'text+file', question: 'Тексеру керек есепті жазыңыз немесе фото / PDF жүктеңіз.' },
      ]
      if (lang === 'en') return [
        { field: 'subject', inputType: 'chips', chips, question: 'What subject is the problem from?' },
        { field: 'problem', inputType: 'text+file', question: 'Write the problem or upload a photo / PDF.' },
      ]
      return [
        { field: 'subject', inputType: 'chips', chips, question: 'По какому предмету задача?' },
        { field: 'problem', inputType: 'text+file', question: 'Напишите задачу или загрузите фото / PDF.' },
      ]
    },
    buildFinalPrompt(data, lang) {
      const subject = data.subject || (lang === 'kz' ? 'Математика' : lang === 'en' ? 'Math' : 'Математика')
      const hasText = data.problem && data.problem.trim()
      const problemSection = hasText
        ? (lang === 'kz' ? `Есеп:\n"""\n${data.problem}\n"""` : lang === 'en' ? `Problem:\n"""\n${data.problem}\n"""` : `Задача:\n"""\n${data.problem}\n"""`)
        : (lang === 'kz' ? '[Есеп суретте немесе құжатта]' : lang === 'en' ? '[Problem is in the attached image or document]' : '[Задача прикреплена как изображение или документ]')

      if (lang === 'kz') return `${subject} есебін тексер және баға қой.\n\nМаксималды балл: 10\n\n${problemSection}`
      if (lang === 'en') return `Check this ${subject} problem and grade it.\n\nMax score: 10\n\n${problemSection}`
      return `Проверь задачу по предмету ${subject} и поставь оценку.\n\nМаксимальный балл: 10\n\n${problemSection}`
    },
  },

  test: {
    steps(lang) {
      const chips = SUBJECT_CHIPS[lang] || SUBJECT_CHIPS.ru
      if (lang === 'kz') return [
        { field: 'subject', inputType: 'chips', chips, question: 'Тест қай пәннен?' },
        { field: 'questions', inputType: 'text+file', question: 'Тест шаблонын немесе файл / фото жүктеңіз.' },
      ]
      if (lang === 'en') return [
        { field: 'subject', inputType: 'chips', chips, question: 'What subject is the test from?' },
        { field: 'questions', inputType: 'text+file', question: 'Provide the test template or upload a file / photo.' },
      ]
      return [
        { field: 'subject', inputType: 'chips', chips, question: 'По какому предмету тест?' },
        { field: 'questions', inputType: 'text+file', question: 'Укажите шаблон теста или загрузите файл / фото.' },
      ]
    },
    buildFinalPrompt(data, lang) {
      const subject = data.subject || (lang === 'kz' ? 'Математика' : lang === 'en' ? 'Math' : 'Математика')
      const hasText = data.questions && data.questions.trim()
      const questionsSection = hasText
        ? (lang === 'kz' ? `Тест сұрақтары мен дұрыс жауаптар:\n"""\n${data.questions}\n"""` : lang === 'en' ? `Test questions and correct answers:\n"""\n${data.questions}\n"""` : `Вопросы теста и правильные ответы:\n"""\n${data.questions}\n"""`)
        : (lang === 'kz' ? '[Тест суретте немесе құжатта]' : lang === 'en' ? '[Test is in the attached image or document]' : '[Тест прикреплён как изображение или документ]')

      if (lang === 'kz') return `${subject} тестін тексер және баға қой.\n\nМаксималды балл: 10\n\n${questionsSection}`
      if (lang === 'en') return `Check this ${subject} test and grade it.\n\nMax score: 10\n\n${questionsSection}`
      return `Проверь тест по предмету ${subject} и поставь оценку.\n\nМаксимальный балл: 10\n\n${questionsSection}`
    },
  },
}
