<template>
  <div class="add-goal-form border rounded p-4 mb-4 bg-gray-50 dark:bg-gray-800">
    <h3 class="text-lg font-semibold mb-3 text-black dark:text-white">
      {{ parentId ? 'Lägg till undermål' : 'Lägg till nytt mål' }}
    </h3>
    
    <div v-if="errors.length > 0" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
      <ul class="list-disc pl-5">
        <li v-for="(error, index) in errors" :key="index">{{ error.message }}</li>
      </ul>
    </div>
    
    <form @submit.prevent="handleSubmit">
      <div class="mb-3">
        <label for="goalTitle" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titel *
        </label>
        <div class="flex">
          <input
            type="text"
            id="goalTitle"
            v-model="title"
            :class="[`flex-1 px-3 py-2 border`, 
              errors.some(e => e.field === 'title') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600',
              `rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-black dark:text-white`
            ]"
            placeholder="Ange målets titel"
            required
          />
          <VoiceInput 
            @result="handleVoiceResult" 
            @error="handleVoiceError"
          />
        </div>
        <p v-if="errors.some(e => e.field === 'title')" class="mt-1 text-sm text-red-600">
          {{ errors.find(e => e.field === 'title')?.message }}
        </p>
      </div>
      
      <div class="mb-3">
        <label for="imageUrl" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Bild-URL (valfritt)
        </label>
        <input
          type="url"
          id="imageUrl"
          v-model="imageUrl"
          :class="[`w-full px-3 py-2 border`, 
            errors.some(e => e.field === 'image_url') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600',
            `rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-black dark:text-white`
          ]"
          placeholder="https://example.com/bild.jpg"
        />
        <p v-if="errors.some(e => e.field === 'image_url')" class="mt-1 text-sm text-red-600">
          {{ errors.find(e => e.field === 'image_url')?.message }}
        </p>
      </div>
      
      <div class="mb-4">
        <label for="iconUrl" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Ikon-URL (valfritt)
        </label>
        <input
          type="url"
          id="iconUrl"
          v-model="iconUrl"
          :class="[`w-full px-3 py-2 border`, 
            errors.some(e => e.field === 'icon_url') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600',
            `rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-black dark:text-white`
          ]"
          placeholder="https://example.com/ikon.png"
        />
        <p v-if="errors.some(e => e.field === 'icon_url')" class="mt-1 text-sm text-red-600">
          {{ errors.find(e => e.field === 'icon_url')?.message }}
        </p>
      </div>
      
      <button
        type="submit"
        :disabled="isSubmitting"
        :class="[`px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`, 
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        ]"
      >
        {{ isSubmitting ? 'Lägger till...' : parentId ? 'Lägg till undermål' : 'Lägg till mål' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Goal } from '~/types/goal-entity';
import { GoalValidator, ValidationError } from '~/server/utils/goalValidator';
import VoiceInput from './VoiceInput.vue';

interface AddGoalFormProps {
  parentId?: string;
}

const props = defineProps<AddGoalFormProps>();
const emit = defineEmits(['add-goal']);

const title = ref('');
const imageUrl = ref('');
const iconUrl = ref('');
const isSubmitting = ref(false);
const errors = ref<ValidationError[]>([]);

const handleSubmit = () => {
  // e.preventDefault(); // Handled by @submit.prevent
  
  const goalData = {
    title: title.value.trim(),
    image_url: imageUrl.value.trim() || undefined,
    icon_url: iconUrl.value.trim() || undefined
  };
  
  const validationErrors = GoalValidator.validateGoalForCreation(goalData);
  
  if (validationErrors.length > 0) {
    errors.value = validationErrors;
    return;
  }
  
  errors.value = [];
  isSubmitting.value = true;
  
  emit('add-goal', goalData);
  
  // Reset form
  title.value = '';
  imageUrl.value = '';
  iconUrl.value = '';
  isSubmitting.value = false;
};

const handleVoiceResult = (text: string) => {
  title.value = text;
};

const handleVoiceError = (error: string) => {
  console.error('Voice input error:', error);
  errors.value = [{ field: 'voice', message: error }];
};
</script>
