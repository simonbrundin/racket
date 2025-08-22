<template>
  <div class="voice-input">
    <button
      type="button"
      @click="toggleListening"
      :class="cn(
        'flex items-center px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2',
        isListening 
          ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500' 
          : 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500'
      )"
      :disabled="!isSupported"
    >
      <span v-if="isListening" class="flex h-3 w-3 mr-2">
        <span class="animate-ping absolute h-3 w-3 rounded-full bg-red-400 opacity-75"></span>
        <span class="relative h-3 w-3 rounded-full bg-red-500"></span>
      </span>
      <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clip-rule="evenodd" />
      </svg>
      {{ isListening ? 'Stoppa lyssning' : 'Starta röstinmatning' }}
    </button>
    
    <div v-if="transcript" class="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
      <p class="text-sm text-gray-700 dark:text-gray-300">{{ transcript }}</p>
    </div>
    
    <div v-if="!isSupported" class="text-red-500 text-sm dark:text-red-400 mt-2">
      Röstinmatning stöds inte i din webbläsare. Använd Chrome, Edge eller Safari.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { cn } from '~/utils/cn';

interface VoiceInputProps {
  onResult: (text: string) => void;
  onError?: (error: string) => void;
  placeholder?: string;
}

const props = withDefaults(defineProps<VoiceInputProps>(), {
  placeholder: "Säg ditt mål högt...",
});

const emit = defineEmits(['result', 'error']);

const isListening = ref(false);
const transcript = ref('');
const isSupported = ref(true);
const recognition = ref<SpeechRecognition | null>(null);

onMounted(() => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    isSupported.value = false;
    if (props.onError) {
      props.onError('Web Speech API stöds inte i denna webbläsare');
    }
    emit('error', 'Web Speech API stöds inte i denna webbläsare');
    return;
  }

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  recognition.value = new SpeechRecognition();
  recognition.value.continuous = false;
  recognition.value.interimResults = true;
  recognition.value.lang = 'sv-SE';

  recognition.value.onresult = (event: SpeechRecognitionEvent) => {
    let interimTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const currentTranscript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        transcript.value = currentTranscript;
        emit('result', currentTranscript);
      } else {
        interimTranscript += currentTranscript;
      }
    }
    if (interimTranscript) {
      transcript.value = interimTranscript;
    }
  };

  recognition.value.onerror = (event: SpeechRecognitionErrorEvent) => {
    console.error('Speech recognition error', event.error);
    isListening.value = false;
    if (props.onError) {
      props.onError(`Röstinmatningsfel: ${event.error}`);
    }
    emit('error', `Röstinmatningsfel: ${event.error}`);
  };

  recognition.value.onend = () => {
    isListening.value = false;
  };
});

onUnmounted(() => {
  if (recognition.value) {
    recognition.value.stop();
  }
});

const toggleListening = () => {
  if (!isSupported.value) return;

  if (isListening.value) {
    recognition.value?.stop();
    isListening.value = false;
  } else {
    transcript.value = '';
    recognition.value?.start();
    isListening.value = true;
  }
};
</script>
