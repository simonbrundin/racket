<template>
  <input
    :id="id"
    type="checkbox"
    :checked="checked"
    @change="$emit('update:checked', ($event.target as HTMLInputElement).checked)"
    :class="cn(
      'peer border-input dark:bg-input/30 data-[state=checked]:bg-green-500 data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
      props.class
    )"
    v-bind="$attrs"
  />
  <!-- Check Icon (simplified for now as inline SVG or replaced by a Vue equivalent) -->
  <svg 
    v-if="checked" 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="4" 
    stroke-linecap="round" 
    stroke-linejoin="round" 
    class="lucide lucide-check size-3.5 absolute pointer-events-none"
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
</template>

<script setup lang="ts">
import { cn } from '~/utils/cn';

interface CheckboxProps {
  id: string;
  checked: boolean;
  class?: string;
}

const props = defineProps<CheckboxProps>();
const emit = defineEmits(['update:checked']);
</script>

<style scoped>
/* For the checkmark to appear inside the checkbox */
input[type="checkbox"] {
  appearance: none;
  -webkit-appearance: none;
  @apply flex-shrink-0;
}

input[type="checkbox"]:checked {
  @apply flex items-center justify-center;
}

/* Manual positioning for the check icon */
input[type="checkbox"] + svg {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
