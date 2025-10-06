<script setup lang="ts">
interface ChildRelation {
  child_id: number;
}

interface Goal {
  id: number;
  title: string;
  created: string;
  finished: string | null;
  childRelations: ChildRelation[];
}

interface GetRootGoalsResponse {
  goals: Goal[];
}

const { data: goalsData } = await useAsyncGql<GetRootGoalsResponse>("GetRootGoals");

const goals = computed(() => goalsData.value?.goals || []);

// Beräkna progress för varje mål
const getProgress = (goal: Goal) => {
  if (goal.childRelations.length === 0) return null;
  return goal.childRelations.length;
};
</script>

<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-300 mb-2">Grundmål</h1>
      <p class="text-gray-600">Mål utan föräldrar - dina högsta nivåer</p>
    </div>

    <div
      v-if="goals.length === 0"
      class="text-gray-500 p-6 border border-gray-700 rounded-lg text-center"
    >
      Inga grundmål ännu. Skapa ett nytt mål för att komma igång!
    </div>

    <ul v-else class="space-y-3">
      <li
        v-for="goal in goals"
        :key="goal.id"
        class="border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
      >
        <NuxtLink
          :to="`/goal/${goal.id}`"
          class="p-4 block"
        >
          <div class="flex items-start justify-between mb-2">
            <h3
              class="text-lg font-medium"
              :class="goal.finished ? 'text-gray-500 line-through' : 'text-gray-200'"
            >
              {{ goal.title }}
            </h3>
            <span
              v-if="goal.finished"
              class="px-2 py-1 text-xs font-semibold rounded bg-green-900 text-green-200"
            >
              Klar
            </span>
          </div>

          <div class="flex items-center gap-4 text-sm text-gray-500">
            <span>
              Skapad: {{ new Date(goal.created).toLocaleDateString("sv-SE") }}
            </span>
            <span v-if="getProgress(goal)">
              {{ getProgress(goal) }} undermål
            </span>
          </div>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
