<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12">
          <v-card-title class="text-center">
            <v-icon size="48" color="primary" class="mb-4">mdi-google</v-icon>
            <div>Iniciar con Google</div>
          </v-card-title>
          
          <v-card-text>
            <p class="text-center text-medium-emphasis">
              Usa tu cuenta de Google para acceder a la aplicación
            </p>
          </v-card-text>

          <v-card-actions>
            <v-btn
              color="primary"
              size="large"
              block
              :loading="loading"
              @click="handleGoogleLogin"
              prepend-icon="mdi-google"
            >
              Iniciar sesión con Google
            </v-btn>
          </v-card-actions>

          <v-divider class="my-4"></v-divider>

          <v-card-actions>
            <v-btn
              variant="outlined"
              block
              @click="goToEmailLogin"
            >
              <v-icon left>mdi-email</v-icon>
              Iniciar con Email
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Notificaciones -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3000"
      location="bottom right"
      rounded="lg"
    >
      <v-icon class="mr-2">{{ snackbar.icon }}</v-icon>
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const loading = ref(false)
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
  icon: 'mdi-check'
})

const showNotification = (message, color = 'success', icon = 'mdi-check') => {
  snackbar.value = {
    show: true,
    message,
    color,
    icon
  }
}

const handleGoogleLogin = () => {
  loading.value = true
  
  // Redirigir al endpoint de Google OAuth
  const googleAuthUrl = `https://localhost:3000/api/auth/google/login`
  window.location.href = googleAuthUrl
}

const goToEmailLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>
