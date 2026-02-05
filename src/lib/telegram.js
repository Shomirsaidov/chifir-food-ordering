
let webApp = null

/**
 * Initialize Telegram WebApp SDK
 */
export function initTelegram() {
    if (typeof window === 'undefined') return null

    try {
        // Check if we're in Telegram environment
        if (!window.Telegram?.WebApp) {
            console.warn('Not running in Telegram WebApp environment')
            return null
        }

        webApp = window.Telegram.WebApp
        webApp.ready()
        webApp.expand()

        // Set header color to match dark blue theme
        webApp.setHeaderColor('#1a2332')
        webApp.setBackgroundColor('#1a2332')

        return webApp
    } catch (error) {
        console.error('Failed to initialize Telegram WebApp:', error)
        return null
    }
}

/**
 * Get Telegram user data from initDataUnsafe
 * Note: This should only be used for display purposes
 * Always validate initData on the server side
 */
export function getTelegramUser() {
    if (!webApp) {
        // Return mock user for development outside Telegram
        if (import.meta.env.DEV) {
            return {
                id: 123456789,
                first_name: 'Test',
                last_name: 'User',
                username: 'testuser',
                language_code: 'ru',
            }
        }
        return null
    }

    try {
        const user = webApp.initDataUnsafe?.user
        if (!user) return null

        return {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            language_code: user.language_code,
            photo_url: user.photo_url,
        }
    } catch (error) {
        console.error('Failed to get Telegram user:', error)
        return null
    }
}

/**
 * Get raw initData string for server-side validation
 */
export function getInitData() {
    if (!webApp) return ''
    return webApp.initData || ''
}

/**
 * Show Telegram main button
 */
export function showMainButton(text, onClick) {
    if (!webApp) return

    webApp.MainButton.setText(text)
    webApp.MainButton.show()
    webApp.MainButton.onClick(onClick)
}

/**
 * Hide Telegram main button
 */
export function hideMainButton() {
    if (!webApp) return
    webApp.MainButton.hide()
}

/**
 * Show Telegram back button
 */
export function showBackButton(onClick) {
    if (!webApp) return
    webApp.BackButton.show()
    webApp.BackButton.onClick(onClick)
}

/**
 * Hide Telegram back button
 */
export function hideBackButton() {
    if (!webApp) return
    webApp.BackButton.hide()
}

/**
 * Haptic feedback
 */
export function hapticFeedback(type = 'light') {
    if (!webApp) return

    switch (type) {
        case 'success':
        case 'warning':
        case 'error':
            webApp.HapticFeedback.notificationOccurred(type)
            break
        default:
            webApp.HapticFeedback.impactOccurred(type)
    }
}

export { webApp }
