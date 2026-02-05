<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { initTelegram } from './lib/telegram'
import { supabase } from './lib/supabase'
import CartButton from './components/CartButton.vue'
import { useUserStore } from './stores/user'

const userStore = useUserStore()

onMounted(async () => {
  // Initialize Telegram WebApp
  const webApp = initTelegram()

  // FORCE extraction from window.Telegram.WebApp.initDataUnsafe.user as requested
  let telegramUser = null
  
  // Try direct access first (Production/Telegram)
  if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user) {
    telegramUser = window.Telegram.WebApp.initDataUnsafe.user
  } 
  // Fallback to previous method or mock for dev
  else if (import.meta.env.DEV) {
     telegramUser = {
        id: 123456789,
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser',
        language_code: 'ru',
    }
  }

  if (telegramUser) {
    // Save to store immediately so other views get it
    userStore.setUser(telegramUser)

    try {
      // Only try to create user if Supabase is configured
      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
        await supabase.from('users').upsert(
          {
            telegram_id: telegramUser.id,
            username: telegramUser.username || null,
            first_name: telegramUser.first_name,
            last_name: telegramUser.last_name || null,
            photo_url: telegramUser.photo_url || null,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'telegram_id',
          }
        )
      }
    } catch (error) {
      console.warn('Could not create/update user in database:', error)
    }
  }
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
