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
  background-color: #f0f0f0;
  border-radius: 10px;
  margin: 10px 0;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #4caf50;
  transition: width 0.3s ease;
  display: flex;
  align-items: center;
  padding: 0 10px;
  color: white;
  font-size: 0.9rem;
  white-space: nowrap;
}
</style> 