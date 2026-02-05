import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CartItem, MenuItem } from '../types/database'

export const useCartStore = defineStore('cart', () => {
    const items = ref<CartItem[]>([])

    // Load cart from localStorage on init
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
        try {
            items.value = JSON.parse(savedCart)
        } catch (e) {
            console.error('Failed to load cart from localStorage:', e)
        }
    }

    // Computed
    const itemCount = computed(() => {
        return items.value.reduce((sum, item) => sum + item.quantity, 0)
    })

    const totalAmount = computed(() => {
        return items.value.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0)
    })

    const isEmpty = computed(() => items.value.length === 0)

    // Actions
    function addItem(menuItem: MenuItem, quantity: number = 1) {
        const existingItem = items.value.find((item) => item.menuItem.id === menuItem.id)

        if (existingItem) {
            existingItem.quantity += quantity
        } else {
            items.value.push({ menuItem, quantity })
        }

        saveToLocalStorage()
    }

    function removeItem(menuItemId: string) {
        items.value = items.value.filter((item) => item.menuItem.id !== menuItemId)
        saveToLocalStorage()
    }

    function updateQuantity(menuItemId: string, quantity: number) {
        const item = items.value.find((item) => item.menuItem.id === menuItemId)
        if (item) {
            if (quantity <= 0) {
                removeItem(menuItemId)
            } else {
                item.quantity = quantity
                saveToLocalStorage()
            }
        }
    }

    function clearCart() {
        items.value = []
        saveToLocalStorage()
    }

    function saveToLocalStorage() {
        localStorage.setItem('cart', JSON.stringify(items.value))
    }

    return {
        items,
        itemCount,
        totalAmount,
        isEmpty,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
    }
})
