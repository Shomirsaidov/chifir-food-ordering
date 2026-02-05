<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCartStore } from '../stores/cart'
import { hapticFeedback } from '../lib/telegram'
import CartModal from './CartModal.vue'

const cartStore = useCartStore()
const showModal = ref(false)

const formattedTotal = computed(() => {
  return (cartStore.totalAmount / 100).toFixed(0) + ' ₽'
})

function openCart() {
  hapticFeedback('light')
  showModal.value = true
}

function closeCart() {
  showModal.value = false
}
</script>

<template>
  <div class="cart-button-container">
    <button 
      class="cart-button" 
      :class="{ 'has-items': !cartStore.isEmpty, 'pulse': !cartStore.isEmpty }"
      @click="openCart"
    >
      <div class="cart-icon">
        🛒
        <span v-if="cartStore.itemCount > 0" class="badge">{{ cartStore.itemCount }}</span>
      </div>
      <div class="cart-info">
        <div class="cart-label">Корзина</div>
        <div v-if="!cartStore.isEmpty" class="cart-total">{{ formattedTotal }}</div>
      </div>
    </button>
  </div>

  <CartModal :show="showModal" @close="closeCart" />
</template>

<style scoped>
.cart-button-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--spacing-md);
  background: linear-gradient(to top, var(--color-primary) 70%, transparent);
  z-index: 100;
}

.cart-button {
  width: 100%;
  height: var(--cart-button-height);
  background: var(--color-accent);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  box-shadow: var(--shadow-lg);
  transition: all var(--transition-base);
}

.cart-button:active {
  transform: scale(0.98);
}

.cart-button.has-items {
  background: linear-gradient(135deg, var(--color-accent) 0%, #5ba3f5 100%);
}

.cart-icon {
  position: relative;
  font-size: 2rem;
  line-height: 1;
}

.badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--color-error);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.cart-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.cart-label {
  font-size: 1rem;
  font-weight: 500;
  color: white;
}

.cart-total {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
}
</style>
