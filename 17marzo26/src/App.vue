<template>
  <v-app>
    <v-app-bar color="primary" flat>
      <v-app-bar-title>Gestión de Tareas</v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn 
        variant="text" 
        @click="handleLogout"
        :loading="logoutLoading"
        v-if="isAuthenticated"
      >
        <v-icon left>mdi-logout</v-icon>
        Cerrar Sesión
      </v-btn>
    </v-app-bar>

    <v-main v-if="isAuthenticated">
      <v-container max-width="700">

        <!-- Barra de búsqueda y botón nuevo -->
        <v-row class="mt-4" align="center">
          <v-col cols="8">
            <v-text-field
              v-model="busqueda"
              label="Buscar por título..."
              prepend-inner-icon="mdi-magnify"
              clearable
              hide-details
              @input="buscar"
              @click:clear="cargarTareas"
            />
          </v-col>
          <v-col cols="4">
            <v-btn color="primary" block @click="abrirDialogCrear">
              <v-icon left>mdi-plus</v-icon> Nueva tarea
            </v-btn>
          </v-col>
        </v-row>

        <!-- Filtros -->
        <v-row class="mt-2">
          <v-col>
            <v-btn-toggle v-model="filtro" mandatory color="primary">
              <v-btn value="todas">Todas</v-btn>
              <v-btn value="pendientes">Pendientes</v-btn>
              <v-btn value="completadas">Completadas</v-btn>
            </v-btn-toggle>
          </v-col>
        </v-row>

        <!-- Lista de tareas -->
        <v-list class="mt-4" rounded="lg">
          <v-list-item
            v-for="tarea in tareasFiltradas"
            :key="tarea.id"
            :class="tarea.completada ? 'text-decoration-line-through text-grey' : ''"
          >
            <template #prepend>
              <v-checkbox-btn
                :model-value="tarea.completada"
                @update:model-value="toggleCompletar(tarea)"
              />
            </template>

            <v-list-item-title>{{ tarea.titulo }}</v-list-item-title>

            <template #append>
              <v-chip
                :color="tarea.completada ? 'success' : 'warning'"
                size="small"
                class="mr-2"
              >
                {{ tarea.completada ? 'Completada' : 'Pendiente' }}
              </v-chip>
              <v-btn icon size="small" @click="abrirDialogEditar(tarea)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn icon size="small" color="error" @click="abrirDialogEliminar(tarea)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-list-item>

          <v-list-item v-if="tareasFiltradas.length === 0">
            <v-list-item-title class="text-grey text-center">
              No hay tareas
            </v-list-item-title>
          </v-list-item>
        </v-list>

        <!-- Dialog Crear/Editar -->
        <v-dialog v-model="dialog" max-width="400">
          <v-card>
            <v-card-title>{{ editando ? 'Editar tarea' : 'Nueva tarea' }}</v-card-title>
            <v-card-text>
              <v-text-field
                v-model="form.titulo"
                label="Título"
                :error-messages="errorTitulo"
              />
              <v-checkbox v-model="form.completada" label="Completada" />
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn @click="dialog = false">Cancelar</v-btn>
              <v-btn color="primary" @click="guardar">Guardar</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- Dialog Eliminar -->
        <v-dialog v-model="dialogEliminar" max-width="350">
          <v-card>
            <v-card-title>¿Eliminar tarea?</v-card-title>
            <v-card-text>
              Esta acción no se puede deshacer.
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn @click="dialogEliminar = false">Cancelar</v-btn>
              <v-btn color="error" @click="eliminar">Eliminar</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- Snackbar de notificaciones -->
        <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2500">
          {{ snackbar.text }}
        </v-snackbar>

      </v-container>
    </v-main>

    <!-- Contenido cuando no está autenticado -->
    <v-main v-else>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { tareaService } from '@/services/tareaService'
import { authService } from '@/services/authService'

const router = useRouter()

const tareas = ref([])
const busqueda = ref('')
const filtro = ref('todas')
const dialog = ref(false)
const dialogEliminar = ref(false)
const editando = ref(false)
const tareaSeleccionada = ref(null)
const errorTitulo = ref('')
const logoutLoading = ref(false)
const isAuthenticated = ref(false)

