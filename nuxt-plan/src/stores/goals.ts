import { defineStore } from 'pinia';
import type { Goal } from '~/types/goal-entity';

interface GoalsState {
  goals: Goal[];
  loading: boolean;
  error: string | null;
}

export const useGoalsStore = defineStore('goals', {
  state: (): GoalsState => ({
    goals: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchGoals() {
      this.loading = true;
      this.error = null;
      try {
        const response = await fetch('/api/goals');
        if (!response.ok) {
          throw new Error('Failed to fetch goals');
        }
        this.goals = await response.json();
      } catch (e: any) {
        this.error = e.message || 'Failed to fetch goals';
      } finally {
        this.loading = false;
      }
    },

    async createGoal(goalData: Omit<Goal, 'id' | 'is_completed' | 'parent_ids' | 'child_ids'>) {
      this.loading = true; // Optional: show loading for individual actions
      this.error = null;
      try {
        const response = await fetch('/api/goals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(goalData),
        });
        
        if (!response.ok) {
          throw new Error('Failed to create goal');
        }
        
        const newGoal: Goal = await response.json();
        this.goals.push(newGoal);
      } catch (e: any) {
        this.error = e.message || 'Failed to create goal';
      } finally {
        this.loading = false;
      }
    },

    async updateGoal(id: string, updates: Partial<Goal>) {
      this.loading = true;
      this.error = null;
      try {
        const response = await fetch(`/api/goals/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update goal');
        }
        
        const updatedGoal: Goal = await response.json();
        const index = this.goals.findIndex(goal => goal.id === updatedGoal.id);
        if (index !== -1) {
          this.goals[index] = updatedGoal;
        }
      } catch (e: any) {
        this.error = e.message || 'Failed to update goal';
      } finally {
        this.loading = false;
      }
    },

    async deleteGoal(id: string) {
      this.loading = true;
      this.error = null;
      try {
        const response = await fetch(`/api/goals/${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete goal');
        }
        
        this.goals = this.goals.filter(goal => goal.id !== id);
      } catch (e: any) {
        this.error = e.message || 'Failed to delete goal';
      } finally {
        this.loading = false;
      }
    },
    
    // Synkrona aktioner (om behövs, exempelvis för att direkt ändra state)
    setGoalsLocally(goals: Goal[]) {
      this.goals = goals;
    },

    // Action to handle complex drag-and-drop operations including reparenting and reordering
    moveGoal({
        movedGoalId,
        newParentId, // The ID of the new parent goal, or null if it's a top-level goal
        newIndex, // The index within the new parent's children (or top-level list)
    }: { movedGoalId: string; newParentId: string | null; newIndex: number }) {
      const currentGoals = [...this.goals];

      // Find the moved goal
      const movedGoal = currentGoals.find(g => g.id === movedGoalId);
      if (!movedGoal) return;

      // Remove from old parent's children array
      if (movedGoal.parent_ids && movedGoal.parent_ids.length > 0) {
        const oldParentId = movedGoal.parent_ids[0]; // Assuming single parent for now
        const oldParent = currentGoals.find(g => g.id === oldParentId);
        if (oldParent) {
          oldParent.child_ids = oldParent.child_ids.filter(childId => childId !== movedGoalId);
        }
      }

      // Update moved goal's parent_ids
      movedGoal.parent_ids = newParentId ? [newParentId] : [];

      // Add to new parent's children array (or update root order)
      if (newParentId) {
        const newParent = currentGoals.find(g => g.id === newParentId);
        if (newParent) {
          // Ensure no duplicates and insert at newIndex
          const existingIndex = newParent.child_ids.indexOf(movedGoalId);
          if (existingIndex !== -1) {
            newParent.child_ids.splice(existingIndex, 1); // Remove old position
          }
          newParent.child_ids.splice(newIndex, 0, movedGoalId);
        }
      } else {
        // If moved to top level, ensure it's in the root goals list at newIndex
        const rootGoals = currentGoals.filter(g => g.parent_ids.length === 0 && g.id !== movedGoalId);
        const newRootIds = [...rootGoals.map(g => g.id)];
        newRootIds.splice(newIndex, 0, movedGoalId);
        
        // Reconstruct the main goals array with the new root order and child structures intact
        const reorderedFlatGoals: Goal[] = [];
        const processedIds = new Set<string>();

        const goalMap = new Map<string, Goal>(currentGoals.map(g => [g.id, g]));

        const addGoalAndChildren = (goalToAdd: Goal) => {
          if (processedIds.has(goalToAdd.id)) return;
          reorderedFlatGoals.push(goalToAdd);
          processedIds.add(goalToAdd.id);
          goalToAdd.child_ids.forEach(childId => {
            const child = goalMap.get(childId);
            if (child) addGoalAndChildren(child);
          });
        };
        
        newRootIds.forEach(id => {
            const goal = goalMap.get(id);
            if(goal) addGoalAndChildren(goal);
        });

        currentGoals.forEach(g => {
            if(!processedIds.has(g.id)) reorderedFlatGoals.push(g);
        });

        this.goals = reorderedFlatGoals;
        return; // Exit as this completely reconstructs the array
      }

      // If not a top-level move, simply update the currentGoals array (which has objects by reference)
      this.goals = currentGoals;
    },

    resetState() {
      this.goals = [];
      this.loading = false;
      this.error = null;
    }
  },
});