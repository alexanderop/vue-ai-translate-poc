<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { TranslationState } from '../types/translator'

// ----- State Management ----- //
const state = ref<TranslationState>({
  germanText: '',
  englishText: '',
  isLoading: false,
  modelReady: false,
  progressPercentage: 0
})

// ----- Computed Properties ----- //
const buttonText = computed((): string => {
  if (!state.value.modelReady) return 'Loading model...'
  if (state.value.isLoading) return 'Translating...'
  return 'Translate'
})

// ----- Initialize Web Worker ----- //
const worker = new Worker(new URL('../workers/translator.worker.ts', import.meta.url), {
  type: 'module'
})

// ----- Worker Message Handlers ----- //
function handleWorkerMessage(event: MessageEvent) {
  const { status, result } = event.data

  switch (status) {
    case 'progress':
      updateProgress(result)
      break
    case 'ready':
      state.value.modelReady = true
      break
    case 'translation':
      updateTranslation(result)
      break
    default:
      console.warn('Unhandled worker message', event.data)
      break
  }
}

function updateProgress(result: any): void {
  if (typeof result === 'object' && 'progress' in result) {
    state.value.progressPercentage = result.progress
  }
}

function updateTranslation(result: any): void {
  if (typeof result === 'string') {
    state.value.englishText = result
    state.value.isLoading = false
  }
}

// ----- Register Worker Event Listener ----- //
worker.addEventListener('message', handleWorkerMessage)

// ----- Translation Functionality ----- //
function translate(): void {
  const trimmedText = state.value.germanText.trim()
  if (!trimmedText) return

  state.value.isLoading = true
  worker.postMessage({
    action: 'translate',
    input: trimmedText
  })
}

// ----- Initialize Model on Component Mount ----- //
onMounted(() => {
  worker.postMessage({
    action: 'download',
    model: 'Xenova/opus-mt-de-en'
  })
})
</script>

<template>
  <div class="translator">
    <div class="translator__panel">
      <!-- German Text Panel -->
      <div class="translator__column">
        <div class="translator__language-bar">German</div>
        <textarea
          v-model="state.germanText"
          placeholder="Enter text"
          class="translator__area"
        ></textarea>
      </div>

      <!-- English Translation Panel -->
      <div class="translator__column">
        <div class="translator__language-bar">English</div>
        <textarea
          v-model="state.englishText"
          placeholder="Translation"
          readonly
          class="translator__area translator__area--readonly"
        ></textarea>
      </div>
    </div>

    <!-- Translate Button -->
    <button
      @click="translate"
      :disabled="!state.modelReady || state.isLoading"
      class="translator__button"
      :class="{ 'translator__button--disabled': !state.modelReady || state.isLoading }"
    >
      {{ buttonText }}
    </button>

    <!-- Progress Bar -->
    <div
      v-if="state.progressPercentage > 0 && state.progressPercentage < 100"
      class="translator__progress"
      :style="{ '--progress': `${state.progressPercentage}%` }"
    ></div>
  </div>
</template>

<style scoped>
.translator {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 1rem;
}

.translator__panel {
  display: flex;
  gap: 2px;
  background: var(--card);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.translator__column {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--fill);
}

.translator__language-bar {
  padding: 12px 16px;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--textMuted);
  background: var(--cardMuted);
  border-bottom: 1px solid var(--border);
}

.translator__area {
  width: 100%;
  min-height: 200px;
  padding: 16px;
  border: none;
  font-size: 1.1rem;
  line-height: 1.5;
  resize: none;
  background: transparent;
  color: var(--textBase);
  overflow-y: hidden;
}

.translator__area::placeholder {
  color: var(--textMuted);
  opacity: 0.7;
}

.translator__area:focus {
  outline: none;
}

.translator__area--readonly {
  cursor: default;
}

.translator__button {
  display: block;
  margin: 1.5rem auto;
  padding: 0.75rem 2rem;
  background-color: var(--accent);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.translator__button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.translator__button--disabled {
  background-color: var(--cardMuted);
  cursor: not-allowed;
}

.translator__progress {
  width: 100%;
  height: 3px;
  background: var(--cardMuted);
  margin-top: 1rem;
  border-radius: 1.5px;
  overflow: hidden;
}

.translator__progress::after {
  content: '';
  display: block;
  height: 100%;
  background: var(--accent);
  width: var(--progress, 0%);
  transition: width 0.3s ease;
}
</style>
