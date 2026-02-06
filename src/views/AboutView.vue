<script setup>
import { useRouter } from 'vue-router'
import logoUrl from '../assets/images/logo.jpeg'

const router = useRouter()
</script>

<template>
  <div class="about-view">
    <div class="header">
      <button class="back-btn" @click="router.back()">
         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <h1>О нас</h1>
      <div class="placeholder"></div>
    </div>

    <div class="content">
      <div class="logo-container">
        <img :src="logoUrl" alt="Uno8 Logo" class="logo" />
      </div>

      <div class="card glass">
        <div class="info-section">
          <h2>Uno8</h2>
          <p class="tagline">Вкусная еда с доставкой в Казани</p>
        </div>

        <div class="divider"></div>

        <div class="contact-section">
          <div class="contact-item">
            <div class="icon-circle">📞</div>
            <div class="contact-details">
              <h3>Наш телефон</h3>
              <a href="tel:+79600497264" class="phone-link">+8 (996) 903-22-00</a>
              <p class="contact-note">По любым вопросам звоните нам</p>
            </div>
          </div>

          <div class="contact-item">
            <div class="icon-circle">📍</div>
            <div class="contact-details">
              <h3>Адрес</h3>
              <p class="address-text">Галий Кайбицкой 6а, Казань</p>
            </div>
          </div>
          
          <div class="contact-item">
            <div class="icon-circle">⏰</div>
            <div class="contact-details">
              <h3>Режим работы</h3>
              <p class="address-text">Ежедневно: 11:00 - 23:30</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="social-footer">
         <p>© 2026 Uno8. Все права защищены.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-view {
  min-height: 100vh;
  background: var(--color-primary);
  color: var(--color-text);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--color-primary);
}

.header h1 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.back-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text);
  background: var(--color-secondary);
  border-radius: 50%;
}

.placeholder { width: 40px; }

.content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-container {
  width: 140px;
  height: 140px;
  border-radius: 30px;
  overflow: hidden;
  margin-bottom: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.1);
  transform: rotate(-2deg);
}

.logo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card {
  width: 100%;
  padding: 30px;
  border-radius: var(--radius-xl);
  background: var(--color-secondary);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.glass {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(10px);
}

.info-section {
  text-align: center;
  margin-bottom: 24px;
}

.info-section h2 {
  font-size: 2rem;
  margin-bottom: 8px;
  background: linear-gradient(to right, #60a5fa, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.tagline {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.05);
  margin: 24px 0;
}

.contact-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.contact-item {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.icon-circle {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.contact-details h3 {
  font-size: 1rem;
  margin-bottom: 4px;
  color: var(--color-text);
}

.phone-link {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-accent);
  text-decoration: none;
  display: block;
  margin-bottom: 4px;
}

.contact-note {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  opacity: 0.7;
}

.address-text {
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.social-footer {
   margin-top: 40px;
   text-align: center;
   opacity: 0.3;
   font-size: 0.8rem;
}
</style>
