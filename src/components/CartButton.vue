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
  border-radius: var(--radius-lg); /* Slightly smaller radius for smaller button */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm); /* Reduced gap */
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
  font-size: 1.5rem; /* Reduced from 2rem */
  line-height: 1;
}

.badge {
  position: absolute;
  top: -6px; /* Adjusted position */
  right: -6px; /* Adjusted position */
  background: var(--color-error);
  color: white;
  font-size: 0.7rem; /* Slightly smaller */
  font-weight: 600;
  min-width: 18px; /* Slightly smaller */
  height: 18px; /* Slightly smaller */
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
}

.cart-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.cart-label {
  font-size: 0.9rem; /* Reduced from 1rem */
  font-weight: 500;
  color: white;
  line-height: 1.2;
}

.cart-total {
  font-size: 1.1rem; /* Reduced from 1.25rem */
  font-weight: 700;
  color: white;
  line-height: 1.2;
}
</style>
