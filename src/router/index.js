import { createRouter, createWebHistory } from 'vue-router'
import { getTelegramUser } from '../lib/telegram'
import { supabase } from '../lib/supabase'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'menu',
            component: () => import('../views/MenuView.vue'),
        },
        {
            path: '/orders',
            name: 'orders',
            component: () => import('../views/OrdersView.vue'),
        },
        // Admin Routes
        {
            path: '/admin',
            name: 'admin-login',
            component: () => import('../views/admin/AdminLoginView.vue')
        },
        {
            path: '/admin/dashboard',
            name: 'admin-dashboard',
            component: () => import('../views/admin/AdminDashboardView.vue'),
            meta: { requiresAdmin: true }
        },
        {
            path: '/admin/orders',
            name: 'admin-orders',
            component: () => import('../views/admin/AdminOrdersView.vue'),
            meta: { requiresAdmin: true }
        },
        {
            path: '/admin/menu',
            name: 'admin-menu',
            component: () => import('../views/admin/AdminMenuView.vue'),
            meta: { requiresAdmin: true }
        },
        {
            path: '/admin/users',
            name: 'admin-users',
            component: () => import('../views/admin/AdminUsersView.vue'),
            meta: { requiresAdmin: true }
        },
        {
            path: '/profile',
            name: 'profile',
            component: () => import('../views/ProfileView.vue'),
        },
        {
            path: '/about',
            name: 'about',
            component: () => import('../views/AboutView.vue'),
        },
        {
            path: '/product/:id',
            name: 'product-detail',
            component: () => import('../views/ProductDetailView.vue'),
        },
        {
            path: '/checkout',
            name: 'checkout',
            component: () => import('../views/CheckoutView.vue'),
        },
        // Admin routes - TODO: Uncomment after creating admin views
        // {
        //     path: '/admin',
        //     redirect: '/admin/orders',
        // },
        // {
        //     path: '/admin/orders',
        //     name: 'admin-orders',
        //     component: () => import('../views/admin/OrdersView.vue'),
        //     meta: { requiresAdmin: true },
        // },
        // {
        //     path: '/admin/menu',
        //     name: 'admin-menu',
        //     component: () => import('../views/admin/MenuView.vue'),
        //     meta: { requiresAdmin: true },
        // },
    ],
})

// Navigation Guards
router.beforeEach(async (to, from, next) => {
    // 1. Check for Admin Access (PIN based)
    if (to.meta.requiresAdmin) {
        // Simple PIN auth check first (Project Requirement)
        const isAuthenticated = sessionStorage.getItem('admin_auth') === 'true'

        if (isAuthenticated) {
            next()
            return
        }

        // Optional: Telegram-based admin check (Future proofing)
        // If PIN auth failed/missing, check if they are a registered admin via Telegram
        // This allows smooth access for super-admins without PIN if configured
        const user = getTelegramUser()
        if (user && user.username) {
            const { data: admin } = await supabase
                .from('admins')
                .select('*')
                .eq('telegram_username', user.username)
                .single()

            if (admin) {
                sessionStorage.setItem('admin_auth', 'true') // Auto-login
                next()
                return
            }
        }

        // If neither pass, redirect to login
        if (to.name !== 'admin-login') {
            next('/admin')
            return
        }
    }

    next()
})

export default router
