<template>
  <div class="goal-tree">
    <h2 class="text-xl font-bold mb-4">Målstruktur</h2>
    <AddGoalForm @add-goal="onAddGoal" />
    <div v-if="rootGoals.length === 0">
      <p>Inga mål ännu. Skapa ett nytt mål för att böria.</p>
    </div>
    <div v-else>
      <GoalTreeItem
        v-for="goal in rootGoals"
        :key="goal.id"
        :goal="goal"
        :all-goals="goals"
        @toggle-complete="onToggleComplete"
        @edit="onEdit"
        @delete="onDelete"
        @create-child="onCreateChild"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Goal } from '~/types/goal-entity';
import GoalNode from './GoalNode.vue';
import AddGoalForm from './AddGoalForm.vue';

interface GoalTreeProps {
  goals: Goal[];
  onToggleComplete: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onCreateChild: (parentId: string) => void;
  onAddGoal: (goal: Omit<Goal, 'id' | 'is_completed' | 'parent_ids' | 'child_ids'>) => void;
}

const props = defineProps<GoalTreeProps>();
const emit = defineEmits([
  'toggle-complete',
  'edit',
  'delete',
  'create-child',
  'add-goal',
]);

const rootGoals = computed(() => {
  return props.goals.filter(goal => goal.parent_ids.length === 0);
});

interface GoalTreeItemProps {
  goal: Goal;
  allGoals: Goal[];
  onToggleComplete: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onCreateChild: (parentId: string) => void;
}

// Recursive component for rendering goal and its children
const GoalTreeItem = defineComponent({
  name: 'GoalTreeItem',
  props: {
    goal: { type: Object as PropType<Goal>, required: true },
    allGoals: { type: Array as PropType<Goal[]>, required: true },
  },
  emits: ['toggle-complete', 'edit', 'delete', 'create-child'],
  setup(props, { emit }) {
    const getChildren = (goalId: string) => {
      return props.allGoals.filter(goal => goal.parent_ids.includes(goalId));
    };

    const children = computed(() => getChildren(props.goal.id));

    return {
      children,
      // Pass emits through GoalNode
      onToggleComplete: (id: string) => emit('toggle-complete', id),
      onEdit: (id: string) => emit('edit', id),
      onDelete: (id: string) => emit('delete', id),
      onCreateChild: (parentId: string) => emit('create-child', parentId),
    };
  },
  components: {
    GoalNode,
  },
  template: `
    <div class="ml-6">
      <GoalNode 
        :goal="goal" 
        @toggle-complete="onToggleComplete"
        @edit="onEdit"
        @delete="onDelete"
      />
      <div class="mt-2">
        <button 
          @click="onCreateChild(goal.id)"
          class="px-2 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 mb-2"
        >
          Lägg till undermål
        </button>
        <div v-if="children.length > 0" class="border-l-2 border-gray-300 pl-4">
          <GoalTreeItem
            v-for="child in children"
            :key="child.id"
            :goal="child"
            :all-goals="allGoals"
            @toggle-complete="onToggleComplete"
            @edit="onEdit"
            @delete="onDelete"
            @create-child="onCreateChild"
          />
        </div>
      </div>
    </div>
  `,
});
</script>
