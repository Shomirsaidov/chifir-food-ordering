<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useUserStore } from '../stores/user'
import { supabase } from '../lib/supabase'
import { hapticFeedback, sendTelegramNotification } from '../lib/telegram'
import LocationPicker from '../components/LocationPicker.vue'

const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()

// State
const deliveryType = ref('delivery')
const street = ref('')
const house = ref('')
const apartment = ref('')
const phoneNumber = ref('+7 ')
const paymentMethod = ref('transfer')
const utensilsCount = ref(1)
const cashChangeFrom = ref('')
const comment = ref('')
const coordinates = ref(null)
const loading = ref(false)
const error = ref('')

// Computed
const deliveryFee = computed(() => {
  return (deliveryType.value === 'delivery' && cartStore.totalAmount < 120000) ? 15000 : 0
})

const formattedTotal = computed(() => {
  return ((cartStore.totalAmount + deliveryFee.value) / 100).toFixed(0) + ' \u20BD' // Ruble sign
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
    hapticFeedback('error')
    return
  }
  
  if (deliveryType.value === 'delivery') {
    if (!street.value.trim() || !house.value.trim()) {
      error.value = 'Пожалуйста, укажите улицу и номер дома'
      hapticFeedback('error')
      return
    }
    if (!coordinates.value) {
      error.value = 'Пожалуйста, укажите местоположение на карте'
      hapticFeedback('error')
      return
    }
  }

  loading.value = true

  try {
    const user = userStore.user
    const telegramId = user?.id

    if (!telegramId && !import.meta.env.DEV) {
        throw new Error('User identification failed')
    }

    // User logic: Upsert user
    const safeTelegramId = telegramId || 123456789
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert({
          telegram_id: safeTelegramId,
          username: user?.username || null,
          first_name: user?.first_name || 'Guest',
          last_name: user?.last_name || null,
          updated_at: new Date().toISOString(),
      }, { onConflict: 'telegram_id' })
      .select('id, telegram_id')
      .single()

    if (userError) throw userError

    // Create Order
    const orderData = {
      user_id: userData.id,
      delivery_type: deliveryType.value,
      phone_number: phoneNumber.value.trim(),
      payment_method: paymentMethod.value,
      utensils_count: utensilsCount.value,
      cash_change_from: paymentMethod.value === 'cash' ? cashChangeFrom.value : null,
      comment: comment.value.trim() || null,
      total_amount: cartStore.totalAmount + deliveryFee.value,
      status: 'new',
      delivery_address: deliveryType.value === 'delivery' 
        ? `${street.value.trim()}, д. ${house.value.trim()}${apartment.value.trim() ? `, кв. ${apartment.value.trim()}` : ''}` 
        : null,
      delivery_coordinates: deliveryType.value === 'delivery' ? coordinates.value : null,
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

    // Get count for notification
    const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userData.id)

    // Notify Telegram
    try {
        await sendTelegramNotification(order, userData, cartStore.items, count || 1, deliveryFee.value)
    } catch (e) {
        console.warn('Telegram notification failed:', e)
        // We don't throw here so the user still sees their order as successful
    }

    hapticFeedback('success')
    cartStore.clearCart()
    router.replace('/orders')

  } catch (err) {
    console.error('Order submission error:', err)
    
    let userMessage = 'Ошибка при оформлении заказа'
    if (err.name === 'TypeError' && err.message === 'Load failed') {
      userMessage = 'Ошибка сети. Пожалуйста, попробуйте еще раз или проверьте интернет.'
    } else if (err.message) {
      userMessage = err.message
    }
    
    error.value = userMessage
    hapticFeedback('error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="checkout-view">
    <div class="header">
      <button class="back-btn" @click="router.back()">
         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <h1>Оформление</h1>
      <div class="placeholder"></div>
    </div>

    <!-- Order summary card -->
    <div class="summary-card card">
      <div class="card-header">
        <h2>Ваш заказ</h2>
        <span class="items-count">{{ cartStore.items.length }} поз.</span>
      </div>
      
      <div class="order-items-scroll">
        <div v-for="item in cartStore.items" :key="item.menuItem.id" class="mini-item">
           <div class="item-name">{{ item.menuItem.name }}</div>
           <div class="item-right">
             <span class="item-qty">{{ item.quantity }}x</span>
             <span class="item-price">{{ formatPrice(item.menuItem.price * item.quantity) }}</span>
           </div>
        </div>
      </div>
      
      <div class="summary-details">
        <div class="summary-row">
          <span>Сумма заказа</span>
          <span>{{ formatPrice(cartStore.totalAmount) }}</span>
        </div>
        <div class="summary-row" :class="{ 'free-delivery': deliveryFee === 0 && deliveryType === 'delivery' }">
          <span>Доставка</span>
          <span>{{ deliveryType === 'delivery' ? (deliveryFee > 0 ? formatPrice(deliveryFee) : 'Бесплатно') : '—' }}</span>
        </div>
      </div>
      
      <div class="total-row">
        <span>Итого к оплате</span>
        <span class="total-amount">{{ formattedTotal }}</span>
      </div>
    </div>

    <form @submit.prevent="submitOrder" class="checkout-form">
      
      <!-- Delivery Type -->
      <div class="section-title">Тип доставки</div>
      <div class="toggle-group">
        <button 
          type="button"
          class="toggle-option" 
          :class="{ active: deliveryType === 'delivery' }"
          @click="deliveryType = 'delivery'"
        >
          🚗 Доставка
        </button>
        <button 
          type="button"
          class="toggle-option" 
          :class="{ active: deliveryType === 'pickup' }"
          @click="deliveryType = 'pickup'"
        >
          🏃 Самовывоз
        </button>
      </div>

      <!-- Delivery Fields -->
      <transition name="fade" mode="out-in">
        <div v-if="deliveryType === 'delivery'" class="form-section">
          <div class="form-group" style="margin-bottom: 15px;">
            <input
              id="street"
              v-model="street"
              type="text"
              class="input-field"
              placeholder="Улица"
              required
            />
          </div>
          <div class="address-grid">
            <div class="form-group">
              <input
                id="house"
                v-model="house"
                type="text"
                class="input-field"
                placeholder="Дом"
                required
              />
            </div>
            <div class="form-group">
              <input
                id="apartment"
                v-model="apartment"
                type="text"
                class="input-field"
                placeholder="Номер (кв/офис)"
              />
            </div>
          </div>
          <div class="form-group">
            <label>На карте</label>
            <LocationPicker @update:location="updateLocation" />
          </div>
        </div>

        <div v-else class="pickup-card">
          <div class="icon">📍</div>
          <div>
            <strong>Адрес ресторана:</strong>
            <p>Галий Кайбицкой 6а, Казань</p>
          </div>
        </div>
      </transition>

      <!-- Contact Info -->
      <div class="section-title">Контакты</div>
      <div class="form-group">
         <div class="input-wrapper">
            <span class="input-icon">📞</span>
            <input
              id="phone"
              v-model="phoneNumber"
              type="tel"
              class="input-field with-icon"
              placeholder="+992 00 000 0000"
              required
            />
         </div>
      </div>

      <!-- Payment -->
      <div class="section-title">Оплата</div>
      <div class="toggle-group">
          <button 
            type="button"
            class="toggle-option" 
            :class="{ active: paymentMethod === 'transfer' }"
            @click="paymentMethod = 'transfer'"
          >
            💳 Перевод
          </button>
          <button 
            type="button"
            class="toggle-option" 
            :class="{ active: paymentMethod === 'cash' }"
            @click="paymentMethod = 'cash'"
          >
            💵 Наличные
          </button>
      </div>

      <div v-if="paymentMethod === 'cash'" class="form-group mt-2">
        <input
          v-model="cashChangeFrom"
          type="text"
          class="input-field"
          placeholder="Сдача с (например 5000)"
        />
      </div>

      <!-- Extra -->
      <div class="section-title">Детали</div>
      <div class="extras-grid">
         <div class="extra-item">
            <label>Приборы</label>
            <div class="counter-small">
              <button type="button" @click="utensilsCount > 0 ? utensilsCount-- : null">-</button>
              <span>{{ utensilsCount }}</span>
              <button type="button" @click="utensilsCount++">+</button>
            </div>
         </div>
      </div>

      <div class="form-group">
        <textarea
          v-model="comment"
          rows="2"
          class="input-field textarea"
          placeholder="Комментарий к заказу..."
        ></textarea>
      </div>

      <div v-if="error" class="error-banner">
        ⚠️ {{ error }}
      </div>

      <!-- Sticky Submit Button -->
      <div class="fixed-footer glass">
         <button
            type="submit"
            class="btn btn-primary submit-btn"
            :disabled="loading || cartStore.isEmpty"
          >
            <span v-if="loading" class="spinner"></span>
            <span v-else>Оформить заказ • {{ formattedTotal }}</span>
          </button>
      </div>
    </form>
    
    <!-- Spacer for fixed footer -->
    <div style="height: 80px;"></div>
  </div>
</template>

<style scoped>
.checkout-view {
  min-height: 100vh;
  padding: 16px 20px;
  background: var(--color-primary);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
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

/* Summary Card */
.summary-card {
  background: var(--color-secondary);
  padding: 20px;
  border-radius: var(--radius-xl);
  margin-bottom: 32px;
  border: 1px solid rgba(255,255,255,0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-header h2 { font-size: 1.1rem; margin: 0; }
.items-count { color: var(--color-text-secondary); font-size: 0.9rem; }

.order-items-scroll {
  max-height: 150px;
  overflow-y: auto;
  margin-bottom: 16px;
  padding-right: 4px;
}

.mini-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.item-name { color: var(--color-text-secondary); flex: 1; }
.item-right { display: flex; gap: 8px; font-weight: 500; }
.item-qty { color: var(--color-accent); }

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
  font-size: 1.1rem;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.total-amount { color: var(--color-accent); }

.summary-details {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.free-delivery span:last-child {
  color: #10b981;
  font-weight: 600;
}

.address-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

/* Forms */
.checkout-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-title {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
  font-weight: 600;
  margin-bottom: -8px; 
  padding-left: 4px;
}

.toggle-group {
    display: flex;
    background: var(--color-secondary);
    padding: 4px;
    border-radius: var(--radius-lg);
}

.toggle-option {
    flex: 1;
    padding: 12px;
    background: transparent;
    color: var(--color-text-secondary);
    border: none;
    border-radius: var(--radius-md);
    font-weight: 600;
    transition: all 0.2s;
}

.toggle-option.active {
    background: var(--color-surface);
    color: white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.input-field {
    width: 100%;
    padding: 14px 16px;
    background: var(--color-secondary);
    border: 1px solid transparent;
    border-radius: var(--radius-lg);
    color: white;
    font-size: 1rem;
    transition: all 0.2s;
}

.input-field:focus {
    border-color: var(--color-accent);
    background: var(--color-surface);
}

.pickup-card {
    padding: 20px;
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid var(--color-accent);
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    gap: 16px;
}

.pickup-card .icon { font-size: 1.5rem; }

.input-wrapper { position: relative; }
.input-icon { position: absolute; left: 16px; top: 14px; z-index: 2; }
.with-icon { padding-left: 44px; }

.extras-grid {
    display: flex;
    gap: 16px;
}

.extra-item {
    background: var(--color-secondary);
    padding: 12px 16px;
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 1;
}

.counter-small {
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--color-primary);
    padding: 4px 8px;
    border-radius: 8px;
}

.counter-small button {
    width: 24px;
    height: 24px;
    background: var(--color-secondary);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
}

.textarea { resize: none; }

.error-banner {
    background: rgba(239, 68, 68, 0.1);
    color: var(--color-error);
    padding: 12px;
    border-radius: var(--radius-md);
    text-align: center;
    font-size: 0.9rem;
}

.fixed-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 20px 24px;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  z-index: 50;
}

.submit-btn {
  width: 100%;
  height: 56px;
  font-size: 1.125rem;
  border-radius: var(--radius-xl);
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
    width: 24px;
    height: 24px;
    border: 3px solid rgba(255,255,255,0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s ease-in-out infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
