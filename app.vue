<template>
  <div class="container">
    <AppealList />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAppealsStore } from '~/stores/appeals';
import type { Appeal } from '~/types/appeal';

interface ApiResponse {
  appeals: Appeal[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const store = useAppealsStore();

onMounted(async () => {
  // Проверяем, есть ли уже сохраненное состояние
  if (process.client && !localStorage.getItem('appeals-state')) {
    try {
      const response = await $fetch<ApiResponse>('/api/appeals');
      store.setAppeals(response.appeals);
    } catch (error) {
      console.error('Failed to fetch appeals:', error);
    }
  }
});
</script>

<style>
h1 {
  margin: 20px 0;
  font-size: 24px;
  font-weight: 500;
}
</style>
