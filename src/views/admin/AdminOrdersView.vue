<template>
  <div class="admin-orders">
    <div class="header">
      <button @click="$router.push('/admin/dashboard')" class="back-btn">← Back</button>
      <h1>Orders</h1>
      <button @click="loadOrders" class="refresh-btn">↻</button>
    </div>

    <div v-if="loading" class="loading">Loading orders...</div>

    <div v-else-if="orders.length === 0" class="empty-state">
      <p>No active orders</p>
    </div>

    <div v-else class="orders-list">
      <div v-for="order in orders" :key="order.id" class="order-card" :class="order.status">
        <div class="order-header">
          <span class="order-id">#{{ order.id.slice(0, 8) }}</span>
          <span class="order-time">{{ formatDate(order.created_at) }}</span>
        </div>
        
        <div class="order-details">
          <div class="customer-info">
             <div class="delivery-info">
               <span v-if="order.delivery_type === 'delivery'" class="info-row">🚗 {{ order.delivery_address }}</span>
               <span v-else class="info-row">🏃 Самовывоз</span>
               <span class="info-row">📞 {{ order.phone_number }}</span>
             </div>
          </div>

          <div class="user-profile" v-if="order.user">
             <div class="user-avatar">
               <img v-if="order.user.photo_url" :src="order.user.photo_url" alt="Avatar" />
               <div v-else class="avatar-placeholder">{{ order.user.first_name ? order.user.first_name.charAt(0) : '?' }}</div>
             </div>
             <div class="user-details">
               <div class="user-name">
                 {{ order.user.first_name }} {{ order.user.last_name || '' }}
               </div>
               <div class="user-username" v-if="order.user.username">
                 @{{ order.user.username }}
               </div>
             </div>
          </div>
          
          <div class="items-list">
            <div v-for="item in order.items" :key="item.menu_item_id" class="order-item">
              <span>{{ item.quantity }}x {{ item.menu_item_name }}</span>
            </div>
            <div class="extras">
              <span>🍴 Приборы: {{ order.utensils_count }}</span>
            </div>
          </div>
          
          <div v-if="order.comment" class="order-comment">
            "{{ order.comment }}"
          </div>

          <div class="payment-info">
            <span class="badg" :class="order.payment_method">{{ order.payment_method === 'cash' ? 'Наличные' : 'Перевод' }}</span>
            <span v-if="order.payment_method === 'cash' && order.cash_change_from"> (Сдача с {{ order.cash_change_from }})</span>
          </div>
          
          <div class="order-total">
            Total: {{ formatPrice(order.total_amount) }}
          </div>
        </div>

        <div class="status-controls">
          <button 
            v-for="status in statusOptions" 
            :key="status"
            :class="['status-btn', { active: order.status === status }]"
            @click="updateStatus(order.id, status)"
          >
            {{ status }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '../../lib/supabase'
import type { OrderWithItems } from '../../types/database'

const orders = ref<OrderWithItems[]>([])
const loading = ref(true)

const statusOptions = ['new', 'ready'] as const

onMounted(() => {
  loadOrders()
  
  // Realtime subscription
  const channel = supabase
    .channel('public:orders')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
      loadOrders()
    })
    .subscribe()
})

async function loadOrders() {
  loading.value = true
  
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      user:users (*),
      items:order_items (
        menu_item_id,
        quantity,
        price,
        menu_item_name
      )
    `)
    .in('status', ['new', 'ready']) // Only show active orders
    .order('created_at', { ascending: false })

  if (data) {
    orders.value = data as any
  }
  
  loading.value = false
}

async function updateStatus(orderId: string, status: string) {
  await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    
  // Optimistic update
  const order = orders.value.find(o => o.id === orderId)
  if (order) order.status = status as any
  
  // Refresh to be sure
  loadOrders()
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatPrice(price: number) {
  return `${(price / 100).toFixed(0)} ₽`
}
</script>

<style scoped>
.admin-orders {
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

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  background: var(--color-surface);
  border-radius: 16px;
  padding: 16px;
  border-left: 4px solid var(--color-border);
}

.order-card.new { border-left-color: var(--color-accent); }
.order-card.cooking { border-left-color: #f59e0b; }
.order-card.ready { border-left-color: var(--color-success); }
.order-card.completed { border-left-color: var(--color-text-secondary); opacity: 0.7; }

.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  color: var(--color-text-secondary);
  font-size: 12px;
}

.table-number {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
  display: block;
  margin-bottom: 12px;
}

.items-list {
  margin-bottom: 12px;
}

.order-item {
  margin-bottom: 4px;
  font-size: 15px;
}

.order-comment {
  background: rgba(255, 255, 255, 0.05);
  padding: 8px;
  border-radius: 8px;
  font-style: italic;
  margin-bottom: 12px;
  font-size: 14px;
}

.order-total {
  text-align: right;
  font-weight: 700;
  margin-bottom: 16px;
  font-size: 16px;
}

.status-controls {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  background: rgba(0, 0, 0, 0.2);
  padding: 4px;
  border-radius: 8px;
}

.status-btn {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: 11px;
  padding: 6px 2px;
  border-radius: 6px;
  cursor: pointer;
}

.status-btn.active {
  background: var(--color-primary);
  color: white;
  font-weight: 600;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.05);
  padding: 8px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.user-avatar {
  width: 32px;
  height: 32px;
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
  font-weight: bold;
}

.user-details {
  font-size: 0.9rem;
  overflow: hidden;
}

.user-name {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-username {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}
</style>
