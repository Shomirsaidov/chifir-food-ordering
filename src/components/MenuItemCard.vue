<script setup>
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import ProductImage from './ProductImage.vue'

const router = useRouter()
const cartStore = useCartStore()

const props = defineProps(['item'])

function goToProduct() {
  router.push(`/product/${props.item.id}`)
}

function addToCart() {
  cartStore.addItem(props.item)
  // user feedback could be added here (haptic or toast)
}

function formatPrice(price) {
  return `${(price / 100).toFixed(0)} ₽`
}
</script>

<template>
  <div class="menu-item-card" @click="goToProduct">
    <div class="image-container">
      <ProductImage
        :image-loc="item.image_loc"
        :image-url="item.image_url"
        :alt="item.name"
        class="product-image"
      />
    </div>

    <div class="content">
      <div class="header">
        <h3 class="title">{{ item.name }}</h3>
        <p class="description">{{ item.description }}</p>
      </div>

      <div class="footer">
        <div class="price-tag">
          <span class="price">{{ formatPrice(item.price) }}</span>
          <span v-if="Math.random() > 0.8" class="old-price">{{ formatPrice(item.price * 1.1) }}</span>
        </div>
        <button class="add-btn" @click.stop="addToCart">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.menu-item-card {
  background: var(--color-secondary);
  border-radius: var(--radius-xl);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
  border: 1px solid rgba(255, 255, 255, 0.05);
  height: 100%;
}

.menu-item-card:active {
  transform: scale(0.98);
}

.image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 4/3;
  overflow: hidden;
  background: var(--color-primary);
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.menu-item-card:hover .product-image {
  transform: scale(1.05);
}

.badges {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  gap: 6px;
  z-index: 2;
}

.badge {
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  font-size: 0.7rem;
  font-weight: 700;
  color: white;
  letter-spacing: 0.02em;
  backdrop-filter: blur(4px);
}

.badge-new {
  background: rgba(16, 185, 129, 0.9); /* Emerald */
}

.badge-sale {
  background: rgba(245, 158, 11, 0.9); /* Amber */
}

.content {
  padding: 14px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
}

.title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 4px;
  line-height: 1.3;
}

.description {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  opacity: 0.8;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.price-tag {
  display: flex;
  flex-direction: column;
}

.price {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text);
}

.old-price {
  font-size: 0.75rem;
  text-decoration: line-through;
  color: var(--color-text-secondary);
  opacity: 0.6;
}

.add-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base);
}

.add-btn:hover {
  background: var(--color-accent);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.add-btn:active {
  transform: translateY(0);
}
</style>
