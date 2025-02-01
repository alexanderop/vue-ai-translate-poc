<script setup lang="ts">

defineProps< {
  text: string;
  percentage: number;
}>();
</script>

<template>
  <div class="progress-container">
    <div class="progress-bar" :style="{ width: `${percentage}%` }">
      {{ text }} ({{ percentage.toFixed(2) }}%)
    </div>
  </div>
</template>

<style scoped>
.progress-container {
  width: 100%;
  height: 20px;
  background-color: rgb(var(--color-card));
  border-radius: 10px;
  margin: 10px 0;
  overflow: hidden;
  border: 1px solid rgb(var(--color-border));
}

.progress-bar {
  height: 100%;
  background-color: rgb(var(--color-accent));
  transition: width 0.3s ease;
  display: flex;
  align-items: center;
  padding: 0 10px;
  color: rgb(var(--color-text-base));
  font-size: 0.9rem;
  white-space: nowrap;
}

.progress-bar:hover {
  background-color: rgb(var(--color-card-muted));
}
</style> 