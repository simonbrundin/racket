<script setup lang="ts">
const { user } = useUserSession();

const { data: goalsData } = await useAsyncGql('GetUserGoals');

const goals = computed(() => goalsData.value?.user_goals?.map(ug => ug.goal) || []);
</script>

<template>
  <div class="max-w-2xl mx-auto p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-300 mb-2" v-if="user">
        Inloggad
      </h1>
      <h1 class="text-3xl font-bold text-gray-300 mb-2" v-else>Utloggad</h1>
      <p class="text-gray-600">Hantera dina uppgifter enkelt och effektivt.</p>
      <div class="mt-4">
        <NuxtLink
          to="/login"
          class="text-blue-600 hover:text-blue-800 underline"
        >
          <UButton icon="solar:login-2-line-duotone"> Login</UButton>
        </NuxtLink>
      </div>
    </div>

    <div v-if="user" class="mt-8">
      <h2 class="text-2xl font-semibold text-gray-300 mb-4">Dina mål</h2>

      <div v-if="goals.length === 0" class="text-gray-500 p-4 border border-gray-700 rounded-lg">
        Du har inga mål ännu. Skapa ditt första mål för att komma igång!
      </div>

      <ul v-else class="space-y-3">
        <li
          v-for="goal in goals"
          :key="goal.id"
          class="p-4 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="text-lg font-medium text-gray-200">{{ goal.title }}</h3>
              <p class="text-sm text-gray-500 mt-1">
                Skapad: {{ new Date(goal.created).toLocaleDateString('sv-SE') }}
              </p>
            </div>
            <span
              v-if="goal.finished"
              class="px-2 py-1 text-xs font-semibold rounded bg-green-900 text-green-200"
            >
              Klar
            </span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
