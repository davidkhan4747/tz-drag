<template>
  <div 
    class="appeal-item"
    :class="{
      'is-dragging': isDragging,
      'drag-over': isDragOver,
      'drag-over-before': isDragOverBefore,
      'drag-over-after': isDragOverAfter,
      'drag-over-inside': isDragOverInside
    }"
    draggable="true"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
    @dragover.prevent="onDragOver"
    @drop.prevent="onDrop"
  >
    <div 
      class="appeal-content"
      :style="{ marginLeft: `${level * 20}px` }"
    >
      <div class="appeal-header">
        <span class="drag-handle">☰</span>
        <span class="appeal-title">{{ appeal.title }}</span>
      </div>
    </div>

    <template v-if="appeal.children && appeal.children.length > 0">
      <AppealItem
        v-for="child in appeal.children"
        :key="child.id"
        :appeal="child"
        :level="level + 1"
        :drag-state="dragState"
        @dragstart="(appeal) => emit('dragstart', appeal)"
        @dragend="() => emit('dragend')"
        @dragover="(appeal, position) => emit('dragover', appeal, position)"
        @drop="(appeal, position) => emit('drop', appeal, position)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Appeal, DragState } from '~/types/appeal';
import { computed } from 'vue';

const props = defineProps<{
  appeal: Appeal;
  level?: number;
  dragState: DragState;
}>();

const emit = defineEmits<{
  (e: 'dragstart', appeal: Appeal): void;
  (e: 'dragend'): void;
  (e: 'dragover', appeal: Appeal, position: 'before' | 'after' | 'inside'): void;
  (e: 'drop', appeal: Appeal, position: 'before' | 'after' | 'inside'): void;
}>();

const level = computed(() => props.level || 0);

const isDragging = computed(() => 
  props.dragState.draggedAppeal?.id === props.appeal.id
);

const isDragOver = computed(() =>
  props.dragState.dragOverAppeal?.id === props.appeal.id
);

const isDragOverBefore = computed(() =>
  isDragOver.value && props.dragState.dragPosition === 'before'
);

const isDragOverAfter = computed(() =>
  isDragOver.value && props.dragState.dragPosition === 'after'
);

const isDragOverInside = computed(() =>
  isDragOver.value && props.dragState.dragPosition === 'inside'
);

const onDragStart = (event: DragEvent) => {
  emit('dragstart', props.appeal);
};

const onDragEnd = () => {
  emit('dragend');
};

const onDragOver = (event: DragEvent) => {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const mouseY = event.clientY;
  const relativeY = mouseY - rect.top;
  
  // Determine drop position based on mouse position
  if (relativeY < rect.height * 0.25) {
    emit('dragover', props.appeal, 'before');
  } else if (relativeY > rect.height * 0.75) {
    emit('dragover', props.appeal, 'after');
  } else {
    emit('dragover', props.appeal, 'inside');
  }
};

const onDrop = () => {
  if (!props.dragState.dragPosition) return;
  emit('drop', props.appeal, props.dragState.dragPosition);
};
</script>

<style scoped>
/* Основные стили */
.appeal-item {
  position: relative;
  padding: 4px 0;
}

.appeal-content {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 8px;
  margin: 4px 0;
  transition: all 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.appeal-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.drag-handle {
  cursor: grab;
  color: #666;
  user-select: none;
  padding: 4px;
  border-radius: 3px;
  transition: background-color 0.15s ease;
}

.drag-handle:hover {
  background-color: #f0f0f0;
  color: #333;
}

.appeal-title {
  font-size: 14px;
  font-weight: 500;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Стили для состояния перетаскивания */
.is-dragging {
  z-index: 10;
}

.is-dragging .appeal-content {
  opacity: 0.7;
  transform: scale(0.98);
  background: #f8f8f8;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

.drag-over .appeal-content {
  background: #f5f5f5;
}

/* Улучшенные индикаторы позиции */
.drag-over-before::before,
.drag-over-after::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 3px;
  background: #2196f3;
  border-radius: 3px;
  animation: pulse 1.5s infinite;
  z-index: 5;
}

.drag-over-before::before {
  top: 0;
}

.drag-over-after::after {
  bottom: 0;
}

.drag-over-inside .appeal-content {
  border: 2px solid #2196f3;
  background: #e3f2fd;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

/* Анимация пульсации для индикаторов */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.4);
  }
  70% {
    box-shadow: 0 0 0 5px rgba(33, 150, 243, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0);
  }
}

/* Адаптивные стили */
@media (max-width: 1024px) {
  .appeal-content {
    padding: 6px;
  }
  
  .appeal-title {
    font-size: 13px;
  }
}

@media (min-width: 1920px) {
  .appeal-content {
    padding: 10px 12px;
  }
  
  .appeal-title {
    font-size: 15px;
  }
}
</style>
