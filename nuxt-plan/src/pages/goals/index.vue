<template>
  <div class="min-h-screen bg-white dark:bg-gray-900 p-4">
    <div v-if="goalsStore.loading" class="text-black dark:text-white">Laddar mål...</div>
    <div v-else class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold mb-6 text-black dark:text-white">Målhantering</h1>
      <DnDGoalTree
        :goals="goalsStore.goals"
        @toggle-complete="handleToggleComplete"
        @edit="handleEdit"
        @delete="handleDelete"
        @create-child="handleCreateChild"
        @add-goal="handleAddGoal"
        @reorder-goals="handleReorderGoals"
      />
      <div v-if="goalsStore.error" class="text-red-500 mt-4">Error: {{ goalsStore.error }}</div>
    </div>
  </div>

<script setup lang="ts">
import { onMounted } from 'vue';
import { DnDGoalTree } from '@/components/goals';
import { useGoalsStore } from '~/stores/goals';
import type { Goal } from '~/types/goal-entity';

const goalsStore = useGoalsStore();

onMounted(() => {
  goalsStore.fetchGoals();
});

const handleToggleComplete = async (id: string) => {
  const goal = goalsStore.goals.find(g => g.id === id);
  if (goal) {
    await goalsStore.updateGoal(id, { is_completed: !goal.is_completed });
  }
};

const handleEdit = async (id: string) => {
  console.log('Edit goal:', id);
  // A more complete implementation would navigate to an edit page/modal
};

const handleDelete = async (id: string) => {
  await goalsStore.deleteGoal(id);
};

const handleCreateChild = async (parentId: string) => {
  console.log('Create child for:', parentId);
  // A more complete implementation would open a form to add a sub-goal
};

const handleAddGoal = async (goalData: Omit<Goal, 'id' | 'is_completed' | 'parent_ids' | 'child_ids'>) => {
  await goalsStore.createGoal(goalData);
};

const handleReorderGoals = async (reorderedGoals: Goal[]) => {
  // This would ideally update the backend via an action as well
  console.log('Reordering goals (frontend only for now):', reorderedGoals);
  goalsStore.setGoalsLocally(reorderedGoals);
};
</script>