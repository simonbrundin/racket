<template>
  <label 
    :for="forId" 
    :class="cn(
      'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
      props.class
    )"
    v-bind="$attrs"
  >
    <slot />
  </label>
</template>

<script setup lang="ts">
import { cn } from '~/utils/cn';

interface LabelProps {
  forId?: string;
  class?: string;
}

const props = defineProps<LabelProps>();
</script>
