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

// Guard de navegación para verificar autenticación
router.beforeEach(async (to, from) => {
  console.log('Router guard - Ruta:', to.path)
  console.log('Router guard - Requiere auth:', to.meta.requiresAuth)
  
  // Para oauth-callback, permitir acceso SIEMPRE y no verificar nada
  if (to.path === '/oauth-callback') {
    console.log('🔥 Router guard - Es oauth-callback, permitiendo acceso SIEMPRE')
    console.log('🔥 Router guard - Timestamp:', new Date().toISOString())
    return true
  }
  
  // Para rutas que no requieren autenticación, permitir acceso INMEDIATAMENTE
  if (!to.meta.requiresAuth) {
    console.log('Router guard - Ruta no requiere auth, permitiendo acceso')
    console.log('Router guard - Meta:', to.meta)
    return true
  }
  
  // Para rutas que requieren ser invitado (solo accesibles si NO estás autenticado)
  if (to.meta.requiresGuest) {
    console.log('Router guard - Ruta requiere ser invitado')
    const isLocalAuth = authService.isAuthenticated()
    if (isLocalAuth) {
      console.log('Router guard - Usuario ya autenticado, redirigiendo a dashboard')
      return '/'
    }
    console.log('Router guard - Usuario no autenticado, permitiendo acceso a ruta de invitado')
    return true
  }
  
  // Verificar autenticación (localStorage, cookies o verificar con backend)
  const isLocalAuth = authService.isAuthenticated()
  console.log('Router guard - Auth local:', isLocalAuth)
  
  if (isLocalAuth) {
    console.log('Router guard - Usuario autenticado localmente, permitiendo acceso')
    return true
  }
  
  // Si no hay auth local, verificar con el backend (para Google OAuth)
  try {
    const response = await authService.verify()
    if (response.success) {
      console.log('Router guard - Verificación backend exitosa, permitiendo acceso')
      return true
    }
  } catch (error) {
    console.log('Router guard - Verificación backend falló:', error instanceof Error ? error.message : 'Error desconocido')
  }
  
  console.log('Router guard - Usuario no autenticado, redirigiendo a login')
  return '/login'
})

export default router