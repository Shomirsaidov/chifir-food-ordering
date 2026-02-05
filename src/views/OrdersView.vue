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

async function formatPrice(price) {
  if (typeof price !== 'number') return '0 ₽'
  return (price / 100).toFixed(0) + ' ₽'
}

function formatDate(dateString) {
  if (!dateString) return 'Unknown date'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Invalid date'
    
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch (e) {
    return 'Date Error'
  }
}
async function loadOrders() {
  error.value = null
  const user = userStore.user
  if (!user) return 

  try {
    // Get user ID
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('telegram_id', user.id)
        .single()

    if (userError) throw userError
    if (!userData) throw new Error('User not found in database')

    // Load orders with items
    const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
        *,
        order_items (*)
        `)
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false })

    if (ordersError) throw ordersError

    if (ordersData) {
        orders.value = ordersData.map((order) => ({
        ...order,
        items: order.order_items || [],
        }))
    }
  } catch (e) {
      console.error('Error loading orders:', e)
      error.value = e.message
  } finally {
      loading.value = false
  }
}

function setupRealtimeSubscription() {
  const user = userStore.user
  if (!user) return

  try {
    subscription = supabase
        .channel('orders_changes')
        .on(
        'postgres_changes',
        {
            event: '*',
            schema: 'public',
            table: 'orders',
        },
        () => {
            loadOrders()
        }
        )
        .subscribe()
  } catch (e) {
      console.error('Subscription error:', e)
  }
}

// ... helper functions ...

onMounted(() => {
    // Initial check
    if (userStore.user) {
        loadOrders()
        setupRealtimeSubscription()
    }
})

// React when user loads
watchEffect(() => {
    if (userStore.user && loading.value) {
        loadOrders()
        setupRealtimeSubscription()
    }
})

onUnmounted(() => {
  if (subscription) {
    supabase.removeChannel(subscription)
  }
})
</script>

<template>
  <div class="orders-view">
    <h1>Мои заказы</h1>

    <div v-if="loading" class="loading">
      <div v-for="i in 3" :key="i" class="skeleton-order"></div>
    </div>

    <div v-else-if="error" class="error-state">
        <p>Ошибка загрузки заказов</p>
        <p class="error-detail">{{ error }}</p>
        <button @click="loadOrders" class="retry-btn">Попробовать снова</button>
    </div>

    <div v-else-if="orders.length === 0" class="empty-state">
      <div class="empty-icon">📋</div>
      <p>У вас пока нет заказов</p>
    </div>

    <div v-else class="orders-list">
      <div v-for="order in orders" :key="order.id" class="order-card card">
        <div class="order-header" @click="toggleExpand(order.id)">
          <div class="order-info">
            <div class="order-date">{{ formatDate(order.created_at) }}</div>
            <div class="order-location">
              <span v-if="order.delivery_type === 'delivery'">🚗 Доставка: {{ order.delivery_address }}</span>
              <span v-else>🏃 Самовывоз</span>
            </div>
          </div>
          <div class="order-status-badge" :style="{ backgroundColor: getStatusColor(order.status) }">
            {{ getStatusText(order.status) }}
          </div>
        </div>

        <div v-if="expandedOrders.has(order.id)" class="order-details">
          <div class="order-items">
            <div v-for="item in order.items" :key="item.id" class="order-item">
              <span class="item-name">{{ item.menu_item_name }} × {{ item.quantity }}</span>
              <span class="item-price">{{ formatPrice(item.price * item.quantity) }}</span>
            </div>
          </div>

          <div v-if="order.comment" class="order-comment">
            <strong>Комментарий:</strong> {{ order.comment }}
          </div>

          <div class="order-extra-info">
            <div>💳 Оплата: {{ order.payment_method === 'cash' ? 'Наличные' : 'Перевод' }}</div>
            <div v-if="order.payment_method === 'cash' && order.cash_change_from">💵 Сдача с: {{ order.cash_change_from }}</div>
            <div>🍴 Приборы: {{ order.utensils_count }}</div>
          </div>

          <div class="order-total">
            <span>Итого:</span>
            <span class="total-amount">{{ formatPrice(order.total_amount) }}</span>
          </div>
        </div>

        <div v-else class="order-summary">
          <span class="items-count">{{ order.items.length }} {{ order.items.length === 1 ? 'позиция' : 'позиции' }}</span>
          <span class="total-amount">{{ formatPrice(order.total_amount) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.orders-view {
  padding: var(--spacing-lg) var(--spacing-md);
  padding-bottom: calc(var(--cart-button-height) + var(--spacing-lg));
}

.orders-view h1 {
  margin-bottom: var(--spacing-lg);
}

.loading {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.skeleton-order {
  height: 120px;
  background: var(--color-secondary);
  border-radius: var(--radius-lg);
  animation: loading 1.5s ease-in-out infinite;
}

.empty-state {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-secondary);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-md);
  opacity: 0.5;
}

.error-state {
    text-align: center;
    padding: var(--spacing-xl);
    color: var(--color-error);
}

.error-detail {
    font-size: 0.8rem;
    margin-bottom: 1rem;
    opacity: 0.8;
}

.retry-btn {
    background: var(--color-primary);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.order-card {
  cursor: pointer;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.order-info {
  flex: 1;
}

.order-date {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
}

.order-location {
  font-weight: 600;
}

.order-status-badge {
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-md);
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
}

.order-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-md);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.items-count {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.order-details {
  padding-top: var(--spacing-md);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-name {
  color: var(--color-text-secondary);
}

.item-price {
  font-weight: 600;
}

.order-comment {
  padding: var(--spacing-md);
  background: var(--color-primary);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
  font-size: 0.875rem;
}

.order-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.125rem;
  font-weight: 600;
}

.total-amount {
  color: var(--color-accent);
  font-weight: 700;
}
</style>
