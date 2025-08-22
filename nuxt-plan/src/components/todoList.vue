<template>
  <div>
    <div class="mb-4">
      <div class="flex justify-between items-center mb-1">
        <span class="text-sm font-medium">
          Framsteg: {{ progressPercentage }}%
        </span>
        <span class="text-sm text-gray-500">
          {{ completedCount }}/{{ totalCount }} uppgifter
        </span>
      </div>
      <div class="h-2 bg-gray-200 rounded-full">
        <div
          class="h-full bg-green-500 rounded-full"
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>
    </div>

    <div class="flex justify-between mb-4">
      <div class="flex space-x-2">
        <Button
          :variant="filter === 'all' ? 'default' : 'outline'"
          @click="setFilter('all')"
        >
          Alla
        </Button>
        <Button
          :variant="filter === 'active' ? 'default' : 'outline'"
          @click="setFilter('active')"
        >
          Aktiva
        </Button>
        <Button
          :variant="filter === 'completed' ? 'default' : 'outline'"
          @click="setFilter('completed')"
        >
          Klara
        </Button>
      </div>

      <div class="flex space-x-2">
        <Button
          :variant="sort === 'date' ? 'default' : 'outline'"
          @click="setSort('date')"
        >
          Datum
        </Button>
        <Button
          :variant="sort === 'assigned' ? 'default' : 'outline'"
          @click="setSort('assigned')"
        >
          Tilldelad
        </Button>
        <Button
          :variant="sort === 'deadline' ? 'default' : 'outline'"
          @click="setSort('deadline')"
        >
          Deadline
        </Button>
      </div>
    </div>

    <draggable
      v-model="topLevelTodosSortable"
      tag="div"
      class="flex flex-col items-start space-y-2 mb-4"
      item-key="id"
      @end="handleDragEnd"
    >
      <template #item="{ element: todo, index }">
        <div v-if="editingId === todo.id" class="flex flex-col p-2 rounded w-full bg-gray-100 dark:bg-gray-800 mb-2">
          <div class="flex flex-col space-y-2">
            <Input
              type="text"
              v-model="editText"
              class="mb-2"
            />
            <div class="flex space-x-2">
              <Input
                type="text"
                placeholder="Tilldelad"
                v-model="editAssignedTo"
                class="flex-1"
              />
              <Input
                type="date"
                v-model="editDeadline"
                class="flex-1"
              />
            </div>
            <div class="flex space-x-2">
              <Button
                @click="() => {
                  setTodos(todos.map((t) =>
                    t.id === todo.id
                      ? {
                          ...t,
                          text: editText,
                          assignedTo:
                            editAssignedTo.trim() || undefined,
                          deadline:
                            editDeadline.trim() || undefined,
                        }
                      : t,
                  ));
                  editingId = null;
                }"
              >
                Spara
              </Button>
              <Button
                variant="outline"
                @click="editingId = null"
              >
                Avbryt
              </Button>
            </div>
          </div>
        </div>
        <SortableItem
          v-else
          :id="todo.id"
          :todo="todo"
          :selected-index="selectedIndex"
          :index="index"
          @toggle-todo="handleToggleTodo"
          @set-selected-index="setSelectedIndex"
          :todos="todos"
        />
      </template>
    </draggable>
    <form
      @submit.prevent="handleAddTodo"
      class="flex flex-col w-full max-w-md space-y-2"
    >
      <div class="flex space-x-2">
        <Input
          ref="inputRef"
          type="text"
          placeholder="Ny uppgift..."
          v-model="newTodoText"
          class="flex-1"
        />
        <Button type="submit">Lägg till</Button>
      </div>
      <div class="flex space-x-2">
        <Input
          type="text"
          placeholder="Tilldelad (valfritt)"
          v-model="newAssignedTo"
          class="flex-1"
        />
        <Input
          type="date"
          v-model="newDeadline"
          class="flex-1"
        />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import draggable from 'vue-draggable-plus'; // Import draggable component
import type { Todo } from '~/types/todo-entity';
import Button from '@/components/ui/button.vue';
import Checkbox from '@/components/ui/checkbox.vue';
import Input from '@/components/ui/input.vue';
import Label from '@/components/ui/label.vue';
import SortableItem from '@/components/SortableItem.vue';

const todos = ref<Todo[]>(
  [
    {
      id: "todo11",
      text: "Är den här avcheckad så fungerar allt",
      completed: true,
      childIds: [],
      parentIds: [],
    },
    {
      id: "todo0",
      text: "Går att bygga image via DOCKERFILE",
      completed: true,
      childIds: [],
      parentIds: [],
    },
  ]
);

