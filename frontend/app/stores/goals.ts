import { defineStore } from 'pinia'

interface Goal {
  id: number
  title: string
  created: string
  finished: string | null
}

interface GoalRelation {
  child_id: number
  parent_id: number
}

export const useGoalsStore = defineStore('goals', {
  state: () => ({
    goals: [] as Goal[],
    relations: [] as GoalRelation[],
    isLoaded: false,
    error: null as string | null,
  }),

  getters: {
    // Hitta mål baserat på ID
    getGoalById: (state) => (id: number) => {
      return state.goals.find(g => g.id === id)
    },

    // Sök mål baserat på text
    searchGoals: (state) => (query: string) => {
      if (!query.trim()) return []
      const lowerQuery = query.toLowerCase()
      return state.goals.filter(g =>
        g.title.toLowerCase().includes(lowerQuery)
      )
    },

    // Hämta föräldrar för ett mål
    getParents: (state) => (goalId: number) => {
      const parentIds = state.relations
        .filter(r => r.child_id === goalId)
        .map(r => r.parent_id)

      return state.goals.filter(g => parentIds.includes(g.id))
    },

    // Hämta barn för ett mål
    getChildren: (state) => (goalId: number) => {
      const childIds = state.relations
        .filter(r => r.parent_id === goalId)
        .map(r => r.child_id)

      return state.goals.filter(g => childIds.includes(g.id))
    },

    // Hämta grundmål (mål utan föräldrar)
    getRootGoals: (state) => {
      const childIds = new Set(state.relations.map(r => r.child_id))
      return state.goals.filter(g => !childIds.has(g.id))
    },
  },

  actions: {
    // Ladda alla mål och relationer
    async loadGoals() {
      try {
        this.error = null

        const { data, error: goalsError } = await useAsyncGql('GetUserGoals')

        if (goalsError.value) {
          console.error('GraphQL error loading goals:', goalsError.value)
          this.error = 'Failed to load goals'
          return
        }

        if (data.value?.goals && Array.isArray(data.value.goals)) {
          // Validate and sanitize goal data to prevent hydration issues
          this.goals = data.value.goals.filter(goal =>
            goal &&
            typeof goal === 'object' &&
            typeof goal.id === 'number' &&
            typeof goal.title === 'string'
          )
        }

        const { data: relationsData, error: relationsError } = await useAsyncGql('GetUserRelations')

        if (relationsError.value) {
          console.error('GraphQL error loading relations:', relationsError.value)
          this.error = 'Failed to load goal relations'
          return
        }

        if (relationsData.value?.goal_relations && Array.isArray(relationsData.value.goal_relations)) {
          // Validate and sanitize relation data
          this.relations = relationsData.value.goal_relations.filter(relation =>
            relation &&
            typeof relation === 'object' &&
            typeof relation.child_id === 'number' &&
            typeof relation.parent_id === 'number'
          )
        }

        this.isLoaded = true
        console.log(`Loaded ${this.goals.length} goals and ${this.relations.length} relations`)
      } catch (error) {
        console.error('Failed to load goals:', error)
        this.error = error instanceof Error ? error.message : 'Unknown error loading goals'
        // Don't set isLoaded to true on error to allow retry
      }
    },

    // Lägg till ett nytt mål
    addGoal(goal: Goal) {
      this.goals.push(goal)
    },

    // Uppdatera ett mål
    updateGoal(id: number, updates: Partial<Goal>) {
      const index = this.goals.findIndex(g => g.id === id)
      if (index !== -1) {
        this.goals[index] = { ...this.goals[index], ...updates }
      }
    },

    // Ta bort ett mål
    removeGoal(id: number) {
      this.goals = this.goals.filter(g => g.id !== id)
      // Ta även bort relaterade relationer
      this.relations = this.relations.filter(
        r => r.child_id !== id && r.parent_id !== id
      )
    },

    // Lägg till en relation
    addRelation(childId: number, parentId: number) {
      // Kolla om relationen redan finns
      const exists = this.relations.some(
        r => r.child_id === childId && r.parent_id === parentId
      )

      if (!exists) {
        this.relations.push({ child_id: childId, parent_id: parentId })
      }
    },

    // Ta bort en relation
    removeRelation(childId: number, parentId: number) {
      this.relations = this.relations.filter(
        r => !(r.child_id === childId && r.parent_id === parentId)
      )
    },

    // Clear error state
    clearError() {
      this.error = null
    },

    // Reset store state (useful for error recovery)
    reset() {
      this.goals = []
      this.relations = []
      this.isLoaded = false
      this.error = null
    },
  },
})
