<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import AuthLayout from '../components/auth/AuthLayout.vue'

const auth = useAuthStore()
const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const localError = ref('')

async function handleSubmit() {
  localError.value = ''
  if (password.value !== confirmPassword.value) {
    localError.value = 'Пароли не совпадают'
    return
  }
  if (password.value.length < 6) {
    localError.value = 'Пароль должен быть не менее 6 символов'
    return
  }
  try {
    await auth.register({ name: name.value, email: email.value, password: password.value })
    router.push('/')
  } catch {
    // error shown via store
  }
}
</script>

<template>
  <AuthLayout title="Регистрация" subtitle="Создайте аккаунт учителя">
    <form @submit.prevent="handleSubmit" class="auth-form">
      <div class="field">
        <label for="name">Имя</label>
        <input id="name" v-model="name" type="text" placeholder="Ваше имя" required autocomplete="name" />
      </div>
      <div class="field">
        <label for="email">Email</label>
        <input id="email" v-model="email" type="email" placeholder="you@example.com" required autocomplete="email" />
      </div>
      <div class="field">
        <label for="password">Пароль</label>
        <input id="password" v-model="password" type="password" placeholder="••••••••" required autocomplete="new-password" />
      </div>
      <div class="field">
        <label for="confirm">Подтвердите пароль</label>
        <input id="confirm" v-model="confirmPassword" type="password" placeholder="••••••••" required autocomplete="new-password" />
      </div>
      <p v-if="localError || auth.error" class="error-message">{{ localError || auth.error }}</p>
      <button type="submit" class="btn btn-primary submit-btn" :disabled="auth.loading">
        {{ auth.loading ? 'Регистрация...' : 'Зарегистрироваться' }}
      </button>
    </form>
    <p class="footer-link">
      Уже есть аккаунт? <router-link to="/login">Войти</router-link>
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
