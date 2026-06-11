import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as authApi from '../api/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('auth_token'))
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  async function init() {
    if (!token.value) return
    try {
      user.value = await authApi.getMe()
    } catch {
      token.value = null
      localStorage.removeItem('auth_token')
    }
  }

  async function register(form) {
    loading.value = true
    error.value = null
    try {
      const result = await authApi.register(form)
      token.value = result.token
      user.value = result.user
      localStorage.setItem('auth_token', result.token)
      return result
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function login(form) {
    loading.value = true
    error.value = null
    try {
      const result = await authApi.login(form)
      token.value = result.token
      user.value = result.user
      localStorage.setItem('auth_token', result.token)
      return result
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    await authApi.logout()
    token.value = null
    user.value = null
  }

  return { user, token, loading, error, isAuthenticated, init, register, login, logout }
})
