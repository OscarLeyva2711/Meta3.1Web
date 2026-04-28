<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Iniciar Sesión</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <!-- Formulario tradicional -->
            <v-form @submit.prevent="handleLogin" ref="form">
              <v-text-field
                v-model="email"
                label="Email"
                prepend-icon="mdi-email"
                type="email"
                :rules="emailRules"
                :error-messages="emailErrors"
                required
                :disabled="loading"
                autocomplete="email"
              ></v-text-field>

              <v-text-field
                v-model="password"
                label="Contraseña"
                name="password"
                prepend-icon="mdi-lock"
                type="password"
                :rules="passwordRules"
                :error-messages="passwordErrors"
                required
                :disabled="loading"
                class="mt-4"
                autocomplete="current-password"
              ></v-text-field>
            </v-form>

            <!-- Divisor -->
            <div class="d-flex align-center my-4">
              <v-divider></v-divider>
              <span class="mx-3 text-grey">O</span>
              <v-divider></v-divider>
            </div>

            <!-- Botón de Google OAuth -->
            <v-btn
              block
              color="red"
              @click="handleGoogleOAuthLogin"
              prepend-icon="mdi-google"
              :loading="googleLoading"
              class="mb-4"
            >
              Iniciar con Google
            </v-btn>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn 
              color="primary" 
              @click="handleLogin"
              :loading="loading"
              :disabled="!email || !password || loading"
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
import { useRouter, useRoute } from 'vue-router'
import { authService } from '@/services/authService'

const router = useRouter()
const route = useRoute()

// Estado del componente
const email = ref('')
const password = ref('')
const loading = ref(false)
const googleLoading = ref(false)
const emailErrors = ref([])
const passwordErrors = ref([])
const form = ref(null)

// Configuración de validación
const emailRules = [
  v => !!v || 'El email es requerido',
  v => /.+@.+\..+/.test(v) || 'El email debe ser válido'
]

const passwordRules = [
  v => !!v || 'La contraseña es requerida',
  v => (v && v.length >= 6) || 'La contraseña debe tener al menos 6 caracteres'
]

// Manejar login con Google OAuth
const handleGoogleOAuthLogin = () => {
  console.log(' INICIANDO GOOGLE OAUTH - Si ves esto, el login funciona')
  alert(' Google OAuth iniciado - Si ves esto, el login funciona')
  window.location.href = 'https://localhost:3000/api/auth/google/login'
}

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

// Manejar login tradicional
const handleLogin = async () => {
  // Validar formulario
  const { valid } = await form.value.validate()
  if (!valid) return

  loading.value = true
  emailErrors.value = []
  passwordErrors.value = []

  try {
    const response = await authService.login(email.value, password.value)
    
    if (response.success) {
      showNotification('¡Inicio de sesión exitoso!', 'success')
      
      // Guardar token en localStorage
      if (response.token) {
        localStorage.setItem('authToken', response.token)
      }
      
      console.log('Login exitoso, redirigiendo al dashboard...')
      console.log('Token guardado:', response.token ? 'Sí' : 'No')
      console.log('AuthService.isAuthenticated():', authService.isAuthenticated())
      
      // Redirigir inmediatamente a la página principal
      router.push('/')
    } else {
      const message = response.message || 'Error al iniciar sesión'
      showNotification(message, 'error')
    }
  } catch (err) {
    const errorMessage = err.message || 'Error de conexión'
    
    // Mostrar errores específicos
    if (errorMessage.includes('Email')) {
      emailErrors.value = [errorMessage]
    } else if (errorMessage.includes('contraseña')) {
      passwordErrors.value = [errorMessage]
    } else {
      showNotification(errorMessage, 'error')
    }
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
