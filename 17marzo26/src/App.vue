<template>
  <v-app>
    <v-app-bar color="primary" flat v-if="isAuthenticated">
      <v-app-bar-title>Gestión de Tareas</v-app-bar-title>
      <v-spacer />
      <v-btn
        v-if="isAdmin"
        variant="text"
        data-test="admin-panel-button"
        @click="adminMode = !adminMode"
      >
        <v-icon left>mdi-shield-account</v-icon>
        {{ adminMode ? 'Tareas' : 'Admin' }}
      </v-btn>
      <v-btn
        variant="text"
        @click="handleLogout"
        :loading="logoutLoading"
        data-test="logout-button"
      >
        <v-icon left>mdi-logout</v-icon>
        Cerrar Sesión
      </v-btn>
    </v-app-bar>

    <v-main v-if="isAuthenticated">
      <v-container v-if="!adminMode" max-width="900">
        <!-- Barra de búsqueda y botón nuevo -->
        <v-row class="mt-4" align="center">
          <v-col cols="12" md="5">
            <v-text-field
              v-model="busqueda"
              label="Buscar por título..."
              prepend-inner-icon="mdi-magnify"
              clearable
              hide-details
              density="compact"
              variant="outlined"
              @input="buscar"
              @click:clear="cargarTareas"
              data-test="search-input"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="tagFiltroIds"
              :items="tags"
              item-title="nombre"
              item-value="id"
              label="Etiquetas"
              multiple
              chips
              clearable
              hide-details
              density="compact"
              variant="outlined"
              data-test="tag-filter"
              @update:model-value="cargarTareas"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-btn color="primary" block @click="abrirDialogCrear" data-test="new-task-button">
              <v-icon left>mdi-plus</v-icon> Nueva tarea
            </v-btn>
          </v-col>
        </v-row>

        <!-- Filtros -->
        <v-row class="mt-2">
          <v-col>
            <v-btn-toggle v-model="filtro" mandatory color="primary">
              <v-btn value="todas" data-test="filter-all">Todas</v-btn>
              <v-btn value="pendientes" data-test="filter-pending">Pendientes</v-btn>
              <v-btn value="completadas" data-test="filter-completed">Completadas</v-btn>
            </v-btn-toggle>
          </v-col>
        </v-row>
        <v-row class="mt-2" align="center">
          <v-col cols="12" md="8">
            <v-text-field
              v-model="nuevoTag"
              label="Nueva etiqueta"
              density="compact"
              variant="outlined"
              hide-details
              data-test="new-tag-input"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-btn block variant="outlined" data-test="new-tag-button" @click="crearTag">
              <v-icon left>mdi-tag-plus</v-icon>
              Crear etiqueta
            </v-btn>
          </v-col>
        </v-row>

        <!-- Lista de tareas -->
        <v-list class="mt-4" rounded="lg">
          <v-list-item
            v-for="tarea in tareasFiltradas"
            :key="tarea.id"
            :class="['tarea-item', tarea.completada ? 'text-decoration-line-through text-grey' : '']"
            :data-test="`task-item-${tarea.id}`"
          >
            <template #prepend>
              <v-checkbox-btn
                :model-value="tarea.completada"
                @update:model-value="toggleCompletar(tarea)"
                :data-test="`task-toggle-${tarea.id}`"
              />
            </template>

            <v-list-item-title :data-test="`task-title-${tarea.id}`">
              {{ tarea.titulo }}
            </v-list-item-title>

            <template #append>
              <v-chip
                :color="tarea.completada ? 'success' : 'warning'"
                size="small"
                class="mr-2"
              >
                {{ tarea.completada ? 'Completada' : 'Pendiente' }}
              </v-chip>
              <v-chip
                v-for="tag in tarea.tags || []"
                :key="tag.id"
                size="small"
                color="primary"
                variant="tonal"
                class="mr-1"
                data-test="task-tag"
              >
                {{ tag.nombre }}
              </v-chip>
              <v-btn icon size="small" @click="abrirDialogEditar(tarea)" :data-test="`task-edit-${tarea.id}`">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn icon size="small" color="error" @click="abrirDialogEliminar(tarea)" :data-test="`task-delete-${tarea.id}`">
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
                data-test="form-titulo"
              />
              <v-textarea
                v-model="form.descripcion"
                label="Descripción (opcional)"
                rows="2"
                data-test="form-descripcion"
              />
              <v-checkbox v-model="form.completada" label="Completada" data-test="form-completada" />
              <v-select
                v-model="form.tagIds"
                :items="tags"
                item-title="nombre"
                item-value="id"
                label="Etiquetas"
                multiple
                chips
                clearable
                variant="outlined"
                data-test="form-tags"
              />
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn @click="dialog = false" data-test="form-cancel">Cancelar</v-btn>
              <v-btn color="primary" @click="guardar" :loading="loadingForm" data-test="form-submit">
                Guardar
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- Dialog Eliminar -->
        <v-dialog v-model="dialogEliminar" max-width="400">
          <v-card>
            <v-card-title>¿Eliminar tarea?</v-card-title>
            <v-card-text>
              Esta acción no se puede deshacer.
              <strong v-if="tareaSeleccionada">
                <br>"{{ tareaSeleccionada.titulo }}"
              </strong>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn @click="dialogEliminar = false" data-test="confirm-cancel">Cancelar</v-btn>
              <v-btn color="error" @click="eliminar" :loading="loadingEliminar" data-test="confirm-delete">
                Eliminar
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2500" data-test="app-snackbar">
          {{ snackbar.text }}
        </v-snackbar>
      </v-container>

      <v-container v-else max-width="1100" data-test="admin-panel">
        <h1 class="text-h5 font-weight-bold mt-4 mb-4">Administración</h1>

        <v-row>
          <v-col cols="12" md="5">
            <v-card>
              <v-card-title>Usuarios</v-card-title>
              <v-card-text>
                <v-text-field v-model="usuarioForm.nombre" label="Nombre" data-test="admin-user-name" />
                <v-text-field v-model="usuarioForm.email" label="Email" data-test="admin-user-email" />
                <v-text-field v-model="usuarioForm.password" label="Contraseña" type="password" data-test="admin-user-password" />
                <v-select
                  v-model="usuarioForm.rol"
                  :items="['usuario', 'admin', 'visualizador']"
                  label="Rol"
                  data-test="admin-user-role"
                />
                <v-btn block color="primary" data-test="admin-user-create" @click="crearUsuario">
                  Crear usuario
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="7">
            <v-card>
              <v-card-title>Lista de usuarios</v-card-title>
              <v-list data-test="admin-user-list">
                <v-list-item v-for="usuario in usuarios" :key="usuario.id" :data-test="`admin-user-${usuario.id}`">
                  <v-list-item-title>{{ usuario.nombre }} - {{ usuario.email }}</v-list-item-title>
                  <v-list-item-subtitle>{{ usuario.rol }} · {{ usuario.activo ? 'activo' : 'inactivo' }}</v-list-item-subtitle>
                  <template #append>
                    <v-btn
                      size="small"
                      variant="text"
                      :color="usuario.activo ? 'warning' : 'success'"
                      @click="toggleUsuario(usuario)"
                    >
                      {{ usuario.activo ? 'Desactivar' : 'Activar' }}
                    </v-btn>
                  </template>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>

        <v-card class="mt-4">
          <v-card-title>Búsquedas administrativas</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4">
                <v-select
                  v-model="adminTagIds"
                  :items="tags"
                  item-title="nombre"
                  item-value="id"
                  label="Etiquetas"
                  multiple
                  chips
                  data-test="admin-tag-search"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="adminUsuarioIds"
                  :items="usuarios"
                  item-title="email"
                  item-value="id"
                  label="Usuarios"
                  multiple
                  chips
                  data-test="admin-user-search"
                />
              </v-col>
              <v-col cols="12" md="4" class="d-flex align-center ga-2 flex-wrap">
                <v-btn data-test="admin-search-users-tags" @click="buscarUsuariosPorTags">Usuarios por etiquetas</v-btn>
                <v-btn data-test="admin-search-tasks-tags" @click="buscarTareasAdmin">Tareas por etiquetas</v-btn>
                <v-btn data-test="admin-search-tags-users" @click="buscarTagsPorUsuarios">Etiquetas por usuarios</v-btn>
              </v-col>
            </v-row>
            <pre class="admin-results" data-test="admin-search-results">{{ adminResultados }}</pre>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>

    <v-main v-else>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { tareaService } from '@/services/tareaService'