const selectedIndex = ref<number | null>(null);
const newTodoText = ref("");
const newAssignedTo = ref("");
const newDeadline = ref("");
const editText = ref("");
const editAssignedTo = ref("");
const editDeadline = ref("");
const editingId = ref<string | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);

const handleDeleteTodo = () => {
  if (selectedIndex.value === null) return;
  const todoToDelete = todos.value[selectedIndex.value];
  const newTodos = todos.value.filter(
    (todo) =>
      todo.id !== todoToDelete.id && !todoToDelete.childIds.includes(todo.id),
  );
  todos.value = newTodos;
  if (newTodos.length === 0) {
    selectedIndex.value = null;
  } else if (selectedIndex.value >= newTodos.length) {
    selectedIndex.value = newTodos.length - 1;
  }
};

const handleToggleTodo = (id: string) => {
  const newTodos = [...todos.value];
  const todo = newTodos.find((t) => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    const toggleChildren = (childIds: string[]) => {
      childIds.forEach((childId) => {
        const child = newTodos.find((t) => t.id === childId);
        if (child) {
          child.completed = todo.completed;
          toggleChildren(child.childIds);
        }
      });
    };
    toggleChildren(todo.childIds);
  }
  todos.value = newTodos;
};

const moveTodo = (direction: number) => {
  if (selectedIndex.value === null) return;
  const newIndex = selectedIndex.value + direction;
  if (newIndex < 0 || newIndex >= todos.value.length) return;

  const newTodos = Array.from(todos.value);
  const [movedTodo] = newTodos.splice(selectedIndex.value, 1);
  newTodos.splice(newIndex, 0, movedTodo);
  todos.value = newTodos;
  selectedIndex.value = newIndex;
};

const handleDragEnd = (event: { newIndex: number, oldIndex: number }) => {
  const { newIndex, oldIndex } = event;

  if (newIndex === oldIndex) return;

  const movedTodo = topLevelTodosSortable.value[oldIndex];
  const targetTodo = topLevelTodosSortable.value[newIndex];

  // Find the actual index of these todos in the main `todos` array
  const oldActualIndex = todos.value.findIndex(t => t.id === movedTodo.id);
  const newActualIndex = todos.value.findIndex(t => t.id === targetTodo.id);

  // Temporarily adjust `todos` array to reflect the new order without changing parent/child relationships yet
  const reorderedMainTodos = [...todos.value];
  const [removed] = reorderedMainTodos.splice(oldActualIndex, 1);
  reorderedMainTodos.splice(newActualIndex, 0, removed);

  // Update parent/child relationships based on the new visual order
  // This part is simplified and might need more complex logic for nested DND
  // For now, assume reordering only affects top-level todos visually.
  // A more robust solution would involve finding the new parent or sibling if dropped on another item.
  
  todos.value = reorderedMainTodos;
};

onMounted(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (editingId.value) {
      return;
    }

    if (e.key === "Escape") {
      if (document.activeElement === inputRef.value) {
        inputRef.value?.blur();
      }
    }

    if (document.activeElement instanceof HTMLInputElement) {
      return;
    }

    if (e.key === "i") {
      e.preventDefault();
      inputRef.value?.focus();
      return;
    }

    if (selectedIndex.value === null) {
      if (e.key === "j" || e.key === "k") {
        selectedIndex.value = 0;
      }
      return;
    }

    switch (e.key) {
      case "j":
        selectedIndex.value = Math.min(todos.value.length - 1, (selectedIndex.value === null ? 0 : selectedIndex.value) + 1);
        break;
      case "k":
        selectedIndex.value = Math.max(0, (selectedIndex.value === null ? 0 : selectedIndex.value) - 1);
        break;
      case "w":
        moveTodo(-1);
        break;
      case "s":
        moveTodo(1);
        break;
      case "g":
        selectedIndex.value = 0;
        break;
      case "G":
        selectedIndex.value = todos.value.length - 1;
        break;
      case "x":
        handleDeleteTodo();
        break;
      case "I":
        if (selectedIndex.value !== null) {
          const parentTodo = todos.value[selectedIndex.value];
          const newSubtask: Todo = {
            id: `todo-${Date.now()}`,
            text: "New Subtask",
            completed: false,
            childIds: [],
            parentIds: [parentTodo.id],
          };
          todos.value = [
            ...todos.value.map((todo) =>
              todo.id === parentTodo.id
                ? { ...todo, childIds: [...todo.childIds, newSubtask.id] }
                : todo,
            ),
            newSubtask,
          ];
        }
        break;
      case " ":
        e.preventDefault();
        if (selectedIndex.value !== null) {
          handleToggleTodo(todos.value[selectedIndex.value].id);
        }
        break;
      case "e":
        if (selectedIndex.value !== null) {
          const todo = todos.value[selectedIndex.value];
          editText.value = todo.text;
          editAssignedTo.value = todo.assignedTo || "";
          editDeadline.value = todo.deadline || "";
          editingId.value = todo.id;
        }
        break;
    }
  };

  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  // No specific cleanup for addEventListener if it's set globally in onMounted and auto-removed by Vue
});

