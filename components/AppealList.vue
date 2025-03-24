<template>
  <div class="app-container">
    <div class="app-header">
      <div class="app-title">
        <span>Games List</span>
        <span class="badge"> Found : {{ rootAppeals.length }}</span>
      </div>
      <div class="controls">
        <button @click="store.undo()" :disabled="!canUndo" class="control-button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" fill="currentColor"/>
          </svg>
        </button>
        <button @click="store.redo()" :disabled="!canRedo" class="control-button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>
    
    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>№</th>
            <th>Name</th>
            <th>Order</th>
            <th>Subcategories</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <template v-if="rootAppeals.length > 0">
            <AppealItem
              v-for="appeal in rootAppeals"
              :key="appeal.id"
              :appeal="appeal"
              :drag-state="dragState"
              @dragstart="handleDragStart"
              @dragend="handleDragEnd"
              @dragover="handleDragOver"
              @drop="handleDrop"
            />
          </template>
          <tr v-else>
            <td colspan="5">
              <div class="empty-state">
                <h3>No games</h3>
                <p>To get started, add a new game by clicking the button above</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="pagination">
      <div class="pagination-info">Showing {{ Math.min(10, rootAppeals.length) }} of {{ rootAppeals.length }}</div>
      <div class="pagination-controls">
        <button class="pagination-button"><span class="arrow">«</span></button>
        <button class="pagination-button active">1</button>
        <button class="pagination-button">2</button>
        <button class="pagination-button">3</button>
        <button class="pagination-button">4</button>
        <span class="pagination-ellipsis">...</span>
        <button class="pagination-button">10</button>
        <button class="pagination-button"><span class="arrow">»</span></button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Appeal, DragState } from '~/types/appeal';
import { useAppealsStore } from '~/stores/appeals';

const store = useAppealsStore();
const appeals = computed(() => store.appeals);

// Get only root-level appeals (without parent) for display in the root table
const rootAppeals = computed(() => {
  return appeals.value.filter(appeal => !appeal.parentId);
});

// Undo/redo button states
const canUndo = computed(() => store.history.past.length > 0);
const canRedo = computed(() => store.history.future.length > 0);

// Drag state management
const dragState = ref<DragState>({
  isDragging: false,
  draggedAppeal: null,
  dragOverAppeal: null,
  dragPosition: null
});

// Function to add a new game
const addNewAppeal = () => {
  // Generate unique ID for new game
  const newId = `game-${Date.now()}`;
  
  // Determine order number (last + 1 or 1 if no games)
  const maxOrder = rootAppeals.value.length > 0 
    ? Math.max(...rootAppeals.value.map(a => a.order)) 
    : 0;
  
  // Create new game
  const newAppeal: Appeal = {
    id: newId,
    title: 'New Game',
    parentId: null,
    order: maxOrder + 1,
    children: []
  };
  
  // Add to store
  store.addAppeal(newAppeal);
};

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
.app-container {
  max-width: 1656px;
  width: 100%;
  margin: 0 auto;
  padding: 20px;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.app-title {
  font-size: 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #ffffff;
}

.badge {
  background-color: #11a97d;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.controls {
  display: flex;
  gap: 8px;
}

.control-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background-color: #252525;
  border: none;
  border-radius: 4px;
  color: #aaaaaa;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}

.control-button:hover {
  background-color: #333333;
  color: #ffffff;
}

.control-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.add-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #11a97d;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0 16px;
  height: 36px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-button:hover {
  background-color: #0d8c66;
}

.table-container {
  background-color: #161A23;
  border-radius: 8px;
  overflow: auto;
  margin-bottom: 20px;
  max-height: 70vh;
  width: 100%;
}

.table {
  width: 100%;
  min-width: 900px; /* Ensures the table doesn't get too small on smaller screens */
  border-collapse: collapse;
}

.table thead {
  background-color: #1e2330;
  position: sticky;
  top: 0;
  z-index: 1;
}

.table th {
  text-align: left;
  padding: 12px 16px;
  color: #888888;
  font-weight: 500;
  border-bottom: 1px solid #333333;
  font-size: 12px;
  text-transform: uppercase;
}

.empty-state {
  padding: 40px 0;
  text-align: center;
  color: #777777;
}

.empty-state svg {
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h3 {
  color: #aaaaaa;
  margin: 8px 0;
}

.empty-state p {
  font-size: 14px;
  margin: 8px 0;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.pagination-info {
  color: #777777;
  font-size: 14px;
}

.pagination-controls {
  display: flex;
  gap: 4px;
  align-items: center;
}

.pagination-button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  background-color: #1e1e1e;
  border: 1px solid #333333;
  border-radius: 4px;
  color: #aaaaaa;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}

.pagination-button:hover {
  background-color: #252525;
  color: #ffffff;
}

.pagination-button.active {
  background-color: #252525;
  color: #ffffff;
  border-color: #4a6dd8;
}

.pagination-ellipsis {
  color: #777777;
  padding: 0 4px;
}

.arrow {
  font-size: 16px;
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
