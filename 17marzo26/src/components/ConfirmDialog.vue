<template>
  <v-dialog
    :model-value="modelValue"
    max-width="420"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card rounded="lg">
      <v-card-title class="pa-4">
        <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
        ¿Eliminar tarea?
      </v-card-title>
      <v-card-text>
        Esta acción es irreversible.
        <span v-if="tarea">
          La tarea <strong>"{{ tarea.titulo }}"</strong> será eliminada definitivamente.
        </span>
      </v-card-text>
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" @click="$emit('update:modelValue', false)" data-test="confirm-dialog-cancel">
          Cancelar
        </v-btn>
        <v-btn color="error" :loading="loading" @click="$emit('confirmar')" data-test="confirm-dialog-delete">
          Eliminar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
defineProps({
  modelValue: Boolean,
  tarea: { type: Object, default: null },
  loading: Boolean
})

defineEmits(['update:modelValue', 'confirmar'])
</script>