import { authService } from '@/services/authService'
import { tagService } from '@/services/tagService'
import { usuarioService } from '@/services/usuarioService'

const router = useRouter()
const route = useRoute()

const tareas = ref([])
const busqueda = ref('')
const filtro = ref('todas')
const dialog = ref(false)
const dialogEliminar = ref(false)
const editando = ref(false)
const tareaSeleccionada = ref(null)
const errorTitulo = ref('')
const logoutLoading = ref(false)
const loadingForm = ref(false)
const loadingEliminar = ref(false)
const isAuthenticated = ref(false)
const isAdmin = ref(false)
const adminMode = ref(false)
const tags = ref([])
const tagFiltroIds = ref([])
const nuevoTag = ref('')
const usuarios = ref([])
const adminTagIds = ref([])
const adminUsuarioIds = ref([])
const adminResultados = ref('')
const usuarioForm = ref({ nombre: '', email: '', password: '', rol: 'usuario' })

const form = ref({ titulo: '', descripcion: '', completada: false, tagIds: [] })
const snackbar = ref({ show: false, text: '', color: 'success' })

// Rutas en las que App.vue NO debe disparar verificación ni redirección
const SAFE_ROUTES = ['/login', '/oauth-callback', '/google-login']

const tareasFiltradas = computed(() => {
  if (filtro.value === 'completadas') return tareas.value.filter(t => t.completada)
  if (filtro.value === 'pendientes') return tareas.value.filter(t => !t.completada)
  return tareas.value
})

