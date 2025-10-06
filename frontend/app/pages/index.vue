<script setup lang="ts">
const { user } = useUserSession();
</script>

<template>
  <div class="max-w-2xl mx-auto p-6">
    <div v-if="!user" class="flex items-center justify-center min-h-[50vh]">
      <NuxtLink to="/login">
        <UButton icon="solar:login-2-line-duotone" size="lg">
          Logga in
        </UButton>
      </NuxtLink>
    </div>
    <div v-else class="flex items-center justify-center min-h-[50vh]">
      <NuxtLink to="/root-goals">
        <UButton size="lg"> Grundmål </UButton>
      </NuxtLink>
    </div>
  </div>
</template>
