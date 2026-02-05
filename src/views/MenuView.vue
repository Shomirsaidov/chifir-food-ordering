<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import { useCartStore } from '../stores/cart'
import { hapticFeedback } from '../lib/telegram'
import MenuItemCard from '../components/MenuItemCard.vue'

const cartStore = useCartStore()

const categories = ref([])
const menuItems = ref([])
const selectedCategory = ref(null)
const loading = ref(true)
const searchQuery = ref('')

const filteredItems = computed(() => {
  let items = menuItems.value

  // Filter by category
  if (selectedCategory.value) {
    items = items.filter((item) => item.category_id === selectedCategory.value)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter((item) => item.name.toLowerCase().includes(query))
  }

  return items
})

async function loadData() {
  loading.value = true

  // Load categories
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order')

  if (categoriesData && categoriesData.length > 0) {
    categories.value = categoriesData
    if (categoriesData.length > 0) {
      selectedCategory.value = categoriesData[0].id
    }
  } else {
    // Use mock data for development
    const mockCategories = [
      { id: '1', name: 'Суши и роллы', sort_order: 1, created_at: new Date().toISOString() },
      { id: '2', name: 'Маки', sort_order: 2, created_at: new Date().toISOString() },
      { id: '3', name: 'Запечённые роллы', sort_order: 3, created_at: new Date().toISOString() },
      { id: '4', name: 'Супы', sort_order: 4, created_at: new Date().toISOString() },
      { id: '5', name: 'Салаты', sort_order: 5, created_at: new Date().toISOString() },
      { id: '6', name: 'Пицца', sort_order: 6, created_at: new Date().toISOString() },
    ]
    categories.value = mockCategories
    selectedCategory.value = mockCategories[0].id
  }

  // Load menu items
  const { data: itemsData } = await supabase
    .from('menu_items')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  if (itemsData && itemsData.length > 0) {
    menuItems.value = itemsData
  } else {
    // Use mock data for development
    const mockItems = [
      { id: '1', category_id: '1', name: 'Фила лайт', description: 'Лосось, сливочный сыр, огурец', price: 61500, image_url: null, image_loc: null, is_active: true, sort_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: '2', category_id: '1', name: 'Фила классика', description: 'Лосось, сливочный сыр, авокадо', price: 74900, image_url: null, image_loc: null, is_active: true, sort_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: '3', category_id: '1', name: 'Калифорния с крабом', description: 'Краб, авокадо, огурец, икра тобико', price: 49300, image_url: null, image_loc: null, is_active: true, sort_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: '4', category_id: '2', name: 'Каппа маки', description: 'Огурец', price: 26500, image_url: null, image_loc: null, is_active: true, sort_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: '5', category_id: '2', name: 'Сяке Маки', description: 'Лосось', price: 31300, image_url: null, image_loc: null, is_active: true, sort_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: '6', category_id: '3', name: 'Запечённый с курицей', description: 'Курица, сливочный сыр, соус', price: 42900, image_url: null, image_loc: null, is_active: true, sort_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: '7', category_id: '4', name: 'Том Ям', description: 'Острый тайский суп с морепродуктами', price: 75600, image_url: null, image_loc: null, is_active: true, sort_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: '8', category_id: '5', name: 'Салат Цезарь', description: 'Курица, салат, пармезан, соус цезарь', price: 45600, image_url: null, image_loc: null, is_active: true, sort_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: '9', category_id: '6', name: 'Пицца Мясная', description: 'Колбаса, курица, сосиски, салями', price: 75600, image_url: null, image_loc: null, is_active: true, sort_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    ]
    menuItems.value = mockItems
  }

  loading.value = false
}

function selectCategory(categoryId) {
  hapticFeedback('light')
  selectedCategory.value = categoryId
}

function addToCart(item) {
  hapticFeedback('success')
  cartStore.addItem(item, 1)
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="menu-view">
    <div class="header">
      <div class="header-top">
        <h1>Меню</h1>
        <router-link to="/profile" class="profile-link">
          <div class="profile-icon">👤</div>
        </router-link>
      </div>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Поиск..."
        class="search-input"
      />
    </div>

    <!-- Categories -->
    <div class="categories">
      <button
        v-for="category in categories"
        :key="category.id"
        class="category-btn"
        :class="{ active: selectedCategory === category.id }"
        @click="selectCategory(category.id)"
      >
        {{ category.name }}
      </button>
    </div>

    <!-- Menu Items -->
    <div v-if="loading" class="menu-grid">
      <div v-for="i in 6" :key="i" class="skeleton-card"></div>
    </div>

    <div v-else-if="filteredItems.length === 0" class="empty-state">
      <p>Товары не найдены</p>
    </div>

    <div v-else class="menu-grid">
      <MenuItemCard
        v-for="item in filteredItems"
        :key="item.id"
        :item="item"
        @add-to-cart="addToCart"
      />
    </div>
  </div>
</template>

<style scoped>
.menu-view {
  padding: var(--spacing-lg) var(--spacing-md);
  padding-bottom: calc(var(--cart-button-height) + var(--spacing-lg));
}

.header {
  margin-bottom: var(--spacing-lg);
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.header-top h1 {
  margin: 0;
}

.profile-link {
  text-decoration: none;
}

.profile-icon {
  width: 40px;
  height: 40px;
  background: var(--color-surface);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  border: 1px solid var(--color-border);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.search-input {
  margin-bottom: var(--spacing-md);
}

.categories {
  display: flex;
  gap: var(--spacing-sm);
  overflow-x: auto;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-sm);
  -webkit-overflow-scrolling: touch;
}

.categories::-webkit-scrollbar {
  height: 4px;
}

.category-btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--color-secondary);
  color: var(--color-text);
  border-radius: var(--radius-lg);
  white-space: nowrap;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all var(--transition-base);
}

.category-btn.active {
  background: var(--color-accent);
  color: white;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: var(--spacing-md);
}

.skeleton-card {
  height: 240px;
  background: var(--color-secondary);
  border-radius: var(--radius-lg);
  animation: loading 1.5s ease-in-out infinite;
}

.empty-state {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-secondary);
}
</style>
