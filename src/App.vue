<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { initTelegram } from './lib/telegram'
import { supabase } from './lib/supabase'
import CartButton from './components/CartButton.vue'
import { useUserStore } from './stores/user'

const userStore = useUserStore()

onMounted(() => {
  // Poll for Telegram WebApp environment
  const checkInterval = setInterval(async () => {
    if (window.Telegram?.WebApp) {
      clearInterval(checkInterval) // Found it!

      const tg = window.Telegram.WebApp
      tg.ready()
      tg.expand()
      
      const user = tg.initDataUnsafe?.user
      
      if (user) {
        userStore.setUser(user)
        
        // Sync with Supabase (Fire and forget)
        if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
          try {
            await supabase.from('users').upsert(
              {
                telegram_id: user.id,
                username: user.username || null,
                first_name: user.first_name,
                last_name: user.last_name || null,
                photo_url: user.photo_url || null,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'telegram_id' }
            )
          } catch (error) {
            console.error('Supabase sync failed:', error)
          }
        }
      } else {
          console.warn('Telegram WebApp detected but no user data found in initDataUnsafe')
      }
    } else if (import.meta.env.DEV) {
        // Only run this fallback in strictly DEV environment (localhost)
        clearInterval(checkInterval)
        const mockUser = {
            id: 123456789,
            first_name: 'Test',
            last_name: 'User',
            username: 'testuser',
            language_code: 'ru',
            photo_url: null
        }
        userStore.setUser(mockUser)
    }
  }, 100)

  // Safety stop after 10 seconds
  setTimeout(() => clearInterval(checkInterval), 10000)
})
</script>

<template>
  <div id="app">
    <RouterView />
    <CartButton v-if="!$route.path.startsWith('/admin') && $route.path !== '/checkout' && !$route.path.startsWith('/product/')" />
  </div>
</template>

<style>
@import './assets/main.css';
</style>
