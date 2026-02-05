<template>
  <div class="product-image-wrapper">
    <img
      v-if="imageUrl"
      :src="imageUrl"
      :alt="alt"
      class="product-image"
      @error="handleImageError"
    />
    <div v-else class="product-image-placeholder">
      {{ placeholder }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { getImageUrl } from '../utils/imageHelper'

const props = defineProps<{
  imageLoc?: string | null
  imageUrl?: string | null  // Legacy support for image_url
  alt?: string
  placeholder?: string
}>()

const imageError = ref(false)

// Prioritize image_loc over image_url
const imageUrl = computed(() => {
  if (imageError.value) return null
  
  // First try image_loc (new dual system)
  if (props.imageLoc) {
    return getImageUrl(props.imageLoc)
  }
  
  // Fallback to image_url (legacy Supabase storage)
  if (props.imageUrl) {
    return props.imageUrl
  }
  
  return null
})

function handleImageError() {
  console.warn('Failed to load image:', props.imageLoc || props.imageUrl)
  imageError.value = true
}

// Reset error state when image changes
watch(() => [props.imageLoc, props.imageUrl], () => {
  imageError.value = false
})
</script>

<style scoped>
.product-image-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.product-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-background-soft) 100%);
}
</style>
