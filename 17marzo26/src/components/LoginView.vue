<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Iniciar Sesión</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form @submit.prevent="handleLogin" ref="form">
              <v-text-field
                v-model="email"
                label="Email"
                name="email"
                prepend-icon="mdi-email"
                type="email"
                :rules="emailRules"
                :error-messages="error"
                required
                :disabled="loading"
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn 
              color="primary" 
              @click="handleLogin"
              :loading="loading"
              :disabled="!email || loading"
            >
              Iniciar Sesión
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Snackbar para notificaciones -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color">
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn color="white" icon @click="snackbar.show = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/services/authService'

const router = useRouter()

// Estado del componente
const email = ref('')
const loading = ref(false)
const error = ref('')
const form = ref(null)

// Configuración de validación
const emailRules = [
  v => !!v || 'El email es requerido',
  v => /.+@.+\..+/.test(v) || 'El email debe ser válido'
]

// Estado del snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

// Mostrar notificación
const showNotification = (message, color = 'success') => {
  snackbar.value = {
    show: true,
    message,
    color
  }
}

// Manejar login
const handleLogin = async () => {
  // Validar formulario
  const { valid } = await form.value.validate()
  if (!valid) return

  loading.value = true
  error.value = ''

  try {
    const response = await authService.login(email.value)
    
    if (response.success) {
      showNotification('¡Inicio de sesión exitoso!', 'success')
      
      // Redirigir a la página principal después de un breve delay
      setTimeout(() => {
        router.push('/')
      }, 1000)
    } else {
      error.value = response.message || 'Error al iniciar sesión'
      showNotification(error.value, 'error')
    }
  } catch (err) {
    error.value = err.message || 'Error de conexión'
    showNotification(error.value, 'error')
  } finally {
    loading.value = false
  }
}

// Verificar si ya está autenticado al cargar el componente
onMounted(async () => {
  if (authService.isAuthenticated()) {
    try {
      await authService.verify()
      router.push('/')
    } catch (err) {
      // Si la verificación falla, permanecer en login
      console.log('Usuario no autenticado:', err.message)
    }
  }
})
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>
