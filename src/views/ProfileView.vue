<script setup>
import { ref, onMounted, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()
const isAdmin = ref(false)

async function checkAdminStatus() {
  if (!userStore.user || !userStore.user.username) return

  const { data } = await supabase
    .from('admins')
    .select('*')
    .eq('telegram_username', userStore.user.username)
    .single()

  isAdmin.value = !!data
}

function goToOrders() {
  router.push('/orders')
}

function goToAdminPanel() {
  router.push('/admin/orders')
}

// Watch for user changes (in case it loads late)
watchEffect(() => {
    if (userStore.user) {
        checkAdminStatus()
    }
})
</script>

<template>
  <div class="profile-view">
    <!-- Header -->
    <div class="header">
      <button class="back-btn" @click="router.back()">
         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <h1>Профиль</h1>
      <div class="placeholder"></div>
    </div>

    <!-- Profile Card -->
    <div v-if="userStore.user" class="profile-card">
      <div class="profile-header-bg"></div>
      <div class="profile-content">
        <div v-if="userStore.user.photo_url" class="profile-photo">
          <img :src="userStore.user.photo_url" :alt="userStore.user.first_name" />
        </div>
        <div v-else class="profile-photo-placeholder">
          {{ userStore.user.first_name.charAt(0) }}
        </div>
        
        <h2 class="profile-name">
          {{ userStore.user.first_name }} {{ userStore.user.last_name || '' }}
        </h2>
        <p v-if="userStore.user.username" class="profile-username">@{{ userStore.user.username }}</p>
        <span class="user-badge">Клиент</span>
      </div>
    </div>
    
    <!-- Skeleton -->
    <div v-else class="profile-skeleton"></div>

    <!-- Actions List -->
    <div class="action-list">
      <button class="action-item" @click="goToOrders">
        <div class="icon-box blue">
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        </div>
        <div class="action-info">
          <span class="action-title">Мои заказы</span>
          <span class="action-desc">История всех ваших заказов</span>
        </div>
        <svg class="chevron" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </button>

      <button v-if="isAdmin" class="action-item" @click="goToAdminPanel">
        <div class="icon-box orange">
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
        </div>
        <div class="action-info">
          <span class="action-title">Панель администратора</span>
          <span class="action-desc">Управление заказами и меню</span>
        </div>
        <svg class="chevron" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </button>
      
      <div class="app-info">
        <p>Version 1.0.0 • Uno8 App</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-view {
  min-height: 100vh;
  padding-bottom: calc(var(--cart-button-height) + 20px);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--color-primary);
}

.header h1 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.back-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text);
  background: var(--color-secondary);
  border-radius: 50%;
}

.placeholder { width: 40px; }

/* Profile Card */
.profile-card {
  margin: 20px;
  background: var(--color-secondary);
  border-radius: var(--radius-xl);
  overflow: hidden;
  position: relative;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.profile-header-bg {
  height: 80px;
  background: linear-gradient(135deg, var(--color-accent) 0%, #1d4ed8 100%);
}

.profile-content {
  padding: 0 20px 24px;
  margin-top: -40px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile-photo, .profile-photo-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid var(--color-secondary);
  background: var(--color-surface);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 12px;
}

.profile-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-name {
  font-size: 1.25rem;
  margin-bottom: 4px;
}

.profile-username {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin-bottom: 12px;
}

.user-badge {
  padding: 4px 12px;
  background: rgba(59, 130, 246, 0.1);
  color: var(--color-accent);
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

/* Actions */
.action-list {
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--color-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all var(--transition-base);
  text-align: left;
}

.action-item:active {
  transform: scale(0.98);
  background: var(--color-surface);
}

.icon-box {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.icon-box.blue { background: var(--color-accent); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
.icon-box.orange { background: var(--color-warning); box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3); }

.action-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.action-title {
  font-weight: 600;
  color: var(--color-text);
}

.action-desc {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.chevron {
  color: var(--color-text-secondary);
  opacity: 0.5;
}

.app-info {
  margin-top: 32px;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  opacity: 0.5;
}
</style>
