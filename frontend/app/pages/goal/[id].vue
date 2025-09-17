<template>
  <img :src="goalImage" class="h-48 w-full object-cover" alt="" />
  <div class="-mt-5 flex items-center justify-center gap-x-6">
    <a
      href="#"
      class="rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
      >{{ goal.title }}</a
    >
  </div>
  <div v-for="child in children">{{ child.title }}</div>
</template>

<script setup lang="ts">
let goal = {
  title: "Hogwarts",
};
let children = [{ title: "Quiddichplan" }];
let parents = [{ title: "Resor" }];
let goalImage =
  "https://t3.ftcdn.net/jpg/03/26/22/48/360_F_326224870_vB8XRJbWr0qDG5bhAomLjVlKzcUXPdKA.jpg";
</script>

<style scoped></style>
