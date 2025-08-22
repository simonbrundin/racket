<template>
  <ThemeProvider
    attribute="class"
    defaultTheme="system"
    :enableSystem="true"
    :disableTransitionOnChange="true"
  >
    <div class="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
      <header class="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div class="container mx-auto px-4 py-4">
          <nav class="flex space-x-6">
            <NuxtLink to="/" class="text-xl font-bold text-black dark:text-white">
              Planeringsapp
            </NuxtLink>
            <NuxtLink to="/" class="text-black dark:text-white hover:underline">
              Todo
            </NuxtLink>
            <NuxtLink to="/goals" class="text-black dark:text-white hover:underline">
              Mål
            </NuxtLink>
          </nav>
        </div>
      </header>
      
      <main class="container mx-auto px-4 py-8">
        <slot />
      </main>
    </div>
  </ThemeProvider>
</template>

<script setup lang="ts">
import ThemeProvider from '@/components/theme-provider.vue';
</script>