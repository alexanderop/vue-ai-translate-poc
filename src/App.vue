<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import LanguageSelector from './components/LanguageSelector.vue';
import ProgressBar from './components/ProgressBar.vue';

interface ProgressItem {
  file: string;
  progress: number;
}

// State
const worker = ref<Worker | null>(null);
const ready = ref<boolean | null>(null);
const disabled = ref(false);
const progressItems = ref<Map<string, ProgressItem>>(new Map());

const input = ref('I love walking my dog.');
const sourceLanguage = ref('eng_Latn');
const targetLanguage = ref('fra_Latn');
const output = ref('');

// Computed property for progress items array
const progressItemsArray = computed(() => {
  return Array.from(progressItems.value.values());
});

// Watch progress items
watch(progressItemsArray, (newItems) => {
  console.log('Progress items updated:', newItems);
}, { deep: true });


// Translation handler
const translate = () => {
  if (!worker.value) return;
  
  disabled.value = true;
  output.value = '';
  
  worker.value.postMessage({
    text: input.value,
    src_lang: sourceLanguage.value,
    tgt_lang: targetLanguage.value,
  });
};

// Worker message handler
const onMessageReceived = (e: MessageEvent) => {
  switch (e.data.status) {
    case 'initiate':
      ready.value = false;
      progressItems.value.set(e.data.file, {
        file: e.data.file,
        progress: 0
      });
      progressItems.value = new Map(progressItems.value);
      break;
    
    case 'progress':
      if (progressItems.value.has(e.data.file)) {
        progressItems.value.set(e.data.file, {
          file: e.data.file,
          progress: e.data.progress
        });
        progressItems.value = new Map(progressItems.value);
      }
      break;
    
    case 'done':
      progressItems.value.delete(e.data.file);
      progressItems.value = new Map(progressItems.value);
      break;
    
    case 'ready':
      ready.value = true;
      break;
    
    case 'update':
      output.value += e.data.output;
      break;
    
    case 'complete':
      disabled.value = false;
      break;

    case 'error':
      console.error('Translation error:', e.data.error);
      disabled.value = false;
      break;
  }
};

// Lifecycle hooks
onMounted(() => {
  worker.value = new Worker(
    new URL('./workers/translation.worker.ts', import.meta.url),
    { type: 'module' }
  );
  worker.value.addEventListener('message', onMessageReceived);
});

onUnmounted(() => {
  worker.value?.removeEventListener('message', onMessageReceived);
  worker.value?.terminate();
});
</script>

<template>
  <div class="app">
    <h1>Transformers.js</h1>
    <h2>ML-powered multilingual translation in Vue!</h2>

    <div class="container">
      <div class="language-container">
        <LanguageSelector 
          type="Source"
          v-model="sourceLanguage"
        />
        <LanguageSelector 
          type="Target"
          v-model="targetLanguage"
        />
      </div>

      <div class="textbox-container">
        <textarea 
          v-model="input"
          rows="3"
          placeholder="Enter text to translate..."
        />
        <textarea 
          v-model="output"
          rows="3"
          readonly
          placeholder="Translation will appear here..."
        />
      </div>
    </div>

    <button 
      :disabled="disabled || ready === false"
      @click="translate"
    >
      {{ ready === false ? 'Loading...' : 'Translate' }}
    </button>

    <div class="progress-bars-container">
      <label v-if="ready === false">
        Loading models... (only run once)
      </label>
      <div 
        v-for="item in progressItemsArray"
        :key="item.file"
      >
        <ProgressBar 
          :text="item.file"
          :percentage="item.progress"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.container {
  margin: 2rem 0;
}

.language-container {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1rem;
}

.textbox-container {
  display: flex;
  gap: 1rem;
}

textarea {
  flex: 1;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid rgb(var(--color-border));
  background-color: rgb(var(--color-card));
  color: rgb(var(--color-text-base));
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
}

button {
  padding: 0.5rem 2rem;
  font-size: 1.1rem;
  cursor: pointer;
  background-color: rgb(var(--color-accent));
  color: rgb(var(--color-text-base));
  border: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

button:hover:not(:disabled) {
  background-color: rgb(var(--color-card-muted));
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.progress-bars-container {
  margin-top: 2rem;
}

h1 {
  color: rgb(var(--color-text-base));
  margin-bottom: 0.5rem;
}

h2 {
  color: rgb(var(--color-card-muted));
  font-size: 1.2rem;
  font-weight: normal;
  margin-top: 0;
}
</style>


