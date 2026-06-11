import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLangStore = defineStore('lang', () => {
  const lang = ref(localStorage.getItem('app_lang') || 'ru')

  function setLang(l) {
    lang.value = l
    localStorage.setItem('app_lang', l)
  }

  return { lang, setLang }
})
