<template>
  <div class="product-detail">
    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <div class="skeleton-image"></div>
      <div class="skeleton-text"></div>
      <div class="skeleton-text"></div>
    </div>

    <!-- Product Content -->
    <div v-else-if="product" class="product-content">
      <!-- Product Image -->
      <div class="product-image">
        <ProductImage
          :image-loc="product.image_loc"
          :image-url="product.image_url"
          :alt="product.name"
          placeholder="🍱"
        />
        
      </div>

      <!-- Product Info -->
      <div class="product-info">
        <h1 class="product-name">{{ product.name }}</h1>
        <p class="product-description">{{ product.description }}</p>

        <!-- Properties Section (if you want to add ingredients, weight, etc.) -->
        <div class="properties">
          <button class="properties-button" @click="showProperties = !showProperties">
            Свойства
            <span class="arrow" :class="{ open: showProperties }">›</span>
          </button>
          
          <div v-if="showProperties" class="properties-content">
            <p class="property-text">{{ product.description }}</p>
            <!-- Add more properties here if needed -->
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="error">
      <p>Товар не найден</p>
      <button @click="$router.push('/')" class="back-button">Вернуться в меню</button>
    </div>

    <!-- Bottom Action Bar -->
    <div v-if="product" class="action-bar">
      <!-- If item is already in cart, show controls [-] Qty [+] -->
      <div v-if="cartQuantity > 0" class="cart-controls">
        <button @click="decreaseCartQuantity" class="control-btn minus">−</button>
        <span class="quantity-display">
          <span class="qty">{{ cartQuantity }}</span>
          <span class="price-sum">{{ formatPrice(product.price * cartQuantity) }}</span>
        </span>
        <button @click="increaseCartQuantity" class="control-btn plus">+</button>
      </div>

      <!-- Otherwise show big ADD button -->
      <button v-else @click="increaseCartQuantity" class="add-to-cart-btn">
        В КОРЗИНУ {{ formatPrice(product.price) }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../lib/supabase'
import { useCartStore } from '../stores/cart'
import ProductImage from '../components/ProductImage.vue'

const route = useRoute()
const cartStore = useCartStore()

const product = ref(null)
const loading = ref(true)
const showProperties = ref(false)

// Computed quantity from cart for this specific item
const cartQuantity = computed(() => {
  if (!product.value) return 0
  const cartItem = cartStore.items.find(i => i.menuItem.id === product.value?.id)
  return cartItem ? cartItem.quantity : 0
})

onMounted(async () => {
  await loadProduct()
})

async function loadProduct() {
  loading.value = true
  const productId = route.params.id

  const { data } = await supabase
    .from('menu_items')
    .select('*')
    .eq('id', productId)
    .single()

  if (data) {
    product.value = data
  }

  loading.value = false
}

function increaseCartQuantity() {
  if (!product.value) return
  cartStore.addItem(product.value)
}

function decreaseCartQuantity() {
  if (!product.value) return
  const currentQty = cartQuantity.value
  if (currentQty > 0) {
    cartStore.updateQuantity(product.value.id, currentQty - 1)
  }
}

function formatPrice(price) {
  return `${(price / 100).toFixed(0)} ₽` // Changed to 0 decimals for consistency
}
</script>

<style scoped>
/* ... existing styles ... */
/* New styles for cart controls */
.cart-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: var(--color-surface);
  padding: 4px;
  border-radius: 16px;
  border: 1px solid var(--color-primary); /* Highlight active state */
}

.control-btn {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  border: none;
  background: var(--color-primary);
  color: white;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.control-btn:active {
  transform: scale(0.95);
}

.quantity-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.qty {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
}

.price-sum {
  font-size: 12px;
  color: var(--color-text-secondary);
}
/* ... existing styles ... */
</style>

<style scoped>
.product-detail {
  min-height: 100vh;
  background: var(--color-background);
  padding-bottom: 100px;
}

.loading {
  padding: 20px;
}

.skeleton-image {
  width: 100%;
  height: 400px;
  background: var(--color-surface);
  border-radius: 0 0 24px 24px;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-text {
  height: 20px;
  background: var(--color-surface);
  border-radius: 8px;
  margin: 16px 20px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.product-content {
  display: flex;
  flex-direction: column;
}

.product-image {
  position: relative;
  width: 100%;
  height: 400px;
  background: var(--color-surface);
  border-radius: 0 0 24px 24px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 120px;
  background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-background-soft) 100%);
}

.badge {
  position: absolute;
  top: 20px;
  left: 20px;
  background: var(--color-success);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.product-info {
  padding: 24px 20px;
}

.product-name {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 12px 0;
}

.product-description {
  font-size: 16px;
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin: 0 0 24px 0;
}

.properties {
  margin-top: 24px;
}

.properties-button {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  background: none;
  border: none;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-primary);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.arrow {
  transition: transform 0.3s ease;
  font-size: 24px;
  font-weight: 300;
}

.arrow.open {
  transform: rotate(90deg);
}

.properties-content {
  padding: 16px 0;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.property-text {
  color: var(--color-text-secondary);
  font-size: 15px;
  line-height: 1.6;
  margin: 0;
}

.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  padding: 20px;
  text-align: center;
}

.error p {
  font-size: 18px;
  color: var(--color-text-secondary);
  margin-bottom: 20px;
}

.back-button {
  padding: 12px 24px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-background);
  padding: 16px 20px;
  display: flex;
  gap: 12px;
  align-items: center;
  border-top: 1px solid var(--color-border);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--color-surface);
  border-radius: 16px;
  padding: 8px;
}

.quantity-btn {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: none;
  background: var(--color-primary);
  color: white;
  font-size: 24px;
  font-weight: 300;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.quantity-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.quantity-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.quantity {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  min-width: 30px;
  text-align: center;
}

.add-to-cart-btn {
  flex: 1;
  padding: 16px 24px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.add-to-cart-btn:active {
  transform: scale(0.98);
}
</style>
