<template>
  <div style="text-align: center; padding: 20px; min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center;">
    <div style="background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <h2>Autenticando...</h2>
      <p>Por favor, espera un momento.</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authService } from '@/services/authService'

const route = useRoute()
const router = useRouter()

onMounted(async () => {
  const token = Array.isArray(route.query.token) ? route.query.token[0] : route.query.token
  const email = Array.isArray(route.query.email) ? route.query.email[0] : route.query.email

  if (!token) {
    router.replace('/login?error=no_token')
    return
  }

  try {
    authService.setAuthData(token, email)

    router.replace('/tareas')
  } catch (error) {
    console.error('Error al completar OAuth:', error)
    authService.clearAuthData()
    router.replace('/login?error=invalid_oauth_token')
  }
})
</script>
