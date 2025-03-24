<template>
  <div class="appeal-list">
    <div class="controls">
      <button @click="store.undo()" :disabled="!canUndo">Отменить</button>
      <button @click="store.redo()" :disabled="!canRedo">Повторить</button>
    </div>
    <div class="appeals-container">
      <AppealItem
        v-for="appeal in appeals"
        :key="appeal.id"
        :appeal="appeal"
        :drag-state="dragState"
        @dragstart="handleDragStart"
        @dragend="handleDragEnd"
        @dragover="handleDragOver"
        @drop="handleDrop"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Appeal, DragState } from '~/types/appeal';
import { useAppealsStore } from '~/stores/appeals';

const store = useAppealsStore();
const appeals = computed(() => store.appeals);
const canUndo = computed(() => store.history.past.length > 0);
const canRedo = computed(() => store.history.future.length > 0);

const dragState = ref<DragState>({
  isDragging: false,
  draggedAppeal: null,
  dragOverAppeal: null,
  dragPosition: null
});

const handleDragStart = (appeal: Appeal) => {
  dragState.value.isDragging = true;
  dragState.value.draggedAppeal = appeal;
};

const handleDragEnd = () => {
  dragState.value = {
    isDragging: false,
    draggedAppeal: null,
    dragOverAppeal: null,
    dragPosition: null
  };
};

const handleDragOver = (appeal: Appeal, position: 'before' | 'after' | 'inside') => {
  if (dragState.value.draggedAppeal?.id === appeal.id) return;
  
  dragState.value.dragOverAppeal = appeal;
  dragState.value.dragPosition = position;
};

const handleDrop = (targetAppeal: Appeal, position: 'before' | 'after' | 'inside') => {
  if (!dragState.value.draggedAppeal) return;
  
  store.moveAppeal(
    dragState.value.draggedAppeal,
    targetAppeal,
    position
  );
  
  handleDragEnd();
};
</script>

<style scoped>
.appeal-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.controls {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.controls button {
  padding: 8px 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.controls button:not(:disabled):hover {
  background: #f0f0f0;
}

.appeals-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
        :drag-state="dragState"
        @dragstart="handleDragStart"
        @dragend="handleDragEnd"
        @dragover="handleDragOver"
        @drop="handleDrop"
      />
    &lt;/div>
  &lt;/div>
&lt;/template>

&lt;script setup lang="ts">
import { ref, computed } from 'vue';
import type { Appeal, DragState } from '~/types/appeal';
import { useAppealsStore } from '~/stores/appeals';

const store = useAppealsStore();
const appeals = computed(() => store.appeals);
const canUndo = computed(() => store.history.past.length > 0);
const canRedo = computed(() => store.history.future.length > 0);

const dragState = ref&lt;DragState>({
  isDragging: false,
  draggedAppeal: null,
  dragOverAppeal: null,
  dragPosition: null
});

const handleDragStart = (appeal: Appeal) => {
  dragState.value.isDragging = true;
  dragState.value.draggedAppeal = appeal;
};

const handleDragEnd = () => {
  dragState.value = {
    isDragging: false,
    draggedAppeal: null,
    dragOverAppeal: null,
    dragPosition: null
  };
};

const handleDragOver = (appeal: Appeal, position: 'before' | 'after' | 'inside') => {
  if (dragState.value.draggedAppeal?.id === appeal.id) return;
  
  dragState.value.dragOverAppeal = appeal;
  dragState.value.dragPosition = position;
};

const handleDrop = (targetAppeal: Appeal, position: 'before' | 'after' | 'inside') => {
  if (!dragState.value.draggedAppeal) return;
  
  store.moveAppeal(
    dragState.value.draggedAppeal,
    targetAppeal,
    position
  );
  
  handleDragEnd();
};
&lt;/script>

&lt;style scoped>
.appeal-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.controls {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.controls button {
  padding: 8px 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.controls button:not(:disabled):hover {
  background: #f0f0f0;
}

.appeals-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
&lt;/style>
