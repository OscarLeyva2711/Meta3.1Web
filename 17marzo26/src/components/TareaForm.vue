<template>
  <v-dialog :model-value="modelValue" max-width="500" @update:model-value="$emit('update:modelValue', $event)">
    <v-card rounded="lg">
      <v-card-title class="pa-4 pb-2">
        <v-icon class="mr-2" :color="modoEdicion ? 'primary' : 'success'">
          {{ modoEdicion ? 'mdi-pencil' : 'mdi-plus-circle' }}
        </v-icon>
        {{ modoEdicion ? 'Editar tarea' : 'Nueva tarea' }}
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-4">
        <v-text-field
          v-model="form.titulo"
          label="Título de la tarea"
          placeholder="Ej: Estudiar para el examen"
          variant="outlined"
          :error-messages="errorTitulo"
          prepend-inner-icon="mdi-text"
          autofocus
          @keyup.enter="guardar"
        />

        <v-switch
          v-model="form.completada"
          label="Marcar como completada"
          color="success"
          hide-details
          inset
        />
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" @click="cerrar">Cancelar</v-btn>
        <v-btn
          :color="modoEdicion ? 'primary' : 'success'"
          variant="elevated"
          :loading="loading"
          @click="guardar"
        >
          {{ modoEdicion ? 'Guardar cambios' : 'Crear tarea' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  tareaEditar: {
    type: Object,
    default: null
  },
  loading: Boolean
})

const emit = defineEmits(['update:modelValue', 'guardar'])

const form = ref({ titulo: '', completada: false })
const errorTitulo = ref('')

const modoEdicion = computed(() => !!props.tareaEditar)

watch(() => props.modelValue, (val) => {
  if (val) {
    if (props.tareaEditar) {
      form.value = { ...props.tareaEditar }
    } else {
      form.value = { titulo: '', completada: false }
    }
    errorTitulo.value = ''
  }
})

const guardar = () => {
  if (!form.value.titulo.trim()) {
    errorTitulo.value = 'El título es requerido'
    return
  }
  errorTitulo.value = ''
  emit('guardar', { ...form.value })
}

const cerrar = () => {
  emit('update:modelValue', false)
}
</script>