const form = ref({ titulo: '', completada: false })
const snackbar = ref({ show: false, text: '', color: 'success' })

const tareasFiltradas = computed(() => {
  if (filtro.value === 'completadas') return tareas.value.filter(t => t.completada)
  if (filtro.value === 'pendientes') return tareas.value.filter(t => !t.completada)
  return tareas.value
})

const notify = (text, color = 'success') => {
  snackbar.value = { show: true, text, color }
}

const cargarTareas = async () => {
  try {
    const res = await tareaService.getAll()
    tareas.value = res.data
  } catch (error) {
    console.error('Error al cargar tareas:', error)
    notify('Error al cargar tareas', 'error')
  }
}

const buscar = async () => {
  try {
    if (!busqueda.value) return cargarTareas()
    const res = await tareaService.buscar(busqueda.value)
    tareas.value = res.data
  } catch (error) {
    console.error('Error al buscar tareas:', error)
    notify('Error al buscar tareas', 'error')
  }
}

const abrirDialogCrear = () => {
  editando.value = false
  form.value = { titulo: '', completada: false }
  errorTitulo.value = ''
  dialog.value = true
}

const abrirDialogEditar = (tarea) => {
  editando.value = true
  tareaSeleccionada.value = tarea
  form.value = { titulo: tarea.titulo, completada: tarea.completada }
  errorTitulo.value = ''
  dialog.value = true
}

const abrirDialogEliminar = (tarea) => {
  tareaSeleccionada.value = tarea
  dialogEliminar.value = true
}

const guardar = async () => {
  if (!form.value.titulo) {
    errorTitulo.value = 'El título es requerido'
    return
  }
  
  try {
    if (editando.value) {
      await tareaService.actualizar(tareaSeleccionada.value.id, form.value)
      notify('Tarea actualizada')
    } else {
      await tareaService.crear(form.value)
      notify('Tarea creada', 'success')
    }
    dialog.value = false
    cargarTareas()
  } catch (error) {
    console.error('Error al guardar tarea:', error)
    notify('Error al guardar tarea', 'error')
  }
}

const toggleCompletar = async (tarea) => {
  try {
    await tareaService.actualizar(tarea.id, { ...tarea, completada: !tarea.completada })
    cargarTareas()
  } catch (error) {
    console.error('Error al cambiar estado:', error)
    notify('Error al cambiar estado', 'error')
  }
}

const eliminar = async () => {
  try {
    await tareaService.eliminar(tareaSeleccionada.value.id)
    notify('Tarea eliminada', 'error')
    dialogEliminar.value = false
    cargarTareas()
  } catch (error) {
    console.error('Error al eliminar tarea:', error)
    notify('Error al eliminar tarea', 'error')
  }
}

const handleLogout = async () => {
  logoutLoading.value = true
  try {
    await authService.logout()
    isAuthenticated.value = false
    notify('Sesión cerrada correctamente', 'success')
    router.push('/login')
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
    notify('Error al cerrar sesión', 'error')
  } finally {
    logoutLoading.value = false
  }
}

const checkAuthStatus = async () => {
  try {
    if (authService.isAuthenticated()) {
      await authService.verify()
      isAuthenticated.value = true
      await cargarTareas()
    } else {
      isAuthenticated.value = false
      router.push('/login')
    }
  } catch (error) {
    console.error('Error al verificar autenticación:', error)
    isAuthenticated.value = false
    router.push('/login')
  }
}

// Escuchar eventos de autenticación
const setupAuthListeners = () => {
  const handleLoginSuccess = () => {
    isAuthenticated.value = true
    cargarTareas()
  }

  const handleLogout = () => {
    isAuthenticated.value = false
  }

  // Suscribirse a eventos
  authService.onAuthEvent('login-success', handleLoginSuccess)
  authService.onAuthEvent('logout', handleLogout)

  // Limpiar suscripciones cuando el componente se destruye
  onUnmounted(() => {
    authService.offAuthEvent('login-success', handleLoginSuccess)
    authService.offAuthEvent('logout', handleLogout)
  })
}

onMounted(() => {
  checkAuthStatus()
  setupAuthListeners()
})
</script>