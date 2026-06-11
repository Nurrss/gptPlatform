<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import AuthLayout from '../components/auth/AuthLayout.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')

async function handleSubmit() {
  try {
    await auth.login({ email: email.value, password: password.value })
    router.push(route.query.redirect || '/')
  } catch {
    // error shown via store
  }
}
</script>

<template>
  <AuthLayout title="Вход" subtitle="Платформа AI-проверки для учителей">
    <form @submit.prevent="handleSubmit" class="auth-form">
      <div class="field">
        <label for="email">Email</label>
        <input id="email" v-model="email" type="email" placeholder="you@example.com" required autocomplete="email" />
      </div>
      <div class="field">
        <label for="password">Пароль</label>
        <input id="password" v-model="password" type="password" placeholder="••••••••" required autocomplete="current-password" />
      </div>
      <p v-if="auth.error" class="error-message">{{ auth.error }}</p>
      <button type="submit" class="btn btn-primary submit-btn" :disabled="auth.loading">
        {{ auth.loading ? 'Вход...' : 'Войти' }}
      </button>
    </form>
    <p class="footer-link">
      Нет аккаунта? <router-link to="/register">Зарегистрироваться</router-link>
    </p>
  </AuthLayout>
</template>

<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

label {
  font-size: 14px;
  color: var(--text-secondary);
}

input {
  padding: 10px 14px;
  width: 100%;
}

.submit-btn {
  width: 100%;
  margin-top: 8px;
  padding: 12px;
}

.footer-link {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: var(--text-secondary);
}
</style>
