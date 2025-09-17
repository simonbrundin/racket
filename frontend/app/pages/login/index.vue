<script setup>
const { loggedIn, user, session, fetch, clear, openInPopup } = useUserSession();
</script>

<template>
  <div v-if="loggedIn">
    <h1>Welcome {{ user.id }}!</h1>
    <p>Logged in since {{ session.loggedInAt }}</p>
    <button @click="clear">Logout</button>
    <NuxtLink to="/">
      <button>Hem</button>
    </NuxtLink>
  </div>
  <div v-else>
    <h1>Not logged in</h1>
    <a href="/auth/authentik">Login with Authentik</a>
    <!-- or open the OAuth route in a popup -->
    <button @click="openInPopup('/auth/authentik')">Logga in</button>
  </div>
</template>
<style scoped></style>
