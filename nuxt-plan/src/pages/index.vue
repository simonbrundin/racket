<template>
  <div class="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white grid grid-rows-[20px_1fr_20px] items-center justify-items-center p-8 pb-20 gap-16 sm:p-20">
    <main class="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
      <a href="https://www.notion.so/simonbrundin/Livsappen-5ab9b84ddbdc4ce5977261847d855974?pvs=4" class="text-blue-600 dark:text-blue-400 hover:underline">
        Notion
      </a>
      <h1 class="text-4xl sm:text-6xl font-bold tracking-[-.02em]">
        Planeringsapp
      </h1>
      <h2 class="text-black dark:text-white">Det här behöver vi lösa innan vi kör igång:</h2>
      <TodoList />
    </main>
  </div>
</template>

<script setup lang="ts">
import TodoList from '@/components/todoList.vue'
</script>