const notify = (text, color = 'success') => {
  snackbar.value = { show: true, text, color }
}

const cargarTags = async () => {
  try {
    const res = await tagService.getAll()
    tags.value = res.data || []
  } catch (error) {
    console.error('Error al cargar etiquetas:', error)
  }
}

const crearTag = async () => {
  if (!nuevoTag.value.trim()) return
  try {
    await tagService.crear(nuevoTag.value)
    nuevoTag.value = ''
    notify('Etiqueta creada', 'success')
    await cargarTags()
  } catch (error) {
    console.error('Error al crear etiqueta:', error)
    notify('Error al crear etiqueta', 'error')
  }
}

const cargarTareas = async () => {
  try {
    const params = tagFiltroIds.value.length ? { tagIds: tagFiltroIds.value.join(',') } : {}
    const res = await tareaService.getAll(params)
    tareas.value = res.data || []
  } catch (error) {
    console.error('Error al cargar tareas:', error)
    notify('Error al cargar tareas', 'error')
  }
}

const buscar = async () => {
  try {
    if (!busqueda.value) return cargarTareas()
    const params = tagFiltroIds.value.length ? { tagIds: tagFiltroIds.value.join(',') } : {}
    const res = await tareaService.buscar(busqueda.value, params)
    tareas.value = res.data || []
  } catch (error) {
    console.error('Error al buscar tareas:', error)
    notify('Error al buscar tareas', 'error')
  }
}

const abrirDialogCrear = () => {
  editando.value = false
  tareaSeleccionada.value = null
  form.value = { titulo: '', descripcion: '', completada: false, tagIds: [] }
  errorTitulo.value = ''
  dialog.value = true
}

const abrirDialogEditar = (tarea) => {
  editando.value = true
  tareaSeleccionada.value = tarea
  form.value = {
    titulo: tarea.titulo,
    descripcion: tarea.descripcion || '',
    completada: !!tarea.completada,
    tagIds: (tarea.tags || []).map(tag => tag.id)
  }
  errorTitulo.value = ''
  dialog.value = true
}

const abrirDialogEliminar = (tarea) => {
  tareaSeleccionada.value = tarea
  dialogEliminar.value = true
}

const guardar = async () => {
  if (!form.value.titulo.trim()) {
    errorTitulo.value = 'El título es requerido'
    return
  }
  loadingForm.value = true
  try {
    if (editando.value && tareaSeleccionada.value) {
      await tareaService.actualizar(tareaSeleccionada.value.id, form.value)
      notify('Tarea actualizada')
    } else {
      await tareaService.crear(form.value)
      notify('Tarea creada', 'success')
    }
    dialog.value = false
    await cargarTareas()
  } catch (error) {
    console.error('Error al guardar tarea:', error)
    notify('Error al guardar tarea', 'error')
  } finally {
    loadingForm.value = false
  }
}

const toggleCompletar = async (tarea) => {
  try {
    await tareaService.actualizarParcial(tarea.id, { completada: !tarea.completada })
    await cargarTareas()
  } catch (error) {
    console.error('Error al cambiar estado:', error)
    notify('Error al cambiar estado', 'error')
  }
}

