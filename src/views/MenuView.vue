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
const isSearchOpen = ref(false) // New state for search toggle

const categoryEmojis = {
  'Сеты': '🍱',
  'Запечённые и жареные роллы': '🔥',
  'Холодные роллы': '🍣',
  'Суши и Гунканы': '🍱',
  'Комбо': '🍱',
  'Суп': '🍜',
  'Салаты': '🥗',
  'Пиццы': '🍕',
  'Горячие закуски': '🥘',
  'Напитки': '🥤',
  'Снеки': '🍟',
  'default': '🍽️'
}

function getCategoryEmoji(name) {
  return categoryEmojis[name] || categoryEmojis['default']
}

const filteredItems = computed(() => {
  let items = menuItems.value

  // Filter by category (only if not searching, or if we want to filter within category)
  // UX Decision: If searching, usually search all categories.
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter((item) => item.name.toLowerCase().includes(query))
  } else if (selectedCategory.value) {
    items = items.filter((item) => item.category_id === selectedCategory.value)
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
    // List of required categories in order
    const requiredOrder = [
      'Сеты',
      'Запечённые и жареные роллы',
      'Холодные роллы',
      'Суши и Гунканы',
      'Комбо',
      'Суп',
      'Салаты',
      'Пиццы',
      'Горячие закуски',
      'Напитки',
      'Снеки'
    ]
    
    // Create a map for quick lookup and fallback sort order
    const orderMap = {}
    requiredOrder.forEach((name, index) => {
      orderMap[name] = index + 1
    })

    // Filter and update existing categories, and add missing ones
    let combined = categoriesData.map(cat => {
      // Map old names if they exist (heuristics)
      if (cat.name === 'Запечённые роллы') cat.name = 'Запечённые и жареные роллы'
      if (cat.name === 'Супы') cat.name = 'Суп'
      if (cat.name === 'Пицца') cat.name = 'Пиццы'
      if (cat.name === 'Суши и роллы') cat.name = 'Холодные роллы'
      if (cat.name === 'Маки') cat.name = 'Суши и Гунканы'
      
      // Update sort order based on our mapping if name matches
      if (orderMap[cat.name]) {
        cat.sort_order = orderMap[cat.name]
      }
      return cat
    })

    // Add missing required categories
    requiredOrder.forEach((name, index) => {
      if (!combined.find(c => c.name === name)) {
        combined.push({
          id: `new-${index}`,
          name: name,
          sort_order: index + 1
        })
      }
    })
    
    categories.value = combined.sort((a, b) => (a.sort_order || 999) - (b.sort_order || 999))
    
    if (combined.length > 0 && !selectedCategory.value) {
      selectedCategory.value = combined[0].id
    }
  } else {
    // Use mock data for development
    const mockCategories = [
      { id: '1', name: 'Сеты', sort_order: 1, created_at: new Date().toISOString() },
      { id: '2', name: 'Запечённые и жареные роллы', sort_order: 2, created_at: new Date().toISOString() },
      { id: '3', name: 'Холодные роллы', sort_order: 3, created_at: new Date().toISOString() },
      { id: '4', name: 'Суши и Гунканы', sort_order: 4, created_at: new Date().toISOString() },
      { id: '5', name: 'Комбо', sort_order: 5, created_at: new Date().toISOString() },
      { id: '6', name: 'Суп', sort_order: 6, created_at: new Date().toISOString() },
      { id: '7', name: 'Салаты', sort_order: 7, created_at: new Date().toISOString() },
      { id: '8', name: 'Пиццы', sort_order: 8, created_at: new Date().toISOString() },
      { id: '9', name: 'Горячие закуски', sort_order: 9, created_at: new Date().toISOString() },
      { id: '10', name: 'Напитки', sort_order: 10, created_at: new Date().toISOString() },
      { id: '11', name: 'Снеки', sort_order: 11, created_at: new Date().toISOString() },
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
  // Clear search when changing category to avoid confusion
  searchQuery.value = ''
  isSearchOpen.value = false
}

function addToCart(item) {
  hapticFeedback('success')
  cartStore.addItem(item, 1)
}


function getCategoryName(id) {
  if (searchQuery.value) return `Поиск: "${searchQuery.value}"`
  const cat = categories.value.find(c => c.id === id)
  return cat ? cat.name : 'Все меню'
}

function toggleSearch() {
  isSearchOpen.value = !isSearchOpen.value
  if (!isSearchOpen.value) {
    searchQuery.value = ''
  } else {
    // Focus logic would go here typically with a ref
    setTimeout(() => {
        const input = document.getElementById('search-input')
        if (input) input.focus()
    }, 100)
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="menu-view">
    <!-- Header -->
    <div class="header glass">
      <div class="header-content container">
        <div class="logo">
          <span class="logo-icon">🍔</span>
          <span class="logo-text">Uno8</span>
        </div>
        <div class="actions">
          <button class="icon-btn search-btn" @click="toggleSearch" :class="{ 'active': isSearchOpen }">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
          <router-link to="/profile" class="icon-btn profile-btn">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </router-link>
        </div>
      </div>
      
      <!-- Search Overlay/Bar -->
      <div v-if="isSearchOpen" class="search-bar-container container">
        <input 
            id="search-input"
            v-model="searchQuery" 
            type="text" 
            placeholder="Поиск блюд..." 
            class="search-input"
        >
      </div>
    </div>

    <div class="content-wrapper">
      <!-- Promotions / Banners -->
      <section v-if="!searchQuery" class="banners-section">
         <div class="banner-scroll">
            <div class="banner-card gradient-1">
               <div class="banner-text">
                  <h3>Бесплатная доставка</h3>
                  <p>От 1200₽</p>
               </div>
            </div>
            <div class="banner-card gradient-2">
               <div class="banner-text">
                  <h3>Подарок к заказу</h3>
                  <p>При заказе на 1500 ролл запеченный в подарок</p>
               </div>
            </div>
            <div class="banner-card gradient-3">
               <div class="banner-text">
                  <h3>Приведи друзей</h3>
                  <p>Пригласи три друга и получи ролл запеченный в подарок</p>
               </div>
            </div>
         </div>
      </section>

      <!-- Categories Sticky -->
      <div v-if="!searchQuery" class="categories-wrapper">
        <div class="categories">
          <button
            v-for="category in categories"
            :key="category.id"
            class="category-pill"
            :class="{ active: selectedCategory === category.id }"
            @click="selectCategory(category.id)"
          >
            <span class="category-emoji">{{ getCategoryEmoji(category.name) }}</span>
            {{ category.name }}
          </button>
        </div>
      </div>
      
      <!-- Menu Grid -->
      <div class="container menu-section">
        <div class="section-header">
           <h2>{{ getCategoryName(selectedCategory) }}</h2>
        </div>

        <div v-if="loading" class="menu-grid">
          <div v-for="i in 6" :key="i" class="skeleton-card"></div>
        </div>

        <div v-else-if="filteredItems.length === 0" class="empty-state">
          <div class="empty-icon">🔍</div>
          <p>В этой категории пока ничего нет.</p>
        </div>

        <div v-else class="menu-grid">
          <MenuItemCard
            v-for="item in filteredItems"
            :key="item.id"
            :item="item"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.menu-view {
  min-height: 100vh;
  padding-top: 70px; /* Header height + spacing */
}

/* Header */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: rgba(15, 23, 42, 0.95); /* Slate 900 slightly more opaque */
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.header-content {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.search-bar-container {
  padding: 0 0 16px 0;
  animation: slideDown 0.2s ease;
}

.search-input {
  width: 100%;
  padding: 10px 16px;
  background: var(--color-secondary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  color: white;
  font-size: 1rem;
}

.search-input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-secondary);
  color: var(--color-text);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base);
}

.icon-btn.active {
  background: var(--color-accent);
  color: white;
}

.icon-btn:hover {
  background: var(--color-surface);
  color: white;
}

.content-wrapper {
  padding-bottom: calc(var(--cart-button-height) + 20px);
}

/* Banners */
.banners-section {
  padding: 0 var(--spacing-md);
  margin-bottom: 24px;
}

.banner-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
  scroll-snap-type: x mandatory;
}

.banner-scroll::-webkit-scrollbar {
  display: none;
}

.banner-card {
  min-width: 280px;
  height: 120px;
  border-radius: var(--radius-lg);
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  scroll-snap-align: start;
  position: relative;
  overflow: hidden;
}

.gradient-1 {
  background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('../assets/images/banner1.jpeg');
  background-size: cover;
  background-position: center;
}

.gradient-2 {
  background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('../assets/images/banner2.jpeg');
  background-size: cover;
  background-position: center;
}

.gradient-3 {
  background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('../assets/images/banner3.jpeg');
  background-size: cover;
  background-position: center;
}

.banner-text h3 {
  font-size: 1.1rem;
  margin-bottom: 4px;
  color: white;
}

.banner-text p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
}

.banner-img {
  font-size: 3rem;
  opacity: 0.8;
  transform: rotate(10deg);
}

/* Categories */
.categories-wrapper {
  position: sticky;
  top: 60px; /* Below header */
  z-index: 40;
  background: var(--color-primary);
  padding: 12px 0;
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.categories {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 0 var(--spacing-md);
  -webkit-overflow-scrolling: touch;
}

.categories::-webkit-scrollbar {
  display: none;
}

.category-pill {
  padding: 8px 16px;
  background: var(--color-secondary);
  color: var(--color-text-secondary);
  border-radius: 100px;
  white-space: nowrap;
  font-size: 0.9rem;
  font-weight: 600;
  border: 1px solid transparent;
  transition: all var(--transition-base);
  display: flex;
  align-items: center;
  gap: 6px;
}

.category-emoji {
  font-size: 1.1em;
}

.category-pill.active {
  background: var(--color-accent);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.menu-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-header h2 {
  font-size: 1.25rem;
  color: var(--color-text);
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* Force 2 columns on mobile */
  gap: 12px; 
}

@media (min-width: 640px) {
  .menu-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
  }
}

.skeleton-card {
  height: 240px;
  background: var(--color-secondary);
  border-radius: var(--radius-lg);
  animation: shimmer 1.5s infinite;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--color-text-secondary);
  background: var(--color-secondary);
  border-radius: var(--radius-lg);
  margin-top: 20px;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 12px;
  opacity: 0.5;
}
</style>
