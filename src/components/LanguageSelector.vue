<script setup lang="ts">
import { LANGUAGES } from '../constants';

interface Props {
  type: string;
  modelValue: string;
}

defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const onChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  emit('update:modelValue', target.value);
};
</script>

<template>
  <div class="language-selector">
    <label>{{ type }}: </label>
    <select :value="modelValue" @change="onChange">
      <option v-for="[key, value] in Object.entries(LANGUAGES)" 
              :key="key" 
              :value="value">
        {{ key }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.language-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

label {
  color: rgb(var(--color-text-base));
}

select {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid rgb(var(--color-border));
  background-color: rgb(var(--color-card));
  color: rgb(var(--color-text-base));
  min-width: 200px;
  cursor: pointer;
  transition: border-color 0.25s, background-color 0.25s;
}

select:hover {
  border-color: rgb(var(--color-accent));
  background-color: rgb(var(--color-card-muted));
}

select:focus {
  outline: none;
  border-color: rgb(var(--color-accent));
  box-shadow: 0 0 0 2px rgba(var(--color-accent), 0.2);
}
</style> 