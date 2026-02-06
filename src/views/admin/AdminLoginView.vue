<template>
  <div class="admin-login">
    <div class="login-card">
      <h1>Панель управления</h1>
      <p>Введите PIN-код для входа</p>
      
      <form @submit.prevent="handleLogin">
        <input 
          v-model="pin" 
          type="password" 
          pattern="[0-9]*" 
          inputmode="numeric" 
          maxlength="4" 
          placeholder="PIN"
          class="pin-input"
          ref="pinInput"
        />
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? 'Проверка...' : 'Войти' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const pin = ref('')
const error = ref('')
const loading = ref(false)
const pinInput = ref(null)

// Simple hardcoded PIN for now (as requested in plan)
const ADMIN_PIN = '1412'

onMounted(() => {
  pinInput.value?.focus()
})

function handleLogin() {
  if (!pin.value) return
  
  loading.value = true
  error.value = ''
  
  // Simulate network delay slightly for better UX feel
  setTimeout(() => {
    if (pin.value === ADMIN_PIN) {
      // Save auth state to session storage
      sessionStorage.setItem('admin_auth', 'true')
      router.push('/admin/dashboard')
    } else {
      error.value = 'Неверный PIN-код'
      pin.value = ''
      pinInput.value?.focus()
    }
    loading.value = false
  }, 500)
}
</script>

<style scoped>
.admin-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background);
  padding: 20px;
}

.login-card {
  background: var(--color-surface);
  padding: 32px;
  border-radius: 24px;
  width: 100%;
  max-width: 320px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
}

p {
  color: var(--color-text-secondary);
  margin: 0 0 24px 0;
}

.pin-input {
  width: 100%;
  padding: 16px;
  font-size: 24px;
  text-align: center;
  background: var(--color-background);
  border: 2px solid var(--color-border);
  border-radius: 12px;
  color: var(--color-text);
  margin-bottom: 20px;
  letter-spacing: 8px;
}

.pin-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.error-message {
  color: #ef4444;
  margin-bottom: 16px;
  font-size: 14px;
}

.login-btn {
  width: 100%;
  padding: 16px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
