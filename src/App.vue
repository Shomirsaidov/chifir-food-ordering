<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { initTelegram } from './lib/telegram'
import { supabase } from './lib/supabase'
import CartButton from './components/CartButton.vue'
import { useUserStore } from './stores/user'

const userStore = useUserStore()

onMounted(async () => {
  // Retry mechanism to wait for Telegram script to load
  let attempts = 0
  const maxAttempts = 20 // 2 seconds total
  
  const initInterval = setInterval(async () => {
    attempts++
    
    // Check if Telegram is available in window
    if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
      clearInterval(initInterval)
      
      const webApp = window.Telegram.WebApp
      webApp.ready()
      webApp.expand()
      
      const telegramUser = webApp.initDataUnsafe?.user
      
      if (telegramUser) {
        userStore.setUser(telegramUser)
        
        // Sync with Supabase
        if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
          try {
            await supabase.from('users').upsert(
              {
                telegram_id: telegramUser.id,
                username: telegramUser.username || null,
                first_name: telegramUser.first_name,
                last_name: telegramUser.last_name || null,
                photo_url: telegramUser.photo_url || null,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'telegram_id' }
            )
          } catch (error) {
            console.warn('Supabase sync error:', error)
          }
        }
      }
    } else if (import.meta.env.DEV) {
      // Dev mode fallback
      clearInterval(initInterval)
      const mockUser = {
        id: 123456789,
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser',
        language_code: 'ru',
      }
      userStore.setUser(mockUser)
    }
    
    if (attempts >= maxAttempts) {
      clearInterval(initInterval)
      console.warn('Telegram WebApp SDK failed to load')
    }
  }, 100)
})
</script>

<template>
  <div id="app">
    <RouterView />
    <CartButton v-if="!$route.path.startsWith('/admin')" />
  </div>
</template>

<style>
@import './assets/main.css';
</style>
