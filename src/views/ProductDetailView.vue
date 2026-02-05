<template>
  <div class="product-detail">
    <!-- Header -->
    <div class="header">
      <button class="back-btn" @click="router.back()">
         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <div class="actions">
         <button class="icon-btn" @click="toggleFavorite">
            <svg v-if="isFavorite" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-error"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
         </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="skeleton-image"></div>
      <div class="skeleton-text title"></div>
      <div class="skeleton-text desc"></div>
    </div>

    <!-- Product Content -->
    <div v-else-if="product" class="content-wrapper">
      <!-- Product Image -->
      <div class="image-container">
        <ProductImage
          :image-loc="product.image_loc"
          :image-url="product.image_url"
          :alt="product.name"
          class="product-image"
        />
        <div class="image-overlay"></div>
      </div>

      <!-- Product Info -->
      <div class="product-info-card glass">
        <div class="info-header">
           <h1 class="product-name">{{ product.name }}</h1>
           <div class="price-badge">{{ formatPrice(product.price) }}</div>
        </div>
        
        <p class="product-description">{{ product.description }}</p>

        <!-- Properties Section -->
        <div class="properties-section">
           <div class="property-row">
              <span class="label">Вес</span>
              <span class="value">250 г</span>
           </div>
           <div class="property-row">
              <span class="label">Ккал</span>
              <span class="value">320</span>
           </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="error-state">
      <div class="icon-emoji">🔍</div>
      <p>Товар не найден</p>
      <button @click="router.push('/')" class="btn btn-primary mt-4">Вернуться в меню</button>
    </div>

    <!-- Bottom Action Bar -->
    <div v-if="product" class="action-bar glass">
      <!-- If item is already in cart, show controls [-] Qty [+] -->
      <div v-if="cartQuantity > 0" class="cart-controls">
        <button @click="decreaseCartQuantity" class="control-btn minus">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
        <span class="quantity-display">
          <span class="qty">{{ cartQuantity }}</span>
          <span class="price-sum">{{ formatPrice(product.price * cartQuantity) }}</span>
        </span>
        <button @click="increaseCartQuantity" class="control-btn plus">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      </div>

      <!-- Otherwise show big ADD button -->
      <button v-else @click="increaseCartQuantity" class="btn btn-primary add-to-cart-btn">
        <span class="btn-text">В корзину</span>
        <span class="btn-price">{{ formatPrice(product.price) }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import { useCartStore } from '../stores/cart'
import ProductImage from '../components/ProductImage.vue'
import { hapticFeedback } from '../lib/telegram'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const product = ref(null)
const loading = ref(true)
const isFavorite = ref(false)

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
  hapticFeedback('selection')
  cartStore.addItem(product.value)
}

function decreaseCartQuantity() {
  if (!product.value) return
  hapticFeedback('selection')
  const currentQty = cartQuantity.value
  if (currentQty > 0) {
    cartStore.updateQuantity(product.value.id, currentQty - 1)
  }
}

function toggleFavorite() {
    isFavorite.value = !isFavorite.value
    hapticFeedback('light')
}

function formatPrice(price) {
  return `${(price / 100).toFixed(0)} ₽`
}
</script>

<style scoped>
.product-detail {
  min-height: 100vh;
  background: var(--color-primary);
  padding-bottom: 100px;
  position: relative;
}

/* Header */
.header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  padding: 16px 20px;
}

.back-btn, .icon-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all var(--transition-base);
}

.back-btn:active, .icon-btn:active {
    transform: scale(0.95);
}

.text-error { color: var(--color-error); }

/* Image */
.image-container {
  width: 100%;
  height: 400px;
  position: relative;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 150px;
    background: linear-gradient(to bottom, transparent, var(--color-primary));
    pointer-events: none;
}

/* Info Card */
.product-info-card {
    margin-top: -60px;
    position: relative;
    z-index: 5;
    padding: 24px;
    border-radius: 30px 30px 0 0;
    border-width: 1px 0 0 0;
    background: var(--color-primary); /* Fallback */
    background: linear-gradient(to bottom, rgba(30, 41, 59, 0.95), var(--color-primary));
    min-height: 400px;
}

.info-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
}

.product-name {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.1;
  flex: 1;
  padding-right: 16px;
}

.price-badge {
    background: var(--color-accent);
    color: white;
    padding: 6px 12px;
    border-radius: var(--radius-lg);
    font-weight: 700;
    font-size: 1.1rem;
    white-space: nowrap;
}

.product-description {
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: 24px;
}

.properties-section {
    display: flex;
    gap: 20px;
    padding: 16px;
    background: var(--color-secondary);
    border-radius: var(--radius-lg);
}

.property-row {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}

.property-row .label {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.property-row .value {
    font-weight: 600;
    color: var(--color-text);
}

/* Loading */
.loading-container {
  padding: 0;
}

.skeleton-image {
  width: 100%;
  height: 400px;
  background: var(--color-secondary);
  animation: shimmer 1.5s infinite;
}

.skeleton-text {
  height: 20px;
  background: var(--color-secondary);
  border-radius: 8px;
  margin: 16px 20px;
  animation: shimmer 1.5s infinite;
}

/* Error */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  text-align: center;
}

.icon-emoji { font-size: 4rem; opacity: 0.5; margin-bottom: 16px; }

/* Action Bar */
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(15, 23, 42, 0.9);
  padding: 16px 20px;
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  z-index: 50;
  display: flex;
  justify-content: center;
}

/* Cart Controls */
.cart-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 400px;
  background: var(--color-secondary);
  padding: 6px;
  border-radius: var(--radius-xl);
}

.control-btn {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  border: none;
  background: var(--color-surface);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-base);
}

.control-btn:active {
  transform: scale(0.92);
}

.quantity-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.qty {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
}

.price-sum {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.add-to-cart-btn {
  width: 100%;
  max-width: 400px;
  height: 56px;
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.btn-text {
    font-size: 1.1rem;
    font-weight: 600;
}

.btn-price {
    font-weight: 700;
    background: rgba(255,255,255,0.2);
    padding: 4px 10px;
    border-radius: var(--radius-md);
    font-size: 0.95rem;
}
</style>
