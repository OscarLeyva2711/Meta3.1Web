<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Registrarse</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form @submit.prevent="handleRegister" ref="form">
              <v-text-field
                v-model="nombre"
                label="Nombre Completo"
                prepend-icon="mdi-account"
                type="text"
                :rules="nombreRules"
                :error-messages="nombreErrors"
                required
                :disabled="loading"
                data-test="register-nombre"
              />

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
                class="mt-4"
                data-test="register-email"
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
                autocomplete="new-password"
                data-test="register-password"
              />

              <v-text-field
                v-model="confirmPassword"
                label="Confirmar Contraseña"
                name="confirmPassword"
                prepend-icon="mdi-lock-check"
                type="password"
                :rules="confirmPasswordRules"
                :error-messages="confirmPasswordErrors"
                required
                :disabled="loading"
                class="mt-4"
                autocomplete="new-password"
                data-test="register-confirm-password"
              />

              <div class="d-flex gap-3 mt-6">
                <v-btn
                  type="submit"
                  block
                  color="primary"
                  :loading="loading"
                  data-test="register-button"
                >
                  Registrarse
                </v-btn>
              </div>
            </v-form>

            <div class="text-center mt-4">
              <p class="text-grey">
                ¿Ya tienes cuenta?
                <router-link to="/login" class="text-primary font-weight-bold">
                  Inicia sesión aquí
                </router-link>
              </p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="5000"
      top
    >
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiClient } from '@/services/authService'

const router = useRouter()
const form = ref(null)
const loading = ref(false)

const nombre = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const nombreErrors = ref([])
const emailErrors = ref([])
const passwordErrors = ref([])
const confirmPasswordErrors = ref([])

const snackbar = ref({ show: false, message: '', color: 'success' })

const nombreRules = [
  v => !!v || 'El nombre es requerido',
  v => (v && v.length >= 3) || 'El nombre debe tener al menos 3 caracteres'
]

const emailRules = [
  v => !!v || 'El email es requerido',
  v => /.+@.+\..+/.test(v) || 'El email debe ser válido'
]

const passwordRules = [
  v => !!v || 'La contraseña es requerida',
  v => (v && v.length >= 6) || 'La contraseña debe tener al menos 6 caracteres'
]

const confirmPasswordRules = [
  v => !!v || 'Debe confirmar la contraseña',
  v => (v && v === password.value) || 'Las contraseñas no coinciden'
]

const showNotification = (message, color = 'success') => {
  snackbar.value = { show: true, message, color }
}

const handleRegister = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  loading.value = true
  nombreErrors.value = []
  emailErrors.value = []
  passwordErrors.value = []
  confirmPasswordErrors.value = []

  try {
    const response = await apiClient.post('/auth/register', {
      nombre: nombre.value,
      email: email.value,
      password: password.value,
      rol: 'usuario'
    })

    if (response.data.success) {
      showNotification('¡Registro exitoso! Redirigiendo al login...', 'success')
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } else {
      showNotification(response.data.message || 'Error al registrarse', 'error')
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message || 'Error de conexión'
    if (errorMessage.toLowerCase().includes('email')) {
      emailErrors.value = [errorMessage]
    } else {
      showNotification(errorMessage, 'error')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.gap-3 {
  gap: 12px;
}

a {
  text-decoration: none;
  transition: color 0.3s;
}

a:hover {
  color: #5a67d8;
}
</style>
