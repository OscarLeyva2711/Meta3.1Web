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
    }
  ],
})

// Guard de navegación para verificar autenticación
router.beforeEach(async (to, from, next) => {
  const isAuthenticated = authService.isAuthenticated()
  
  // Si la ruta requiere autenticación y el usuario no está autenticado
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
    return
  }
  
  // Si la ruta requiere ser invitado (login) y el usuario está autenticado
  if (to.meta.requiresGuest && isAuthenticated) {
    try {
      await authService.verify()
      next('/')
      return
    } catch (error) {
      // Si la verificación falla, permitir continuar al login
      next()
      return
    }
  }
  
  // Para todas las demás rutas, permitir continuar
  next()
})

export default router