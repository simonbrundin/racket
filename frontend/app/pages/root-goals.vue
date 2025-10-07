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

interface UserGoal {
  goal: Goal;
}

interface GetRootGoalsResponse {
  user_goals: UserGoal[];
}

const { user } = useUserSession();

const { data: goalsData, refresh } = await useAsyncGql<GetRootGoalsResponse>("GetRootGoals", {
  userId: user.value?.id
});

const goals = computed(() => goalsData.value?.user_goals?.map(ug => ug.goal) || []);

// Beräkna progress för varje mål
const getProgress = (goal: Goal) => {
  if (goal.childRelations.length === 0) return null;
  return goal.childRelations.length;
};

// Använd goals store
const goalsStore = useGoalsStore();

// Ladda goals om de inte är laddade
onMounted(async () => {
  if (!goalsStore.isLoaded) {
    await goalsStore.loadGoals();
  }
});

// Sökfunktion för att lägga till nya grundmål
const showSearch = ref(false);
const searchQuery = ref("");
const searchInput = ref<HTMLInputElement | null>(null);

// Fokusera input när plus-knappen klickas
async function toggleSearch() {
  showSearch.value = !showSearch.value;
  if (showSearch.value) {
    await nextTick();
    searchInput.value?.focus();
  }
}

// Sök i lokal state istället för GraphQL
const searchResults = computed(() => {
  if (!searchQuery.value.trim()) return [];

  const results = goalsStore.searchGoals(searchQuery.value);

  // Filtrera bort mål som redan är grundmål
  const currentRootGoalIds = goals.value.map((g) => g.id);
  return results.filter((g) => !currentRootGoalIds.includes(g.id));
});

// Skapa nytt grundmål
async function createNewGoal() {
  if (!searchQuery.value.trim()) return;

  if (!user.value?.id) {
    console.error("User ID not found");
    return;
  }

  try {
    console.log("Creating goal with:", { title: searchQuery.value.trim(), userId: user.value.id });

    // Skapa nytt mål
    const result = await GqlCreateGoal({
      title: searchQuery.value.trim(),
      userId: user.value.id,
    });

    console.log("Create goal result:", result);

    // Hantera både { data } och direkt resultat
    const data = result?.data || result;

    if (data?.insert_goals_one?.id) {
      const newGoal = data.insert_goals_one;

      // Uppdatera lokal state
      goalsStore.addGoal(newGoal);

      // Uppdatera data från server
      await refresh();

      // Stäng och rensa sökning
      showSearch.value = false;
      searchQuery.value = "";
    } else {
      console.error("No goal ID in response:", data);
    }
  } catch (error) {
    console.error("Failed to create new goal:", error);
  }
}

// Hantera Enter-tangent
function handleSearchKeydown(event: KeyboardEvent) {
  if (event.key === "Enter") {
    // Skapa nytt mål
    createNewGoal();
  } else if (event.key === "Escape") {
    showSearch.value = false;
    searchQuery.value = "";
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="mb-8">
      <div class="flex items-center justify-between mb-2">
        <h1 class="text-3xl font-bold text-gray-300">Grundmål</h1>
        <button
          @click="toggleSearch"
          class="text-gray-500 hover:text-gray-300 transition-colors p-1 rounded hover:bg-gray-800"
          title="Skapa nytt grundmål"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>
      <p class="text-gray-600">Mål utan föräldrar - dina högsta nivåer</p>
    </div>

    <!-- Sökfält för att skapa nya grundmål -->
    <div
      v-if="showSearch"
      class="border border-gray-700 rounded-lg p-4 bg-gray-800 mb-6"
    >
      <div class="mb-2">
        <input
          ref="searchInput"
          v-model="searchQuery"
          @keydown="handleSearchKeydown"
          type="text"
          placeholder="Skriv titel på nytt grundmål (tryck Enter)"
          class="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          autofocus
        />
      </div>

      <!-- Meddelande om att skapa nytt mål -->
      <div
        v-if="searchQuery.trim()"
        class="text-sm text-gray-500 px-4 py-2"
      >
        Tryck Enter för att skapa "{{ searchQuery }}" som nytt grundmål
      </div>
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
