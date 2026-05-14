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
                prepend-icon="mdi-email"
                type="email"
                :rules="emailRules"
                :error-messages="emailErrors"
                required
                :disabled="loading"
                autocomplete="email"
                data-test="login-email"
              />

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
                data-test="login-password"
              />
            </v-form>

            <div class="d-flex align-center my-4">
              <v-divider />
              <span class="mx-3 text-grey">O</span>
              <v-divider />
            </div>

            <v-btn
              block
              color="red"
              @click="handleGoogleOAuthLogin"
              prepend-icon="mdi-google"
              :loading="googleLoading"
              class="mb-4"
              data-test="login-google"
            >
              Iniciar con Google
            </v-btn>

            <div class="text-center mt-4">
              <p class="text-grey">
                ¿No tienes cuenta?
                <router-link to="/register" class="text-primary font-weight-bold">
                  Regístrate aquí
                </router-link>
              </p>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="primary"
              @click="handleLogin"
              :loading="loading"
              :disabled="!email || !password || loading"
              data-test="login-submit"
            >
              Iniciar Sesión
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" data-test="login-snackbar">
      {{ snackbar.message }}
      <template #actions>
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

const email = ref('')
const password = ref('')
const loading = ref(false)
const googleLoading = ref(false)
const emailErrors = ref([])
const passwordErrors = ref([])
const form = ref(null)

const emailRules = [
  v => !!v || 'El email es requerido',
  v => /.+@.+\..+/.test(v) || 'El email debe ser válido'
]
const passwordRules = [
  v => !!v || 'La contraseña es requerida',
  v => (v && v.length >= 6) || 'La contraseña debe tener al menos 6 caracteres'
]

const snackbar = ref({ show: false, message: '', color: 'success' })
const showNotification = (message, color = 'success') => {
  snackbar.value = { show: true, message, color }
}

const handleGoogleOAuthLogin = () => {
  googleLoading.value = true
  window.location.href = 'https://localhost:3000/api/auth/google/login'
}

const handleLogin = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  loading.value = true
  emailErrors.value = []
  passwordErrors.value = []

  try {
    const response = await authService.login(email.value, password.value)
    if (response.success) {
      showNotification('¡Inicio de sesión exitoso!', 'success')
      router.push('/')
    } else {
      showNotification(response.message || 'Error al iniciar sesión', 'error')
    }
  } catch (err) {
    const errorMessage = err.message || 'Error de conexión'
    if (errorMessage.toLowerCase().includes('email')) {
      emailErrors.value = [errorMessage]
    } else if (errorMessage.toLowerCase().includes('contraseña') || errorMessage.toLowerCase().includes('password')) {
      passwordErrors.value = [errorMessage]
    }
    showNotification(errorMessage, 'error')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  // Mostrar errores devueltos en query (?error=...)
  if (route.query.error) {
    showNotification(`Error de autenticación: ${route.query.error}`, 'error')
  }

  if (authService.isAuthenticated()) {
    try {
      const r = await authService.verify()
      if (r.success) router.push('/')
    } catch (err) {
      // Permanecer en login si verify falla
      console.log('Verify falló al montar login:', err.message)
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
