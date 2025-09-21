<script setup lang="ts">
interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

const { user } = useUserSession();

const todos = ref<Todo[]>([]);

const addTodo = (text: string) => {
  const newTodo: Todo = {
    id: Date.now().toString(),
    text,
    completed: false,
  };
  todos.value.push(newTodo);
};

const toggleTodo = (id: string) => {
  const todo = todos.value.find((t) => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
  }
};

const deleteTodo = (id: string) => {
  const index = todos.value.findIndex((t) => t.id === id);
  if (index > -1) {
    todos.value.splice(index, 1);
  }
};
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

    <div class="bg-gray-50 rounded-xl p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Mina Todos</h2>

      <TodoInput @add="addTodo" />

      <TodoList :todos="todos" @toggle="toggleTodo" @delete="deleteTodo" />
    </div>
  </div>
</template>
