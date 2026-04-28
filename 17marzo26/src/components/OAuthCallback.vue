<template>
  <div style="padding: 20px; text-align: center; min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center;">
    <div style="background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <h2>Procesando autenticación...</h2>
      <p>Por favor, espera un momento.</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authService } from '@/services/authService'

const router = useRouter()
const route = useRoute()


onMounted(async () => {
  try {
    console.log('=== OAUTH CALLBACK MOUNTED ===')
    console.log('URL actual:', window.location.href)
    console.log('Query params:', route.query)
    
    // Forzar un log visible inmediatamente
    document.title = 'OAuth Callback Loaded'
    console.warn('⚠️ OAuthCallback.vue CARGADO - Si ves esto, el componente funciona')
    
    // Verificar si hay parámetros en la URL (éxito o error)
    const { token, email, error } = route.query
    
    if (error) {
      console.error('Error de autenticación:', error)
      router.push(`/login?error=${encodeURIComponent(error)}`)
      return
    }
    
    if (token) {
      console.log('✅ Token encontrado:', token.substring(0, 20) + '...')
      console.log('✅ Email:', email)
      
      try {
        // Guardar token en localStorage
        localStorage.setItem('authToken', token)
        localStorage.setItem('userEmail', email)
        
        console.log('✅ Token guardado en localStorage')
        console.log('✅ Verificando token guardado:', localStorage.getItem('authToken')?.substring(0, 20) + '...')
        console.log('✅ Redirigiendo a dashboard...')
        
        // Pequeña pausa para asegurar que el token se guarde
        setTimeout(() => {
          // Usar router.push en lugar de window.location.href
          router.push('/')
        }, 100)
      } catch (err) {
        console.error('❌ Error procesando token:', err)
        router.push('/login?error=token_processing_failed')
      }
    } else {
      console.log('❌ No hay token en la URL, redirigiendo a login')
      router.push('/login')
    }
  } catch (err) {
    console.error('❌ Error en callback:', err)
    router.push('/login?error=callback_failed')
  }
})
</script>

