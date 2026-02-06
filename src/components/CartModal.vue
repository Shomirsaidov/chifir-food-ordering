<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { hapticFeedback } from '../lib/telegram'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const router = useRouter()
const cartStore = useCartStore()

const formattedTotal = computed(() => {
  return (cartStore.totalAmount / 100).toFixed(0) + ' ₽'
})

function formatPrice(price: number) {
  return (price / 100).toFixed(0) + ' ₽'
}

function updateQuantity(itemId: string, quantity: number) {
  hapticFeedback('light')
  cartStore.updateQuantity(itemId, quantity)
}

function removeItem(itemId: string) {
  hapticFeedback('medium')
  cartStore.removeItem(itemId)
}

function goToCheckout() {
  hapticFeedback('medium')
  emit('close')
  router.push('/checkout')
}

function close() {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay" @click="close">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>Корзина</h2>
            <button class="close-button" @click="close">✕</button>
          </div>

          <div v-if="cartStore.isEmpty" class="empty-cart">
            <div class="empty-icon">🛒</div>
            <p>Корзина пуста</p>
            <button class="btn btn-primary" @click="router.push('/'); emit('close')">Вернуться к меню</button>
          </div>

          <div v-else class="cart-items">
            <div v-for="item in cartStore.items" :key="item.menuItem.id" class="cart-item">
              <img 
                v-if="item.menuItem.image_url" 
                :src="item.menuItem.image_url" 
                :alt="item.menuItem.name"
                class="item-image"
              />
              <div v-else class="item-image-placeholder">🍱</div>

              <div class="item-details">
                <h3>{{ item.menuItem.name }}</h3>
                <p class="item-price">{{ formatPrice(item.menuItem.price) }}</p>
              </div>

              <div class="item-controls">
                <button 
                  class="quantity-btn"
                  @click="updateQuantity(item.menuItem.id, item.quantity - 1)"
                >
                  −
                </button>
                <span class="quantity">{{ item.quantity }}</span>
                <button 
                  class="quantity-btn"
                  @click="updateQuantity(item.menuItem.id, item.quantity + 1)"
                >
                  +
                </button>
              </div>

              <button class="remove-btn" @click="removeItem(item.menuItem.id)">
                🗑️
              </button>
            </div>
          </div>

          <div v-if="!cartStore.isEmpty" class="modal-footer">
            <div class="total">
              <span>Итого:</span>
              <span class="total-amount">{{ formattedTotal }}</span>
            </div>
            <button class="btn btn-success checkout-btn" @click="goToCheckout">
              Оформить заказ
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.modal-content {
  background: var(--color-primary);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  width: 100%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h2 {
  margin: 0;
}

.close-button {
  background: transparent;
  color: var(--color-text);
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-button:hover {
  background: var(--color-secondary);
}

.empty-cart {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  gap: var(--spacing-lg);
}

.empty-icon {
  font-size: 4rem;
  opacity: 0.5;
}

.cart-items {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.cart-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  background: var(--color-secondary);
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
}

.item-image,
.item-image-placeholder {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-md);
  object-fit: cover;
  flex-shrink: 0;
}

.item-image-placeholder {
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.item-details {
  flex: 1;
  min-width: 0;
}

.item-details h3 {
  font-size: 1rem;
  margin: 0 0 var(--spacing-xs) 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-price {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  margin: 0;
}

.item-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

.quantity-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-accent);
  color: white;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity {
  min-width: 24px;
  text-align: center;
  font-weight: 600;
}

.remove-btn {
  background: transparent;
  font-size: 1.25rem;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.modal-footer {
  padding: var(--spacing-lg);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: var(--color-secondary);
}

.total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  font-size: 1.25rem;
}

.total-amount {
  font-weight: 700;
  font-size: 1.5rem;
  color: var(--color-accent);
}

.checkout-btn {
  width: 100%;
  font-size: 1.125rem;
  min-height: 56px;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all var(--transition-base);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: translateY(100%);
}
</style>
