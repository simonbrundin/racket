<template>
  <slot />
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useColorMode } from '@nuxtjs/color-mode';

const props = defineProps({
  attribute: { type: String, default: 'class' }, // Assuming 'class' is the only relevant one for now
  defaultTheme: { type: String, default: 'system' },
  enableSystem: { type: Boolean, default: false },
  disableTransitionOnChange: { type: Boolean, default: false },
});

const colorMode = useColorMode();

onMounted(() => {
  // Set initial theme based on defaultTheme and enableSystem prop
  // useColorMode typically handles 'system' automatically based on enableSystem
  if (!colorMode.value) {
    colorMode.preference = props.defaultTheme as 'light' | 'dark' | 'system';
  }

  // Handle disableTransitionOnChange
  if (props.disableTransitionOnChange) {
    // Add a temporary class to disable transitions, then remove it after a short delay
    const documentHtml = document.documentElement;
    documentHtml.classList.add('no-transition'); // Define this class in your CSS
    setTimeout(() => {
      documentHtml.classList.remove('no-transition');
    }, 0); // Execute after next repaint
  }
});

// Watch for changes in colorMode.preference and apply/remove class if needed
// This is automatically handled by @nuxtjs/color-mode module when attribute is 'class'
// No need for manual watch here unless custom logic is required beyond the module's defaults.

// We can expose a method to manually set the theme if needed for a theme switcher component
// defineExpose({
//   setTheme: (newTheme: 'light' | 'dark' | 'system') => { colorMode.preference = newTheme; }
// });
</script>

<style>
/* Example CSS for no-transition class, add this to your main.css */
.no-transition * {
  transition: none !important;
}
</style>
