<script setup lang="ts">
const { user } = useUserSession();
</script>

<template>
  <div>
    <h1>Hej {{ user.id }}</h1>
    <NuxtLink to="/login">Login</NuxtLink>
  </div>
</template>
