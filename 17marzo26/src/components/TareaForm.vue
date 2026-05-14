<template>
  <v-dialog
    :model-value="modelValue"
    max-width="500"
    @update:model-value="$emit('update:modelValue', $event)"
  >
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
          data-test="tarea-form-titulo"
          @keyup.enter="guardar"
        />

        <v-textarea
          v-model="form.descripcion"
          label="Descripción (opcional)"
          variant="outlined"
          rows="3"
          prepend-inner-icon="mdi-text-long"
          data-test="tarea-form-descripcion"
        />

        <v-switch
          v-model="form.completada"
          label="Marcar como completada"
          color="success"
          hide-details
          inset
          data-test="tarea-form-completada"
        />
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" @click="cerrar" data-test="tarea-form-cancel">Cancelar</v-btn>
        <v-btn
          :color="modoEdicion ? 'primary' : 'success'"
          variant="elevated"
          :loading="loading"
          @click="guardar"
          data-test="tarea-form-submit"
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
  tareaEditar: { type: Object, default: null },
  loading: Boolean
})

const emit = defineEmits(['update:modelValue', 'guardar'])

const form = ref({ titulo: '', descripcion: '', completada: false })
const errorTitulo = ref('')

const modoEdicion = computed(() => !!props.tareaEditar)

watch(() => props.modelValue, (val) => {
  if (val) {
    if (props.tareaEditar) {
      form.value = {
        titulo: props.tareaEditar.titulo || '',
        descripcion: props.tareaEditar.descripcion || '',
        completada: !!props.tareaEditar.completada
      }
    } else {
      form.value = { titulo: '', descripcion: '', completada: false }
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
