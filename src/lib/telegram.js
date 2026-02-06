
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
    // Try to get from cached variable OR directly from window
    const app = webApp || (typeof window !== 'undefined' && window.Telegram?.WebApp)

    if (!app) {
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
        const user = app.initDataUnsafe?.user
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

/**
 * Send order notification to Telegram Bot
 */
export async function sendTelegramNotification(order, user, items, totalOrdersCount, deliveryFee = 0) {
    const BOT_TOKEN = '8431199932:AAGoQyxcX5M7I8lUQiX2jTb_EcWJN6scjRw'
    const chat_id = user.telegram_id

    // Format date
    const date = new Date(order.created_at)
    const formattedDate = date.toLocaleString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
    })

    // Format items
    const itemsList = items.map(item => {
        const total = (item.menuItem.price * item.quantity / 100).toFixed(0)
        const price = (item.menuItem.price / 100).toFixed(0)
        return `${item.menuItem.name} ${price}₽ х ${item.quantity} - ${total}₽`
    }).join('\n')

    // Calculated totals
    const itemsTotalAmount = cartStore.totalAmount // In memory store has correct items total
    const deliveryCost = (deliveryFee / 100).toFixed(0)
    const totalOrderAmount = (order.total_amount / 100).toFixed(0)

    const text = `
🔸 Мы получили ваш заказ 🔸
------------------------------
Номер заказа: ${order.id}
Дата и время заказа: ${formattedDate}
Ваш телефон: ${order.phone_number}
Способ оплаты: ${order.payment_method === 'cash' ? 'Наличные' : 'Перевод'}
Способ получения: ${order.delivery_type === 'delivery' ? 'Доставка' : 'Самовывоз'}
${order.delivery_type === 'delivery' ? `Адрес доставки: ${order.delivery_address}` : ''}
${order.payment_method === 'cash' && order.cash_change_from ? `Сдача с суммы: ${order.cash_change_from}` : ''}
Количество приборов: ${order.utensils_count}
------------------------------
Состав заказа:
${itemsList}
------------------------------
Стоимость товаров: ${(order.total_amount - deliveryFee) / 100}₽
Доставка: ${deliveryCost}₽
Итого: ${totalOrderAmount}₽
------------------------------
Спасибо за заказ. Вы сделали уже ${totalOrdersCount} заказов.
`.trim()

    try {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id,
                text,
                parse_mode: 'HTML'
            })
        })
    } catch (e) {
        console.error('Failed to send Telegram notification:', e)
    }
}

export { webApp }
