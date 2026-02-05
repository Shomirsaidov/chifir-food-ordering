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
    <div class="item-image-container">
      <ProductImage
        :image-loc="item.image_loc"
        :image-url="item.image_url"
        :alt="item.name"
        placeholder="🍱"
      />
    </div>

    <div class="item-content">
      <h3 class="item-name">{{ item.name }}</h3>
      <p v-if="item.description" class="item-description">
        {{ item.description }}
      </p>
      <div class="item-footer">
        <span class="item-price">{{ formatPrice(item.price) }}</span>
        <button class="add-btn" @click.stop="addToCart">+</button>
      </div>
    </div>
  </div>
</template>

<style scoped>

.menu-item-card {
  background: var(--color-surface);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease;
  cursor: pointer;
}

.menu-item-card:active {
  transform: scale(0.98);
}

.item-image-container {
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  background: var(--color-primary);
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  background: var(--color-primary);
}

.item-content {
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  flex: 1;
}

.item-name {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-description {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: var(--spacing-sm);
}

.item-price {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-accent);
}

.add-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: transform 0.2s;
  padding-bottom: 2px;
}

.add-btn:hover {
  background: #3a7bc8;
  transform: scale(1.1);
}

.add-btn:active {
  transform: scale(0.9);
}
</style>