const handleAddTodo = () => {
  if (newTodoText.value.trim() === "") return;
  const newTodo: Todo = {
    id: `todo-${Date.now()}`,
    text: newTodoText.value,
    completed: false,
    childIds: [],
    parentIds: [],
    assignedTo: newAssignedTo.value.trim() ? newAssignedTo.value : undefined,
    deadline: newDeadline.value.trim() ? newDeadline.value : undefined,
  };
  todos.value = [...todos.value, newTodo];
  newTodoText.value = "";
  newAssignedTo.value = "";
  newDeadline.value = "";
};

const topLevelTodosSortable = computed<Todo[]>({ // Use a writable computed for v-model with draggable
  get: () => todos.value.filter((todo) => todo.parentIds.length === 0),
  set: (newValue: Todo[]) => {
    // This setter is called by vue-draggable-plus after a drag operation.
    // We need to reorder the main `todos.value` array to reflect the new order of top-level items.
    // This is a simplified reordering for top-level only.

    const oldOrderTopLevelIds = topLevelTodosSortable.value.map(t => t.id);
    const newOrderTopLevelIds = newValue.map(t => t.id);

    // Create a map for quick lookup of goals by ID
    const todoMap = new Map<string, Todo>();
    todos.value.forEach(todo => todoMap.set(todo.id, todo));

    // Reconstruct the main todos array ensuring order of top-level items and keeping children associated
    let reorderedTodos: Todo[] = [];
    const processedIds = new Set<string>();

    newOrderTopLevelIds.forEach(id => {
      const todo = todoMap.get(id);
      if (todo && !processedIds.has(id)) {
        reorderedTodos.push(todo);
        processedIds.add(id);
        // Add children directly after if they belong to this parent and are not already processed
        // This part would need more sophisticated logic for complex nested sorting
        todo.childIds.forEach(childId => {
          if (todoMap.has(childId) && !processedIds.has(childId)) {
            reorderedTodos.push(todoMap.get(childId)!);
            processedIds.add(childId);
          }
        });
      }
    });
    
    // Add any remaining todos that were not top-level or children of reordered top-level items
    // This is a fallback and might need refinement for full nested drag-and-drop hierarchy.
    todos.value.forEach(todo => {
      if (!processedIds.has(todo.id)) {
        reorderedTodos.push(todo);
      }
    });

    todos.value = reorderedTodos;
  }
});

const completedCount = computed(() =>
  topLevelTodosSortable.value.filter((todo) => todo.completed).length
);

const totalCount = computed(() => topLevelTodosSortable.value.length);

const progressPercentage = computed(() =>
  totalCount.value > 0 ? Math.round((completedCount.value / totalCount.value) * 100) : 0
);

const filter = ref<"all" | "active" | "completed">("all");
const sort = ref<"date" | "assigned" | "deadline">("date");

const setFilter = (value: "all" | "active" | "completed") => {
  filter.value = value;
};

const setSort = (value: "date" | "assigned" | "deadline") => {
  sort.value = value;
};

const visibleTodos = computed(() => {
  let filtered = todos.value.filter((todo) => {
    if (filter.value === "active") return !todo.completed;
    if (filter.value === "completed") return todo.completed;
    return true;
  });

  // Sort tasks
  filtered = [...filtered].sort((a, b) => {
    if (sort.value === "assigned") {
      const aAssigned = a.assignedTo || "ZZZ";
      const bAssigned = b.assignedTo || "ZZZ";
      return aAssigned.localeCompare(bAssigned);
    }
    if (sort.value === "deadline") {
      const aDeadline = a.deadline || "9999-12-31";
      const bDeadline = b.deadline || "9999-12-31";
      return aDeadline.localeCompare(bDeadline);
    }
    // Default sort by creation date (id contains timestamp)
    return a.id.localeCompare(b.id);
  });
  return filtered;
});
</script>
