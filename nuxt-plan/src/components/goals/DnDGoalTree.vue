<template>
  <div class="goal-tree">
    <h2 class="text-xl font-bold mb-4 text-black dark:text-white">Målstruktur</h2>
    <AddGoalForm @add-goal="(payload) => $emit('add-goal', payload)" />
    <div v-if="rootGoals.length === 0">
      <p class="text-black dark:text-white">Inga mål ännu. Skapa ett nytt mål för att börja.</p>
    </div>
    <div v-else>
      <draggable
        v-model="rootGoalsLocal"
        tag="div"
        group="goals" <!-- Shared group name for nested dragging -->
        class="flex flex-col items-start space-y-2 mb-4"
        item-key="id"
        @change="handleDragChange" <!-- Use change event for full control -->
      >
        <template #item="{ element: goal }">
          <DnDGoalTreeItem
            :goal="goal"
            :all-goals="goals"
            @toggle-complete="(id) => $emit('toggle-complete', id)"
            @edit="(id) => $emit('edit', id)"
            @delete="(id) => $emit('delete', id)"
            @create-child="(parentId) => $emit('create-child', parentId)"
          />
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, PropType, ref, watch } from 'vue';
import draggable from 'vue-draggable-plus';
import type { Goal } from '~/types/goal-entity';
import { useGoalsStore } from '~/stores/goals'; // Import the Pinia store
import GoalNode from './GoalNode.vue';
import AddGoalForm from './AddGoalForm.vue';

interface DnDGoalTreeProps {
  goals: Goal[]; // This prop should ideally come from Pinia store in parent
}

const props = defineProps<DnDGoalTreeProps>();
const emit = defineEmits([
  'toggle-complete',
  'edit',
  'delete',
  'create-child',
  'add-goal',
  'reorder-goals',
]);

const goalsStore = useGoalsStore(); // Use the Pinia store

// Local ref to hold a copy of goals for v-model, will be synchronized with store
const rootGoalsLocal = ref<Goal[]>([]);

// Watch for changes in the props.goals (which comes from the store) and update local refs
watch(() => props.goals, (newGoals) => {
  rootGoalsLocal.value = newGoals.filter(goal => goal.parent_ids.length === 0);
}, { immediate: true, deep: true });

const handleDragChange = (event: any) => {
  if (event.added) {
    const movedGoal = event.added.element as Goal;
    const newIndex = event.added.newIndex;
    const newParentId = event.to.dataset.parentId || null; // Get parentId from target element

    console.log("Moved goal:", movedGoal.title, "to new parent:", newParentId, "at index:", newIndex);
    goalsStore.moveGoal({
      movedGoalId: movedGoal.id,
      newParentId: newParentId,
      newIndex: newIndex,
    });

  } else if (event.removed) {
    // Item was removed from a list, this is handled by the `added` event in the *destination* list
    // When an item is moved to another list, it's a `removed` event in the source list and an `added` in the target list.
    // The primary logic is in the `added` event, which ensures the hierarchy is updated.
  } else if (event.moved) {
    // Item was reordered within the same list.
    // The v-model takes care of updating `rootGoalsLocal` directly for reordering.
    // We need to ensure the main `goalsStore.goals` gets the updated order of top-level items.
    // The `moveGoal` action also handles simple reordering if newParentId is the same or null.
    goalsStore.moveGoal({
      movedGoalId: event.moved.element.id,
      newParentId: event.to ? (event.to.dataset.parentId || null) : null, // Infer current parent
      newIndex: event.moved.newIndex,
    });
  }
};

interface DnDGoalTreeItemProps {
  goal: Goal;
  allGoals: Goal[];
}

// Recursive component for rendering goal and its children within the DND tree structure.
const DnDGoalTreeItem = defineComponent({
  name: 'DnDGoalTreeItem',
  props: {
    goal: { type: Object as PropType<Goal>, required: true },
    allGoals: { type: Array as PropType<Goal[]>, required: true },
  },
  emits: ['toggle-complete', 'edit', 'delete', 'create-child'],
  setup(props, { emit }) {
    const getChildren = (goalId: string) => {
      return props.allGoals.filter(g => g.parent_ids.includes(goalId));
    };

    const childrenLocal = computed<Goal[]>({ // Writable computed for nested draggable
      get: () => getChildren(props.goal.id),
      set: (newValue: Goal[]) => {
        // This setter is called by vue-draggable-plus after a drag operation within children.
        // We handle reparenting and reordering in the centralized `goalsStore.moveGoal` action
        // so this setter primarily ensures Vue Draggable has a reactive array to work with.
        // Actual data model updates happen via the @change event handler.
      }
    });

    const handleNestedDragChange = (event: any) => {
      if (event.added) {
          const movedGoal = event.added.element as Goal;
          const newIndex = event.added.newIndex;
          const newParentId = props.goal.id; // The current goal is the new parent
          goalsStore.moveGoal({
              movedGoalId: movedGoal.id,
              newParentId: newParentId,
              newIndex: newIndex,
          });
       } else if (event.removed) {
          // Handled by the `added` event in destination list
       } else if (event.moved) {
          // Reordering within the same children list
          goalsStore.moveGoal({
              movedGoalId: event.moved.element.id,
              newParentId: props.goal.id, // Parent remains the same
              newIndex: event.moved.newIndex,
          });
       }
    }

    return {
      childrenLocal,
      onToggleComplete: (id: string) => emit('toggle-complete', id),
      onEdit: (id: string) => emit('edit', id),
      onDelete: (id: string) => emit('delete', id),
      onCreateChild: (parentId: string) => emit('create-child', parentId),
      handleNestedDragChange,
    };
  },
  components: {
    GoalNode,
    draggable,
  },
  template: `
    <div class="ml-6">
      <GoalNode 
        :goal="goal" 
        @toggle-complete="onToggleComplete"
        @edit="onEdit"
        @delete="onDelete"
      />
      <div 
        class="mt-2"
        :data-parent-id="goal.id" <!-- Add parentId for dropped elements detection -->
      >
        <button 
          @click="onCreateChild(goal.id)"
          class="px-2 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 mb-2"
        >
          Lägg till undermål
        </button>
        <div v-if="childrenLocal.length > 0 || (goalsStore.goals.some(g => g.parent_ids.includes(goal.id)) && goalsStore.loading === false)"
             class="border-l-2 border-gray-300 pl-4">
          <draggable
            v-model="childrenLocal"
            tag="div"
            group="goals"
            class="space-y-2"
            item-key="id"
            @change="handleNestedDragChange"
          >
            <template #item="{ element: childGoal }">
              <DnDGoalTreeItem
                :goal="childGoal"
                :all-goals="allGoals"
                @toggle-complete="onToggleComplete"
                @edit="onEdit"
                @delete="onDelete"
                @create-child="onCreateChild"
              />
            </template>
          </draggable>
        </div>
      </div>
    </div>
  `,
});

// We will centralize goal hierarchy updates within the Pinia store for better management.
</script>
