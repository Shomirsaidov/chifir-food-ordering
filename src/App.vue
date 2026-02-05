<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { initTelegram, getTelegramUser } from './lib/telegram'
import { supabase } from './lib/supabase'
import CartButton from './components/CartButton.vue'

onMounted(async () => {
  // Initialize Telegram WebApp
  initTelegram()

  // Get Telegram user and create/update in database
  const telegramUser = getTelegramUser()
  if (telegramUser) {
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
