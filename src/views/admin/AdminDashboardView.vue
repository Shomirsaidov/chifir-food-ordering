<template>
  <div class="admin-dashboard">
    <div class="header">
      <h1>Admin Dashboard</h1>
      <button @click="logout" class="logout-btn">Logout</button>
    </div>

    <div class="dashboard-grid">
      <div class="card" @click="$router.push('/admin/orders')">
        <div class="icon">📦</div>
        <h2>Orders</h2>
        <p>Manage incoming orders</p>
      </div>

      <div class="card" @click="$router.push('/admin/menu')">
        <div class="icon">🍱</div>
        <h2>Menu</h2>
        <p>Edit items and prices</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function logout() {
  sessionStorage.removeItem('admin_auth')
  router.push('/admin')
}
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  padding: 24px;
  background: var(--color-background);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

h1 {
  font-size: 24px;
  margin: 0;
}

.logout-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  color: var(--color-text);
  cursor: pointer;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}

.card {
  background: var(--color-surface);
  padding: 24px;
  border-radius: 20px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.card:active {
  transform: scale(0.98);
}

.icon {
  font-size: 48px;
  margin-bottom: 16px;
}

h2 {
  font-size: 18px;
  margin: 0 0 8px 0;
}

p {
  color: var(--color-text-secondary);
  font-size: 14px;
  margin: 0;
}
</style>
