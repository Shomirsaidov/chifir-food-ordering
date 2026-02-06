<template>
  <div class="admin-menu">
    <div class="header">
      <button @click="$router.back()" class="back-btn">← Назад</button>
      <h1>Управление меню</h1>
      <button @click="openNewItem" class="add-btn">+</button>
    </div>

    <!-- Category Tabs -->
    <div class="category-tabs">
      <button 
        v-for="cat in categories" 
        :key="cat.id"
        :class="['tab', { active: selectedCategory === cat.id }]"
        @click="selectedCategory = cat.id"
      >
        {{ cat.name }}
      </button>
    </div>

    <!-- Menu Items List -->
    <div v-if="loading" class="loading">Загрузка...</div>
    
    <div v-else class="items-list">
      <div v-for="item in filteredItems" :key="item.id" class="item-row">
        <div class="item-info">
          <div class="item-name">{{ item.name }}</div>
          <div class="item-price">{{ (item.price / 100).toFixed(0) }} ₽</div>
          <div class="item-status" :class="{ inactive: !item.is_active }">
            {{ item.is_active ? 'Активен' : 'Скрыт' }}
          </div>
        </div>
        
        <div class="item-actions">
          <button @click="editItem(item)" class="edit-btn">✎</button>
          <button @click="deleteItem(item)" class="delete-btn">🗑</button>
        </div>
      </div>
    </div>

    <!-- Form Modal -->
    <AdminProductForm 
      v-if="showForm"
      :item="editingItem"
      :categories="categories"
      @close="showForm = false"
      @saved="onSaved"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../../lib/supabase'
import AdminProductForm from './AdminProductForm.vue'

const categories = ref([])
const menuItems = ref([])
const selectedCategory = ref('')
const loading = ref(true)

const showForm = ref(false)
const editingItem = ref(undefined)

const filteredItems = computed(() => {
  return menuItems.value.filter(item => item.category_id === selectedCategory.value)
})

onMounted(async () => {
  await loadData()
})

async function loadData() {
  loading.value = true
  
  // Load Categories
  const { data: cats } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order')
    
  if (cats) {
    categories.value = cats
    if (!selectedCategory.value && cats.length > 0) {
      selectedCategory.value = cats[0].id
    }
  }

  // Load Menu Items
  const { data: items } = await supabase
    .from('menu_items')
    .select('*')
    .order('sort_order')
    
  if (items) {
    menuItems.value = items
  }
  
  loading.value = false
}

function openNewItem() {
  editingItem.value = undefined
  showForm.value = true
}

function editItem(item) {
  editingItem.value = item
  showForm.value = true
}

async function deleteItem(item) {
  if (!confirm(`Удалить "${item.name}"?`)) return
  
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', item.id)
    
  if (!error) {
    await loadData()
  } else {
    alert('Ошибка удаления: ' + error.message)
  }
}

function onSaved() {
  showForm.value = false
  loadData()
}
</script>

<style scoped>
.admin-menu {
  min-height: 100vh;
  padding: 20px;
  background: var(--color-background);
  padding-bottom: 100px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

h1 {
  font-size: 20px;
  margin: 0;
}

.back-btn {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 16px;
  cursor: pointer;
}

.add-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.category-tabs {
  display: flex;
  overflow-x: auto;
  gap: 12px;
  padding-bottom: 16px;
  margin-bottom: 16px;
}

.tab {
  padding: 8px 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  color: var(--color-text);
  white-space: nowrap;
  font-size: 14px;
  cursor: pointer;
}

.tab.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-row {
  background: var(--color-surface);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-info {
  flex: 1;
}

.item-name {
  font-weight: 600;
  margin-bottom: 4px;
}

.item-price {
  font-size: 14px;
  color: var(--color-accent);
}

.item-status {
  font-size: 12px;
  color: var(--color-success);
  margin-top: 4px;
}

.item-status.inactive {
  color: var(--color-text-secondary);
}

.item-actions {
  display: flex;
  gap: 12px;
}

.edit-btn, .delete-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
}

.delete-btn {
  color: #ef4444;
}
</style>
