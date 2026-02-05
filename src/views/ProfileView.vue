<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getTelegramUser } from '../lib/telegram'
import { supabase } from '../lib/supabase'

const router = useRouter()
const user = ref(getTelegramUser())
const isAdmin = ref(false)

async function checkAdminStatus() {
  if (!user.value || !user.value.username) return

  const { data } = await supabase
    .from('admins')
    .select('*')
    .eq('telegram_username', user.value.username)
    .single()

  isAdmin.value = !!data
}

function goToOrders() {
  router.push('/orders')
}

function goToAdminPanel() {
  router.push('/admin/orders')
}

onMounted(() => {
  checkAdminStatus()
})
</script>

<template>
  <div class="profile-view">
    <h1>Профиль</h1>

    <div v-if="user" class="profile-card card">
      <div v-if="user.photo_url" class="profile-photo">
        <img :src="user.photo_url" :alt="user.first_name" />
      </div>
      <div v-else class="profile-photo-placeholder">
        {{ user.first_name.charAt(0) }}
      </div>

      <div class="profile-info">
        <h2 class="profile-name">
          {{ user.first_name }} {{ user.last_name || '' }}
        </h2>
        <p v-if="user.username" class="profile-username">@{{ user.username }}</p>
        <p class="profile-id">ID: {{ user.id }}</p>
      </div>
    </div>

    <div class="profile-actions">
      <button class="action-btn card" @click="goToOrders">
        <span class="action-icon">📋</span>
        <span class="action-text">Мои заказы</span>
        <span class="action-arrow">→</span>
      </button>

      <button v-if="isAdmin" class="action-btn card admin-btn" @click="goToAdminPanel">
        <span class="action-icon">⚙️</span>
        <span class="action-text">Панель администратора</span>
        <span class="action-arrow">→</span>
      </button>
    </div>

    <div class="app-info">
      <p class="text-secondary text-center">
        Telegram Mini App<br />
        Система заказов для кальянной
      </p>
    </div>
  </div>
</template>

<style scoped>
.profile-view {
  padding: var(--spacing-lg) var(--spacing-md);
  padding-bottom: calc(var(--cart-button-height) + var(--spacing-lg));
}

.profile-view h1 {
  margin-bottom: var(--spacing-lg);
}

.profile-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-xl);
}

.profile-photo,
.profile-photo-placeholder {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
}

.profile-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-photo-placeholder {
  background: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 600;
  color: white;
}

.profile-info {
  text-align: center;
}

.profile-name {
  font-size: 1.5rem;
  margin: 0 0 var(--spacing-sm) 0;
}

.profile-username {
  color: var(--color-accent);
  margin: 0 0 var(--spacing-xs) 0;
}

.profile-id {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  margin: 0;
}

.profile-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  text-align: left;
  transition: all var(--transition-base);
  cursor: pointer;
}

.action-btn:active {
  transform: scale(0.98);
}

.action-icon {
  font-size: 1.5rem;
}

.action-text {
  flex: 1;
  font-size: 1rem;
  font-weight: 500;
}

.action-arrow {
  color: var(--color-text-secondary);
  font-size: 1.25rem;
}

.admin-btn {
  border: 2px solid var(--color-warning);
}

.app-info {
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-xl);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.app-info p {
  font-size: 0.875rem;
  line-height: 1.6;
}
</style>
