<template>
  <div class="goal-node border rounded p-4 mb-4 bg-white shadow">
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <input
          type="checkbox"
          :checked="goal.is_completed"
          @change="$emit('toggle-complete', goal.id)"
          class="mr-2"
        />
        <span :class="{ 'line-through text-gray-500': goal.is_completed }">
          {{ goal.title }}
        </span>
      </div>
      <div class="flex space-x-2">
        <button 
          @click="$emit('edit', goal.id)"
          class="px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          Ändra
        </button>
        <button 
          @click="$emit('delete', goal.id)"
          class="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
        >
          Ta bort
        </button>
      </div>
    </div>
    <img 
      v-if="goal.image_url" 
      :src="goal.image_url" 
      :alt="goal.title" 
      class="mt-2 max-w-xs rounded"
    />
    <img 
      v-if="goal.icon_url" 
      :src="goal.icon_url" 
      :alt="goal.title" 
      class="mt-2 w-6 h-6 inline-block"
    />
  </div>
</template>

<script setup lang="ts">
import type { Goal } from '~/types/goal-entity';

interface GoalNodeProps {
  goal: Goal;
}

const props = defineProps<GoalNodeProps>();
const emit = defineEmits(['toggle-complete', 'edit', 'delete']);
</script>