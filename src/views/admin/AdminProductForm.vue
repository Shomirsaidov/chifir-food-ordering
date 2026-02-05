<template>
  <div class="product-form-modal">
    <div class="modal-content">
      <div class="header">
        <h2>{{ isEdit ? 'Edit Item' : 'New Item' }}</h2>
        <button @click="$emit('close')" class="close-btn">×</button>
      </div>

      <form @submit.prevent="save">
        <div class="form-group">
          <label>Name</label>
          <input v-model="form.name" required />
        </div>

        <div class="form-group">
          <label>Category</label>
          <select v-model="form.category_id" required>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Price (₽)</label>
          <input v-model="displayPrice" type="number" required min="0" step="1" />
          <span class="hint">Stored as {{ form.price }} tiyin</span>
        </div>
        
        <div class="form-group">
          <label>Description</label>
          <textarea v-model="form.description" rows="3"></textarea>
        </div>

        <div class="form-group">
          <label>Image Location (Internal or URL)</label>
          <input v-model="form.image_loc" placeholder="sushi.jpg OR https://..." />
          <span class="hint">Use filename for assets/images/ or full URL</span>
        </div>

        <div class="form-group checkbox">
          <label>
            <input type="checkbox" v-model="form.is_active" />
            Active (Visible in menu)
          </label>
        </div>

        <div class="actions">
          <button type="button" @click="$emit('close')" class="cancel-btn">Cancel</button>
          <button type="submit" class="save-btn" :disabled="saving">
            {{ saving ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { supabase } from '../../lib/supabase'

const props = defineProps(['item', 'categories'])
const emit = defineEmits(['close', 'saved'])

const isEdit = !!props.item
const saving = ref(false)

const form = ref({
  name: props.item?.name || '',
  category_id: props.item?.category_id || props.categories[0]?.id || '',
  price: props.item?.price || 0,
  description: props.item?.description || '',
  image_loc: props.item?.image_loc || '',
  is_active: props.item?.is_active ?? true
})

// Computed property to handle Ruble <-> Tiyin conversion
const displayPrice = computed({
  get: () => Math.round(form.value.price / 100),
  set: (val) => {
    form.value.price = val * 100
  }
})

async function save() {
  saving.value = true
  
  const dataToSave = {
    ...form.value,
    updated_at: new Date().toISOString()
  }

  let error

  if (isEdit && props.item) {
    const { error: err } = await supabase
      .from('menu_items')
      .update(dataToSave)
      .eq('id', props.item.id)
    error = err
  } else {
    // Basic validation
    if (!dataToSave.name || dataToSave.price <= 0) {
        alert('Please fill in name and price')
        saving.value = false
        return
    }

    const { error: err } = await supabase
      .from('menu_items')
      .insert({
        ...dataToSave,
        sort_order: 0, // Default to top
        created_at: new Date().toISOString()
      })
    error = err
  }

  saving.value = false

  if (!error) {
    emit('saved')
  } else {
    alert('Error saving: ' + error.message)
  }
}
</script>

<style scoped>
.product-form-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: #1a1a1a; /* Solid dark background */
  width: 100%;
  max-width: 500px;
  border-radius: 16px;
  padding: 24px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
  border: 1px solid rgba(255,255,255,0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

h2 {
  margin: 0;
  font-size: 20px;
  color: white;
}

.close-btn {
  background: none;
  border: none;
  color: #999;
  font-size: 28px;
  cursor: pointer;
  line-height: 1;
}

.form-group {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #ccc;
}

input, select, textarea {
  width: 100%;
  padding: 12px;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 8px;
  color: white;
  font-size: 16px;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.hint {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
  display: block;
}

.checkbox label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  cursor: pointer;
}

.checkbox input {
  width: auto;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.cancel-btn {
  padding: 12px 24px;
  background: transparent;
  border: 1px solid #444;
  border-radius: 8px;
  color: white;
  cursor: pointer;
}

.save-btn {
  padding: 12px 32px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.save-btn:disabled {
  opacity: 0.7;
}
</style>
