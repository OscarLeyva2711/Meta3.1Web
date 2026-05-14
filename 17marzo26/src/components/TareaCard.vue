<template>
  <v-card
    class="tarea-card mb-3"
    :class="{ 'completada': tarea.completada }"
    elevation="2"
    rounded="lg"
    :data-test="`tarea-card-${tarea.id}`"
  >
    <v-card-text class="d-flex align-center pa-4">
      <v-checkbox
        :model-value="tarea.completada"
        color="success"
        hide-details
        class="mr-3"
        :data-test="`tarea-toggle-${tarea.id}`"
        @change="$emit('toggle', tarea)"
      />

      <div class="flex-grow-1">
        <span
          class="text-body-1 font-weight-medium"
          :class="{ 'text-decoration-line-through text-medium-emphasis': tarea.completada }"
          :data-test="`tarea-titulo-${tarea.id}`"
        >
          {{ tarea.titulo }}
        </span>
        <p
          v-if="tarea.descripcion"
          class="text-body-2 text-medium-emphasis mb-0 mt-1"
        >
          {{ tarea.descripcion }}
        </p>
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

      <div class="d-flex gap-1">
        <v-btn
          icon="mdi-pencil"
          size="small"
          variant="text"
          color="primary"
          :data-test="`tarea-edit-${tarea.id}`"
          @click="$emit('editar', tarea)"
        />
        <v-btn
          icon="mdi-delete"
          size="small"
          variant="text"
          color="error"
          :data-test="`tarea-delete-${tarea.id}`"
          @click="$emit('eliminar', tarea)"
        />
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  tarea: { type: Object, required: true }
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