const eliminar = async () => {
  if (!tareaSeleccionada.value) return
  loadingEliminar.value = true
  try {
    await tareaService.eliminar(tareaSeleccionada.value.id)
    notify('Tarea eliminada', 'success')
    dialogEliminar.value = false
    await cargarTareas()
  } catch (error) {
    console.error('Error al eliminar tarea:', error)
    notify('Error al eliminar tarea', 'error')
  } finally {
    loadingEliminar.value = false
  }
}

const cargarUsuarios = async () => {
  if (!isAdmin.value) return
  try {
    const res = await usuarioService.getAll()
    usuarios.value = res.data || []
  } catch (error) {
    console.error('Error al cargar usuarios:', error)
    notify('Error al cargar usuarios', 'error')
  }
}

const crearUsuario = async () => {
  try {
    await usuarioService.crear(usuarioForm.value)
    notify('Usuario creado', 'success')
    usuarioForm.value = { nombre: '', email: '', password: '', rol: 'usuario' }
    await cargarUsuarios()
  } catch (error) {
    console.error('Error al crear usuario:', error)
    notify('Error al crear usuario', 'error')
  }
}

const toggleUsuario = async (usuario) => {
  try {
    if (usuario.activo) {
      await usuarioService.desactivar(usuario.id)
    } else {
      await usuarioService.activar(usuario.id)
    }
    await cargarUsuarios()
  } catch (error) {
    console.error('Error al cambiar estado de usuario:', error)
    notify('Error al actualizar usuario', 'error')
  }
}

const buscarUsuariosPorTags = async () => {
  const res = await usuarioService.buscar({ tagIds: adminTagIds.value.join(',') })
  adminResultados.value = JSON.stringify(res.data || [], null, 2)
}

const buscarTareasAdmin = async () => {
  const res = await tareaService.getAll({ scope: 'all', tagIds: adminTagIds.value.join(',') })
  adminResultados.value = JSON.stringify(res.data || [], null, 2)
}

const buscarTagsPorUsuarios = async () => {
  const ids = adminUsuarioIds.value.join(',')
  const res = await tagService.buscar({ usuarioIds: ids })
  adminResultados.value = JSON.stringify(res.data || [], null, 2)
}

const handleLogout = async () => {
  logoutLoading.value = true
  try {
    await authService.logout()
    isAuthenticated.value = false
    isAdmin.value = false
    adminMode.value = false
    notify('Sesión cerrada correctamente', 'success')
    router.push('/login')
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
    isAuthenticated.value = false
    router.push('/login')
  } finally {
    logoutLoading.value = false
  }
}

const checkAuthStatus = async () => {
  // No interferir con login/callback OAuth
  if (SAFE_ROUTES.includes(route.path)) {
    isAuthenticated.value = false
    return
  }
  
  // Simplemente revisar si hay token en localStorage
  if (authService.isAuthenticated()) {
    isAuthenticated.value = true
    isAdmin.value = authService.getUserRole() === 'admin'
    await cargarTags()
    await cargarTareas()
    if (isAdmin.value) await cargarUsuarios()
  } else {
    isAuthenticated.value = false
    router.push('/login')
  }
}

// Reaccionar al cambio de ruta: cuando OAuthCallback haga push('/'), revisamos sesión.
watch(() => route.path, async (newPath) => {
  if (SAFE_ROUTES.includes(newPath)) {
    isAuthenticated.value = false
    return
  }
  if (authService.isAuthenticated() && !isAuthenticated.value) {
    isAuthenticated.value = true
    isAdmin.value = authService.getUserRole() === 'admin'
    await cargarTags()
    await cargarTareas()
    if (isAdmin.value) await cargarUsuarios()
  }
})

// Suscribirse a eventos de logout/login
let onLogin, onLogout
onMounted(() => {
  onLogin = async () => {
    isAuthenticated.value = true
    isAdmin.value = authService.getUserRole() === 'admin'
    await cargarTags()
    await cargarTareas()
    if (isAdmin.value) await cargarUsuarios()
  }
  onLogout = () => {
    isAuthenticated.value = false
    isAdmin.value = false
    adminMode.value = false
    tareas.value = []
  }
  authService.onAuthEvent('login-success', onLogin)
  authService.onAuthEvent('logout', onLogout)
  checkAuthStatus()
})

onUnmounted(() => {
  if (onLogin) authService.offAuthEvent('login-success', onLogin)
  if (onLogout) authService.offAuthEvent('logout', onLogout)
})
</script>

<style scoped>
.tarea-item {
  transition: background 0.15s ease;
}
</style>
