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
      <div class="product-controls">
        <div class="quantity-selector">
          <button @click="decreaseLocalQuantity" class="q-btn minus">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
          <span class="q-value">{{ localQuantity }}</span>
          <button @click="increaseLocalQuantity" class="q-btn plus">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
        </div>
        
        <button @click="handleAddToCart" class="btn btn-primary main-add-btn">
          <span>В КОРЗИНУ {{ formatPrice(product.price * localQuantity) }}</span>
        </button>
      </div>
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

const localQuantity = ref(1)

function increaseLocalQuantity() {
  hapticFeedback('selection')
  localQuantity.value++
}

function decreaseLocalQuantity() {
  if (localQuantity.value > 1) {
    hapticFeedback('selection')
    localQuantity.value--
  }
}

function handleAddToCart() {
  if (!product.value) return
  hapticFeedback('success')
  cartStore.addItem(product.value, localQuantity.value)
  router.push('/')
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

/* Product Controls */
.product-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.quantity-selector {
  display: flex;
  align-items: center;
  background: var(--color-secondary);
  padding: 4px;
  border-radius: var(--radius-lg);
  gap: 8px;
}

.q-btn {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--color-accent);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all var(--transition-base);
}

.q-btn:active {
  transform: scale(0.92);
}

.q-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text);
  min-width: 24px;
  text-align: center;
}

.main-add-btn {
  flex: 1;
  height: 56px;
  border-radius: var(--radius-lg);
  font-size: 1rem;
  font-weight: 800;
  text-transform: uppercase;
}

/* Transitions */
</style>
