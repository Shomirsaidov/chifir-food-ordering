
<template>
  <div class="orders-view">
    <div class="header">
      <button class="back-btn" @click="$router.push('/profile')">
         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <h1>Мои заказы</h1>
      <div class="placeholder"></div>
    </div>

    <div v-if="loading" class="loading-container">
      <div v-for="i in 3" :key="i" class="skeleton-order"></div>
    </div>

    <div v-else-if="error" class="error-state">
        <div class="icon-emoji">⚠️</div>
        <p>Не удалось загрузить заказы</p>
        <p class="error-detail">{{ error }}</p>
        <button @click="loadOrders" class="btn btn-primary">Повторить</button>
    </div>

    <div v-else-if="orders.length === 0" class="empty-state">
      <div class="empty-icon">📋</div>
      <h3>История пуста</h3>
      <p>Вы еще ничего не заказывали</p>
      <button class="btn btn-primary mt-4" @click="$router.push('/')">Перейти к меню</button>
    </div>

    <div v-else class="orders-list">
      <div 
        v-for="order in orders" 
        :key="order.id" 
        class="order-card"
        :class="{ 'expanded': expandedOrders.has(order.id) }"
        @click="toggleExpand(order.id)"
      >
        <div class="order-header">
          <div class="order-main-info">
            <div class="order-top-row">
              <span class="order-id">#{{ order.id.slice(0, 8) }}</span>
              <span class="order-date">{{ formatDate(order.created_at) }}</span>
            </div>
            <div class="order-status-row">
               <span 
                class="status-badge" 
                :class="getStatusClass(order.status)"
               >
                 {{ getStatusText(order.status) }}
               </span>
               <span class="order-total">{{ formatPrice(order.total_amount) }}</span>
            </div>
          </div>
          <div class="chevron-icon" :class="{ rotated: expandedOrders.has(order.id) }">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
        </div>

        <div v-if="expandedOrders.has(order.id)" class="order-details">
          <div class="divider"></div>
          
          <div class="order-items">
            <div v-for="item in order.items" :key="item.id" class="order-item">
              <div class="item-info">
                <span class="item-qty">{{ item.quantity }}x</span>
                <span class="item-name">{{ item.menu_item_name }}</span>
              </div>
              <span class="item-price">{{ formatPrice(item.price * item.quantity) }}</span>
            </div>
          </div>

          <div class="info-block" v-if="order.delivery_type">
             <div class="info-row">
                <span class="label">Тип:</span>
                <span class="value">{{ order.delivery_type === 'delivery' ? '🚗 Доставка' : '🏃 Самовывоз' }}</span>
             </div>
             <div class="info-row" v-if="order.delivery_address">
                <span class="label">Адрес:</span>
                <span class="value">{{ order.delivery_address }}</span>
             </div>
          </div>

          <div class="info-block" v-if="order.payment_method">
            <div class="info-row">
               <span class="label">Оплата:</span>
               <span class="value">{{ order.payment_method === 'cash' ? '💵 Наличные' : '💳 Перевод' }}</span>
            </div>
             <div class="info-row" v-if="order.comment">
                <span class="label">Комментарий:</span>
                <span class="value">{{ order.comment }}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watchEffect } from 'vue'
import { supabase } from '../lib/supabase'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()
const orders = ref([])
const loading = ref(true)
const expandedOrders = ref(new Set())

let subscription = null
const error = ref(null)

// ... existing helper functions (formatPrice, formatDate) ...
function formatPrice(price) {
  if (typeof price !== 'number') return '0 ₽'
  return (price / 100).toFixed(0) + ' ₽'
}

