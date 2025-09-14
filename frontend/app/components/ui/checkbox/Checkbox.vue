<template>
  <div class="flex items-center space-x-2">
    <input
      :id="id"
      v-model="modelValue"
      type="checkbox"
      :class="cn(
        'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        $attrs.class
      )"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
    <label
      :for="id"
      class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
      <slot />
    </label>
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Props {
  modelValue?: boolean
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  id: () => Math.random().toString(36).substr(2, 9)
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>