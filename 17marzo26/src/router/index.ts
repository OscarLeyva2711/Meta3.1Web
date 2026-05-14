import { createRouter, createWebHistory } from 'vue-router'
import { authService } from '@/services/authService'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/views/TareasView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/tareas',
      component: () => import('@/views/TareasView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      component: () => import('@/components/LoginView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      component: () => import('@/components/RegisterView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/google-login',
      component: () => import('@/components/GoogleLogin.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/oauth-callback',
      component: () => import('@/components/OAuthCallback.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/oauth-login',
      redirect: '/oauth-callback'
    }
  ],
})

router.beforeEach((to) => {
  // 1. El callback OAuth siempre debe poder ejecutarse
  if (to.path === '/oauth-callback') return true

  // 2. Rutas para invitados
  if (to.meta.requiresGuest) {
    if (authService.isAuthenticated()) return '/'
    return true
  }

  // 3. Rutas públicas
  if (!to.meta.requiresAuth) return true

  // 4. Rutas protegidas - verificar token
  if (!authService.isAuthenticated()) {
    return '/login'
  }

  return true
})

export default router
