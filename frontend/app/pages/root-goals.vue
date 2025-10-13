<script setup lang="ts">
// Make this page client-only to ensure user session is available
definePageMeta({
  ssr: false
});
interface ChildRelation {
  child_id: number;
}

interface Goal {
  id: number;
  title: string;
  created: string;
  finished: string | null;
  goalRelationsByParentId: ChildRelation[];
}

interface UserGoal {
  goal: Goal;
}

interface GoalRelation {
  child_id: number;
}

interface GetRootGoalsResponse {
  user_goals: UserGoal[];
  goal_relations: GoalRelation[];
}

const { user } = useUserSession();

console.log('Initial user session:', user.value);
console.log('Initial user ID:', user.value?.id);

// Watch user changes
watch(user, (newUser, oldUser) => {
  console.log('User changed from:', oldUser, 'to:', newUser);
}, { immediate: true });

// Direct Hasura fetch approach
const goalsData = ref<GetRootGoalsResponse | null>(null);
const isLoading = ref(false);
const error = ref(null);

const fetchGoals = async () => {
  if (!user.value?.id) {
    console.log('No user ID available, user:', user.value);
    return;
  }

  isLoading.value = true;
  error.value = null;

  try {
    console.log('Fetching goals for user:', user.value.id);
    const response = await fetch('http://localhost:8080/v1/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': 'dev-admin-secret'
      },
      body: JSON.stringify({
        query: `
          query GetRootGoals($userId: Int!) {
            user_goals(where: { user_id: { _eq: $userId } }) {
              goal {
                id
                title
                created
                finished
                goalRelationsByParentId {
                  child_id
                }
              }
            }
            goal_relations {
              child_id
            }
          }
        `,
        variables: { userId: user.value.id }
      })
    });

    const result = await response.json();
    console.log('Raw response:', result);

    if (result.errors) {
      throw new Error(result.errors[0].message);
    }

    goalsData.value = result.data;
  } catch (err) {
    console.error('Fetch error:', err);
    error.value = err;
  } finally {
    isLoading.value = false;
  }
};

// Test function with hardcoded user ID
const fetchGoalsWithUserId = async (userId: number) => {
  isLoading.value = true;
  error.value = null;

  try {
    console.log('Testing with hardcoded user ID:', userId);

    const result = await $fetch('http://localhost:8080/v1/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': 'dev-admin-secret'
      },
      body: {
        query: `
          query GetRootGoals($userId: Int!) {
            user_goals(where: { user_id: { _eq: $userId } }) {
              goal {
                id
                title
                created
                finished
                goalRelationsByParentId {
                  child_id
                }
              }
            }
            goal_relations {
              child_id
            }
          }
        `,
        variables: { userId }
      }
    });

    console.log('Nuxt $fetch result:', result);

    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      error.value = result.errors[0].message;
    } else if (result.data) {
      console.log('Setting goals data:', result.data);
      goalsData.value = result.data;
    } else {
      console.log('No data in result');
    }
  } catch (err) {
    console.error('Nuxt $fetch error:', err);
    error.value = err;
  } finally {
    isLoading.value = false;
  }
};

const goals = computed(() => {
  const allUserGoals = goalsData.value?.user_goals || [];
  const allRelations = goalsData.value?.goal_relations || [];

  // Get set of all goal IDs that are children (have parents)
  const childGoalIds = new Set(allRelations.map(r => r.child_id));

  // Filter to only include root goals (goals that are not children)
  const result = allUserGoals
    .map(ug => ug.goal)
    .filter(goal => !childGoalIds.has(goal.id));

  console.log('All user goals:', allUserGoals);
  console.log('Child goal IDs:', Array.from(childGoalIds));
  console.log('Filtered root goals:', result);
  return result;
});

console.log('Goals data:', goalsData.value);

// Beräkna progress för varje mål
const getProgress = (goal: Goal) => {
  if (!goal.goalRelationsByParentId || goal.goalRelationsByParentId.length === 0) return null;
  return goal.goalRelationsByParentId.length;
};

// Använd goals store
const goalsStore = useGoalsStore();

// Ladda goals om de inte är laddade
onMounted(async () => {
  console.log('Component mounted, user:', user.value);
  console.log('User ID:', user.value?.id);

  if (!goalsStore.isLoaded) {
    await goalsStore.loadGoals();
  }
});

// Also watch for user changes
watch(user, (newUser) => {
  console.log('User changed:', newUser);
  if (newUser?.id && !goalsData.value) {
    fetchGoals();
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

  const userId = user.value?.id;
  if (!userId) {
    console.error("No user logged in");
    return;
  }

  try {
    console.log("Creating goal with:", { title: searchQuery.value.trim(), userId });

    // Skapa nytt mål först
    const { data: goalData, error: goalError } = await useAsyncGql('CreateGoal', {
      title: searchQuery.value.trim()
    });

    if (goalError.value) {
      throw new Error(goalError.value.message);
    }

    if (goalData.value?.insert_goals_one?.id) {
      const newGoal = goalData.value.insert_goals_one;

      // Skapa user_goals relation
      const { data: userGoalData, error: userGoalError } = await useAsyncGql('CreateUserGoal', {
        userId,
        goalId: newGoal.id
      });

      if (userGoalError.value) {
        throw new Error(userGoalError.value.message);
      }

      // Uppdatera lokal state
      goalsStore.addGoal(newGoal);

      // Uppdatera data från server
      await goalsStore.loadGoals();

      // Stäng och rensa sökning
      showSearch.value = false;
      searchQuery.value = "";
    } else {
      console.error("No goal ID in response:", goalData.value);
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
  <div v-if="user" class="max-w-4xl mx-auto p-6">
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
      v-if="isLoading"
      class="flex justify-center items-center p-12"
    >
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-gray-400 animate-spin" />
    </div>

    <div
      v-else-if="goals.length === 0"
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
  <div v-else class="max-w-4xl mx-auto p-6">
    <div class="text-center">
      <h1 class="text-3xl font-bold text-gray-300 mb-4">Du måste logga in</h1>
      <p class="text-gray-600 mb-6">För att se dina mål måste du vara inloggad.</p>
      <NuxtLink to="/login">
        <UButton>Logga in</UButton>
      </NuxtLink>
    </div>
  </div>
</template>
