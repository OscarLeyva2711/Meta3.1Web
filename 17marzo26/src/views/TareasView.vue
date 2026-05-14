<template>
  <v-container max-width="800" class="py-8">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Mis Tareas</h1>
        <p class="text-medium-emphasis mt-1">Gestiona tus tareas con la API REST</p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        size="large"
        elevation="2"
        @click="abrirFormulario()"
        data-test="new-task-button"
      >
        Nueva tarea
      </v-btn>
    </div>

    <TareaFiltros
      v-model:busqueda="busqueda"
      v-model:filtro="filtroEstado"
      :total="tareasFiltradas.length"
    />

    <div v-if="loading" class="text-center py-10">
      <v-progress-circular indeterminate color="primary" size="48" />
      <p class="mt-4 text-medium-emphasis">Cargando tareas...</p>
    </div>

    <v-alert
      v-else-if="error"
      type="error"
      variant="tonal"
      class="mb-4"
      rounded="lg"
    >
      {{ error }}
      <template #append>
        <v-btn variant="text" @click="cargarTareas">Reintentar</v-btn>
      </template>
    </v-alert>

    <v-card
      v-else-if="tareasFiltradas.length === 0"
      elevation="0"
      class="text-center py-12"
      rounded="lg"
      border
    >
      <v-icon size="64" color="primary" opacity="0.3">mdi-check-circle</v-icon>
      <p class="text-h6 mt-4 text-medium-emphasis">No hay tareas</p>
      <p class="text-body-2 text-disabled">
        {{ busqueda ? 'No se encontraron resultados para tu búsqueda' : 'Crea tu primera tarea' }}
      </p>
    </v-card>

    <template v-else>
      <TareaCard
        v-for="tarea in tareasFiltradas"
        :key="tarea.id"
        :tarea="tarea"
        @toggle="toggleCompletada"
        @editar="abrirFormulario"
        @eliminar="abrirConfirmacion"
      />
    </template>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      location="bottom right"
      rounded="lg"
    >
      <v-icon class="mr-2">{{ snackbar.icon }}</v-icon>
      {{ snackbar.text }}
    </v-snackbar>

    <TareaForm
      v-model="dialogForm"
      :tarea-editar="tareaSeleccionada"
      :loading="loadingForm"
      @guardar="guardarTarea"
    />

    <ConfirmDialog
      v-model="dialogConfirm"
      :tarea="tareaSeleccionada"
      :loading="loadingEliminar"
      @confirmar="eliminarTarea"
    />
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { tareaService } from '@/services/tareaService'
import TareaCard from '@/components/TareaCard.vue'
import TareaForm from '@/components/TareaForm.vue'
import TareaFiltros from '@/components/TareaFiltros.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const tareas = ref([])
const loading = ref(false)
const error = ref('')
const busqueda = ref('')
const filtroEstado = ref('todas')
const tareaSeleccionada = ref(null)

const dialogForm = ref(false)
const dialogConfirm = ref(false)
const loadingForm = ref(false)
const loadingEliminar = ref(false)

const snackbar = ref({ show: false, text: '', color: 'success', icon: 'mdi-check' })

const notify = (text, color = 'success') => {
  snackbar.value = {
    show: true,
    text,
    color,
    icon: color === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle'
  }
}

const tareasFiltradas = computed(() => {
  let resultado = tareas.value

  if (filtroEstado.value === 'completadas') {
    resultado = resultado.filter(t => t.completada)
  } else if (filtroEstado.value === 'pendientes') {
    resultado = resultado.filter(t => !t.completada)
  }

  if (busqueda.value && busqueda.value.trim()) {
    const q = busqueda.value.toLowerCase()
    resultado = resultado.filter(t => t.titulo.toLowerCase().includes(q))
  }

  return resultado
})

const cargarTareas = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await tareaService.getAll()
    if (res.success) {
      tareas.value = res.data
    } else {
      error.value = res.message || 'Error al cargar las tareas'
    }
  } catch (e) {
    console.error('Error al cargar tareas:', e)
    error.value = '¿Está corriendo el servidor? npm start en api-tareas-mvc'
  } finally {
    loading.value = false
  }
}

const abrirFormulario = (tarea = null) => {
  tareaSeleccionada.value = tarea
  dialogForm.value = true
}

const guardarTarea = async (datos) => {
  loadingForm.value = true
  try {
    if (tareaSeleccionada.value) {
      const res = await tareaService.actualizar(tareaSeleccionada.value.id, datos)
      if (res.success) {
        const idx = tareas.value.findIndex(t => t.id === tareaSeleccionada.value.id)
        if (idx >= 0) tareas.value[idx] = res.data
        notify('Tarea actualizada correctamente')
      }
    } else {
      const res = await tareaService.crear(datos)
      if (res.success) {
        tareas.value.push(res.data)
        notify('Tarea creada correctamente')
      }
    }
    dialogForm.value = false
  } catch (e) {
    notify('Error al guardar la tarea', 'error')
  } finally {
    loadingForm.value = false
  }
}

const toggleCompletada = async (tarea) => {
  try {
    const res = await tareaService.actualizarParcial(tarea.id, { completada: !tarea.completada })
    if (res.success) {
      const idx = tareas.value.findIndex(t => t.id === tarea.id)
      if (idx >= 0) tareas.value[idx] = res.data
      notify(res.data.completada ? 'Tarea completada ✓' : 'Tarea marcada como pendiente')
    }
  } catch (e) {
    notify('Error al actualizar la tarea', 'error')
  }
}

const abrirConfirmacion = (tarea) => {
  tareaSeleccionada.value = tarea
  dialogConfirm.value = true
}

const eliminarTarea = async () => {
  loadingEliminar.value = true
  try {
    const res = await tareaService.eliminar(tareaSeleccionada.value.id)
    if (res.success) {
      tareas.value = tareas.value.filter(t => t.id !== tareaSeleccionada.value.id)
      notify('Tarea eliminada correctamente')
      dialogConfirm.value = false
    }
  } catch (e) {
    notify('Error al eliminar la tarea', 'error')
  } finally {
    loadingEliminar.value = false
  }
}

onMounted(cargarTareas)
</script>
