<template>
  <div
    :class="[`flex flex-col p-2 rounded w-full`, selectedIndex === index ? 'bg-gray-200 dark:bg-gray-700' : 'bg-white dark:bg-gray-800']"
    @click="$emit('set-selected-index', index)"
    :style="{ marginLeft: `${level * 2}rem` }"
  >
    <div class="flex items-center space-x-2">
      <Checkbox
        :id="todo.id"
        :checked="todo.completed"
        @update:checked="$emit('toggle-todo', todo.id)"
      />
      <Label
        :for-id="todo.id"
        :class="[`text-sm font-medium leading-none`, 
          todo.completed ? 'line-through text-gray-500' : '',
          `peer-disabled:cursor-not-allowed peer-disabled:opacity-70`
        ]"
      >
        {{ todo.text }}
      </Label>
    </div>
    <div class="flex items-center text-xs mt-1 ml-6 text-gray-500">
      <span v-if="todo.assignedTo" class="mr-2">Tilldelad: {{ todo.assignedTo }}</span>
      <span v-if="todo.deadline">Deadline: {{ todo.deadline }}</span>
    </div>
  </div>
  <SortableItem
    v-for="subtask in childTasks"
    :key="subtask.id"
    :id="subtask.id"
    :todo="subtask"
    :selected-index="selectedIndex"
    :index="indexOf(subtask)"
    @toggle-todo="$emit('toggle-todo', $event)"
    @set-selected-index="$emit('set-selected-index', $event)"
    :level="level + 1"
    :todos="todos"
  />
</template>

<script setup lang="ts">
import { computed, PropType } from 'vue';
import type { Todo } from '~/types/todo-entity';
import Checkbox from '@/components/ui/checkbox.vue';
import Label from '@/components/ui/label.vue';

interface SortableItemProps {
  id: string;
  todo: Todo;
  selectedIndex: number | null;
  index: number;
  level?: number;
  todos: Todo[];
}

const props = withDefaults(defineProps<SortableItemProps>(),{
  level: 0,
});

const emit = defineEmits([
  'toggle-todo',
  'set-selected-index',
]);

const childTasks = computed(() => {
  return props.todo.childIds
    .map((childId: string) => props.todos.find((t: Todo) => t.id === childId))
    .filter((t): t is Todo => t !== undefined);
});

const indexOf = (item: Todo) => props.todos.indexOf(item);

// DND functionality from @dnd-kit is NOT implemented here; this is a structural stub.
</script>
