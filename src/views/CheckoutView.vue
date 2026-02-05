<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useUserStore } from '../stores/user'
import { supabase } from '../lib/supabase'
import { hapticFeedback } from '../lib/telegram'
import LocationPicker from '../components/LocationPicker.vue'

const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()

// State
const deliveryType = ref('delivery')
const address = ref('')
const phoneNumber = ref('')
const paymentMethod = ref('transfer')
const utensilsCount = ref(1)
const cashChangeFrom = ref('')
const comment = ref('')
const coordinates = ref(null)
const loading = ref(false)
const error = ref('')

// Computed
const formattedTotal = computed(() => {
  return (cartStore.totalAmount / 100).toFixed(0) + ' \u20BD' // Ruble sign
})

function formatPrice(price) {
  return (price / 100).toFixed(0) + ' \u20BD'
}

function updateLocation(loc) {
  coordinates.value = loc
}

async function submitOrder() {
  error.value = ''
  
  // Validation
  if (!phoneNumber.value.trim()) {
    error.value = 'Пожалуйста, укажите номер телефона'
    return
  }
  
  if (deliveryType.value === 'delivery') {
    if (!address.value.trim()) {
      error.value = 'Пожалуйста, укажите адрес доставки'
      return
    }
    if (!coordinates.value) {
      error.value = 'Пожалуйста, укажите местоположение на карте'
      return
    }
  }

  loading.value = true

  try {
    const user = userStore.user
    const telegramId = user?.id || 123456789 // Fallback for dev

    // User logic: Upsert user
    let userData
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('telegram_id', telegramId)
      .single()

    if (existingUser) {
      userData = existingUser
    } else {
      console.log('User not found, creating...')
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .upsert({
            telegram_id: telegramId,
            username: user?.username || null,
            first_name: user?.first_name || 'Guest',
            last_name: user?.last_name || null,
            updated_at: new Date().toISOString(),
        })
        .select('id')
        .single()
      
      if (createError) throw new Error('Failed to create user record: ' + createError.message)
      userData = newUser
    }

    if (!userData) throw new Error('Не удалось подтвердить пользователя')

    // Create Order
    const orderData = {
      user_id: userData.id,
      delivery_type: deliveryType.value,
      phone_number: phoneNumber.value.trim(),
      payment_method: paymentMethod.value,
      utensils_count: utensilsCount.value,
      cash_change_from: paymentMethod.value === 'cash' ? cashChangeFrom.value : null,
      comment: comment.value.trim() || null,
      total_amount: cartStore.totalAmount,
      status: 'new',
      // Delivery specific
      delivery_address: deliveryType.value === 'delivery' ? address.value.trim() : null,
      delivery_coordinates: deliveryType.value === 'delivery' ? coordinates.value : null,
      table_location: null // No longer used
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    if (orderError) throw orderError

    // Create Items
    const orderItems = cartStore.items.map((item) => ({
      order_id: order.id,
      menu_item_id: item.menuItem.id,
      menu_item_name: item.menuItem.name,
      quantity: item.quantity,
      price: item.menuItem.price,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    // Success
    hapticFeedback('success')
    cartStore.clearCart()
    router.push('/orders')

  } catch (err) {
    console.error('Order error:', err)
    error.value = err.message || 'Ошибка при оформлении заказа'
    hapticFeedback('error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="checkout-view">
    <div class="header">
      <button class="back-btn" @click="router.back()">← Назад</button>
      <h1>Оформление заказа</h1>
    </div>

    <div class="order-summary card">
      <h2>Ваш заказ</h2>
      <div class="order-items">
        <div v-for="item in cartStore.items" :key="item.menuItem.id" class="order-item">
          <span class="item-name">{{ item.menuItem.name }} × {{ item.quantity }}</span>
          <span class="item-price">{{ formatPrice(item.menuItem.price * item.quantity) }}</span>
        </div>
      </div>
      <div class="total">
        <span>Итого:</span>
        <span class="total-amount">{{ formattedTotal }}</span>
      </div>
    </div>

    <!-- Delivery Type Toggle -->
    <div class="delivery-toggle">
      <button 
        class="toggle-btn" 
        :class="{ active: deliveryType === 'delivery' }"
        @click="deliveryType = 'delivery'"
      >
        🚗 Доставка
      </button>
      <button 
        class="toggle-btn" 
        :class="{ active: deliveryType === 'pickup' }"
        @click="deliveryType = 'pickup'"
      >
        🏃 Самовывоз
      </button>
    </div>

    <form @submit.prevent="submitOrder" class="checkout-form">
      
      <!-- Delivery Fields -->
      <div v-if="deliveryType === 'delivery'" class="delivery-section">
        <div class="form-group">
          <label>Укажите место на карте</label>
          <LocationPicker @update:location="updateLocation" />
        </div>

        <div class="form-group">
          <label for="address">Точный адрес *</label>
          <input
            id="address"
            v-model="address"
            type="text"
            placeholder="Улица, дом, квартира, подъезд..."
            required
          />
        </div>
      </div>

      <!-- Pickup Info -->
      <div v-else class="pickup-info">
        <p>📍 <strong>Самовывоз по адресу:</strong></p>
        <p>ул. Рудаки 15, Душанбе</p>
      </div>

      <!-- Common Fields -->
      <div class="form-group">
        <label for="phone">Номер телефона *</label>
        <input
          id="phone"
          v-model="phoneNumber"
          type="tel"
          placeholder="+992 00 000 0000"
          required
        />
      </div>

      <!-- Payment Method -->
      <div class="form-group">
        <label>Способ оплаты</label>
        <div class="payment-toggle">
          <button 
            type="button"
            class="toggle-btn" 
            :class="{ active: paymentMethod === 'transfer' }"
            @click="paymentMethod = 'transfer'"
          >
            💳 Перевод
          </button>
          <button 
            type="button"
            class="toggle-btn" 
            :class="{ active: paymentMethod === 'cash' }"
            @click="paymentMethod = 'cash'"
          >
            💵 Наличные
          </button>
        </div>
      </div>

      <div v-if="paymentMethod === 'cash'" class="form-group">
        <label for="change">Сдача с какой суммы?</label>
        <input
          id="change"
          v-model="cashChangeFrom"
          type="text"
          placeholder="Например: 5000"
        />
      </div>

      <!-- Utensils -->
      <div class="form-group">
        <label>Количество приборов</label>
        <div class="counter-control">
          <button type="button" class="control-btn" @click="utensilsCount > 0 ? utensilsCount-- : null">-</button>
          <span class="count-value">{{ utensilsCount }}</span>
          <button type="button" class="control-btn" @click="utensilsCount++">+</button>
        </div>
      </div>

      <div class="form-group">
        <label for="comment">Комментарий</label>
        <textarea
          id="comment"
          v-model="comment"
          rows="3"
          placeholder="Особые пожелания к заказу..."
        ></textarea>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <button
        type="submit"
        class="btn btn-success submit-btn"
        :disabled="loading || cartStore.isEmpty"
      >
        {{ loading ? 'Оформление...' : 'Подтвердить заказ' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.checkout-view {
  padding: var(--spacing-lg) var(--spacing-md);
  padding-bottom: calc(var(--cart-button-height) + var(--spacing-lg));
}

.header {
  margin-bottom: var(--spacing-lg);
}

.back-btn {
  background: transparent;
  color: var(--color-text);
  padding: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  font-size: 1rem;
}

.header h1 {
  margin: 0;
}

.order-summary {
  margin-bottom: var(--spacing-lg);
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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

.total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.25rem;
  font-weight: 600;
}

.total-amount {
  color: var(--color-accent);
  font-size: 1.5rem;
}

.delivery-toggle {
  display: flex;
  background: var(--color-secondary);
  padding: 4px;
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-lg);
}

.toggle-btn {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  padding: 12px;
  font-size: 1rem;
  font-weight: 500;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn.active {
  background: var(--color-surface);
  color: var(--color-text);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.checkout-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.form-group label {
  font-weight: 500;
  color: var(--color-text-secondary);
}

.delivery-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.pickup-info {
  background: rgba(74, 144, 226, 0.1);
  border: 1px solid var(--color-accent);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
}

.pickup-info p {
  margin: 8px 0;
}

.error-message {
  padding: var(--spacing-md);
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid var(--color-error);
  border-radius: var(--radius-md);
  color: var(--color-error);
}

.submit-btn {
  width: 100%;
  font-size: 1.125rem;
  min-height: 56px;
  margin-top: var(--spacing-md);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.payment-toggle {
  display: flex;
  gap: 10px;
}

.counter-control {
  display: flex;
  align-items: center;
  gap: 15px;
  background: var(--color-surface);
  padding: 5px;
  border-radius: 8px;
  width: fit-content;
}

.control-btn {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  background: var(--color-secondary);
  color: var(--color-text);
  border: none;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.count-value {
  font-size: 1.1rem;
  font-weight: 600;
  min-width: 24px;
  text-align: center;
}

/* Map specific tweaks */
:deep(.leaflet-container) {
  font-family: inherit;
  z-index: 1;
}
</style>
