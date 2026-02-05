import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// Global Error Handler for Mobile Debugging
app.config.errorHandler = (err, instance, info) => {
    console.error('Global Error:', err)
    const errDiv = document.createElement('div')
    errDiv.style.position = 'fixed'
    errDiv.style.top = '0'
    errDiv.style.left = '0'
    errDiv.style.width = '100%'
    errDiv.style.background = 'red'
    errDiv.style.color = 'white'
    errDiv.style.padding = '20px'
    errDiv.style.zIndex = '999999'
    errDiv.style.whiteSpace = 'pre-wrap'
    errDiv.innerText = `App Crash: ${err.message}\n${info}`
    document.body.appendChild(errDiv)
}

app.use(createPinia())
app.use(router)

app.mount('#app')
