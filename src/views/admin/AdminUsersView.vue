<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../../lib/supabase'

const users = ref([])
const loading = ref(true)

const groupedUsers = computed(() => {
  const groups = {}
  users.value.forEach(user => {
    const date = new Date(user.created_at).toISOString().split('T')[0]
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(user)
  })
  return groups
})

onMounted(() => {
  loadUsers()
})

async function loadUsers() {
  loading.value = true
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (data) {
    users.value = data
  }
  
  loading.value = false
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatGroupDate(dateStr) {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return 'Сегодня'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Вчера'
  } else {
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
  }
}
</script>

<template>
  <div class="admin-users">
    <div class="header">
      <button @click="$router.back()" class="back-btn">← Назад</button>
      <h1>Пользователи</h1>
      <button @click="loadUsers" class="refresh-btn">↻</button>
    </div>

    <div v-if="loading" class="loading">Загрузка пользователей...</div>

    <div v-else-if="users.length === 0" class="empty-state">
      <p>Пользователей пока нет</p>
    </div>

    <div v-else class="users-list">
      <div v-for="(group, date) in groupedUsers" :key="date" class="date-group">
        <h2 class="date-header">{{ formatGroupDate(date) }}</h2>
        <div v-for="user in group" :key="user.id" class="user-card">
          <div class="user-avatar">
            <img v-if="user.photo_url" :src="user.photo_url" alt="Avatar" />
            <div v-else class="avatar-placeholder">{{ user.first_name ? user.first_name.charAt(0) : '?' }}</div>
          </div>
          <div class="user-info">
            <div class="user-name">{{ user.first_name }} {{ user.last_name || '' }}</div>
            <div class="user-username" v-if="user.username">@{{ user.username }}</div>
            <div class="user-meta">ID: {{ user.telegram_id }} • {{ formatTime(user.created_at) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-users {
  min-height: 100vh;
  padding: 20px;
  background: var(--color-background);
  padding-bottom: 100px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

h1 {
  font-size: 20px;
  margin: 0;
}

.back-btn, .refresh-btn {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 16px;
  cursor: pointer;
}

.refresh-btn {
  font-size: 24px;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.date-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.date-header {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  align-self: flex-start;
  margin-bottom: 4px;
}

.user-card {
  background: var(--color-surface);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--color-secondary);
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: bold;
}

.user-info {
  flex: 1;
}

.user-name {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 2px;
}

.user-username {
  color: var(--color-accent);
  font-size: 14px;
  margin-bottom: 4px;
}

.user-meta {
  color: var(--color-text-secondary);
  font-size: 12px;
}

.loading, .empty-state {
  text-align: center;
  padding: 40px;
  color: var(--color-text-secondary);
}
</style>
