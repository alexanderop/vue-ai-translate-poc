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

select {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  min-width: 200px;
}
</style> 