function formatDate(dateString) {
  if (!dateString) return 'Invalid date'
  try {
    const date = new Date(dateString)
    return date.toLocaleString('ru-RU', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  } catch { return 'Invalid date' }
}

// Helper for status classes
function getStatusClass(status) {
  const map = {
    'new': 'status-new',
    'confirmed': 'status-process',
    'cooking': 'status-process',
    'ready': 'status-ready',
    'delivery': 'status-process',
    'completed': 'status-completed',
    'cancelled': 'status-cancelled'
  }
  return map[status] || 'status-default'
}

function getStatusText(status) {
    const map = {
        'new': 'Новый',
        'confirmed': 'Подтвержден',
        'cooking': 'Готовится',
        'ready': 'Готов',
        'delivery': 'В пути',
        'completed': 'Завершен',
        'cancelled': 'Отменен'
    }
    return map[status] || status
}


async function loadOrders() {
  loading.value = true
  error.value = null
  const user = userStore.user
  if (!user) { loading.value = false; return }

  try {
    // Get user ID based on telegram_id
    const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('telegram_id', user.id)
        .single()

    if (!userData) {
      if (import.meta.env.DEV) {
          // Mock data for dev if no user found
          orders.value = [] // or mock
      }
      return
    }

    const { data, error: err } = await supabase
        .from('orders')
        .select(`*, order_items (*)`)
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false })

    if (err) throw err
    
    orders.value = data.map(o => ({ ...o, items: o.order_items || [] }))
  } catch (e) {
      console.error(e)
      error.value = e.message
  } finally {
      loading.value = false
  }
}

function toggleExpand(id) {
  if (expandedOrders.value.has(id)) expandedOrders.value.delete(id)
  else expandedOrders.value.add(id)
}

// Realtime
function setupRealtimeSubscription() {
   // ... keep existing logic
   subscription = supabase
    .channel('public:orders')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => loadOrders())
    .subscribe()
}

onMounted(() => {
    if (userStore.user) {
        loadOrders()
        setupRealtimeSubscription()
    }
})

watchEffect(() => {
    if (userStore.user && loading.value) loadOrders()
})

onUnmounted(() => {
    if (subscription) supabase.removeChannel(subscription)
})
</script>

<style scoped>
.orders-view {
  min-height: 100vh;
  padding-bottom: 20px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: var(--color-primary);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header h1 {
  font-size: 1.25rem;
  margin: 0;
}

.back-btn {
  width: 40px; 
  height: 40px;
  border-radius: 50%;
  background: var(--color-secondary);
  color: var(--color-text);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder { width: 40px; }

.orders-list {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  background: var(--color-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all var(--transition-base);
}

.order-card:active {
  transform: scale(0.99);
}

.order-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-main-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.order-top-row {
  display: flex;
  gap: 12px;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.order-status-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.order-total {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--color-text);
}

.status-badge {
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
}

.status-new { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
.status-process { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
.status-ready { background: rgba(16, 185, 129, 0.2); color: #34d399; }
.status-completed { background: rgba(100, 116, 139, 0.2); color: #94a3b8; }
.status-cancelled { background: rgba(239, 68, 68, 0.2); color: #f87171; }
.status-default { background: var(--color-surface); }

.chevron-icon {
  color: var(--color-text-secondary);
  transition: transform 0.3s ease;
}

.chevron-icon.rotated {
  transform: rotate(180deg);
}

.order-details {
  background: rgba(0, 0, 0, 0.1);
  padding: 0 16px 16px;
}

.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.05);
  margin-bottom: 16px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.item-qty {
  color: var(--color-accent);
  font-weight: 600;
  margin-right: 8px;
  min-width: 24px;
  display: inline-block;
}

.item-name {
  color: var(--color-text-secondary);
}

.item-price {
  font-weight: 600;
}

.info-block {
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
    font-size: 0.9rem;
}

.info-row .label { color: var(--color-text-secondary); }
.info-row .value { text-align: right; font-weight: 500; max-width: 60%; }

/* Loading & Empty States */
.loading-container {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}
.skeleton-order {
    height: 90px;
    background: var(--color-secondary);
    border-radius: var(--radius-lg);
    animation: shimmer 1.5s infinite;
}

.empty-state, .error-state {
    text-align: center;
    padding: 60px 20px;
    color: var(--color-text-secondary);
}

.empty-icon, .icon-emoji { font-size: 4rem; margin-bottom: 16px; opacity: 0.5; }
.mt-4 { margin-top: 16px; }
</style>
