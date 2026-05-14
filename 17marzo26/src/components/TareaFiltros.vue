<template>
  <v-card class="mb-4" elevation="1" rounded="lg">
    <v-card-text class="pa-4">
      <v-row align="center" dense>
        <!-- Buscador -->
        <v-col cols="12" md="6">
          <v-text-field
            :model-value="busqueda"
            label="Buscar por título"
            placeholder="Ej: express..."
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-magnify"
            clearable
            hide-details
            @update:model-value="$emit('update:busqueda', $event)"
            @click:clear="$emit('update:busqueda', '')"
          />
        </v-col>

        <!-- Filtro estado -->
        <v-col cols="12" md="4">
          <v-select
            :model-value="filtro"
            :items="opcionesFiltro"
            label="Filtrar por estado"
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-filter"
            hide-details
            @update:model-value="$emit('update:filtro', $event)"
          />
        </v-col>

        <!-- Contador -->
        <v-col cols="12" md="2" class="text-center">
          <v-chip color="primary" variant="tonal">
            <v-icon start>mdi-format-list-checks</v-icon>
            {{ total }} tareas
          </v-chip>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  busqueda: { type: String, default: '' },
  filtro: { type: String, default: 'todas' },
  total: { type: Number, default: 0 }
})

defineEmits(['update:busqueda', 'update:filtro'])

const opcionesFiltro = [
  { title: 'Todas', value: 'todas' },
  { title: 'Pendientes', value: 'pendientes' },
  { title: 'Completadas', value: 'completadas' }
]
</script>