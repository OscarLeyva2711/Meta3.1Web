<template>
  <v-card
    class="tarea-card mb-3"
    :class="{ 'completada': tarea.completada }"
    elevation="2"
    rounded="lg"
  >
    <v-card-text class="d-flex align-center pa-4">
      <!-- Checkbox completada -->
      <v-checkbox
        :model-value="tarea.completada"
        color="success"
        hide-details
        class="mr-3"
        @change="$emit('toggle', tarea)"
      />

      <!-- Título -->
      <div class="flex-grow-1">
        <span
          class="text-body-1 font-weight-medium"
          :class="{ 'text-decoration-line-through text-medium-emphasis': tarea.completada }"
        >
          {{ tarea.titulo }}
        </span>
        <div class="mt-1">
          <v-chip
            size="x-small"
            :color="tarea.completada ? 'success' : 'warning'"
            variant="tonal"
          >
            {{ tarea.completada ? 'Completada' : 'Pendiente' }}
          </v-chip>
          <v-chip size="x-small" color="primary" variant="tonal" class="ml-1">
            ID: {{ tarea.id }}
          </v-chip>
        </div>
      </div>

      <!-- Acciones -->
      <div class="d-flex gap-1">
        <v-btn
          icon="mdi-pencil"
          size="small"
          variant="text"
          color="primary"
          @click="$emit('editar', tarea)"
        />
        <v-btn
          icon="mdi-delete"
          size="small"
          variant="text"
          color="error"
          @click="$emit('eliminar', tarea)"
        />
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  tarea: {
    type: Object,
    required: true
  }
})

defineEmits(['toggle', 'editar', 'eliminar'])
</script>

<style scoped>
.tarea-card {
  transition: all 0.2s ease;
  border-left: 4px solid transparent;
}
.tarea-card:hover {
  transform: translateX(4px);
}
.tarea-card.completada {
  border-left-color: #4caf50;
  opacity: 0.85;
}
</style>