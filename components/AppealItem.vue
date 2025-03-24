<template>
  <tr 
    class="appeal-row"
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
    <!-- Number -->
    <td class="number-cell">
      <div class="handle-wrapper">
        <span class="drag-handle">☰</span>
        {{ getDisplayNumber() }}
      </div>
    </td>
    
    <!-- Name -->
    <td class="name-cell">
      <div class="appeal-name" :style="{ paddingLeft: `${level * 24}px` }">
        <span class="icon">
          <svg v-if="hasChildren" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 20C3.45 20 2.97917 19.8042 2.5875 19.4125C2.19583 19.0208 2 18.55 2 18V6C2 5.45 2.19583 4.97917 2.5875 4.5875C2.97917 4.19583 3.45 4 4 4H10L12 6H20C20.55 6 21.0208 6.19583 21.4125 6.5875C21.8042 6.97917 22 7.45 22 8V18C22 18.55 21.8042 19.0208 21.4125 19.4125C21.0208 19.8042 20.55 20 20 20H4Z" fill="currentColor"/>
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z" fill="currentColor"/>
          </svg>
        </span>
        {{ appeal.title }}
      </div>
    </td>
    
    <!-- Order -->
    <td class="order-cell">{{ appeal.order }}</td>
    
    <!-- Subcategories -->
    <td class="subcategories-cell">
      <div v-if="hasChildren" class="subcategories">
        {{ childrenTitles }}
      </div>
      <div v-else>-</div>
    </td>
    
    <!-- Actions -->
    <td class="actions-cell">
      <div class="actions">
        <div class="action-controls">
          <span v-if="hasChildren" class="folder-toggle" @click="toggleExpand">
            <svg v-if="isExpanded" class="folder-icon" width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5L9 1" stroke="#E5EDFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else class="folder-icon" width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5L1 9" stroke="#E5EDFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <button class="actions-button" @click="toggleActionMenu">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="currentColor"/>
            </svg>
          </button>
        </div>
        <div v-if="showActionMenu" class="actions-menu">
          <div class="action-item" @click="addFolder">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6h-8l-2-2H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-1 8h-3v3h-2v-3h-3v-2h3V9h2v3h3v2z" fill="currentColor"/>
            </svg>
            Add Folder
          </div>
          <div class="action-item" @click="addFile">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm-2 12h-2v2h2v-2zm0-10v4h2V4h-2zm-4 14h8v-2h-8v2zm0-4h2v-2H8v2zm0-4h8V8H8v2z" fill="currentColor"/>
            </svg>
            Add File
          </div>
          <div class="action-item" @click="editAppeal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" fill="currentColor"/>
            </svg>
            Edit
          </div>
          <div class="action-item" @click="removeAppeal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="currentColor"/>
            </svg>
            Delete
          </div>
        </div>
      </div>
    </td>
  </tr>
  
  <!-- Child items in table -->
  <template v-if="isExpanded && appeal.children && appeal.children.length > 0">
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
</template>

<script setup lang="ts">
import type { Appeal, DragState } from '~/types/appeal';
import { computed, ref } from 'vue';

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

// State and nesting level
const level = computed(() => props.level || 0);
const showActionMenu = ref(false);

// Track folder expanded/collapsed state
const isExpanded = ref(true);

// Toggle folder expanded/collapsed state
function toggleExpand() {
  isExpanded.value = !isExpanded.value;
}

// Computed properties for display
const hasChildren = computed(() => 
  props.appeal.children && props.appeal.children.length > 0
);

const childrenTitles = computed(() => 
  hasChildren.value 
    ? props.appeal.children!.map(child => child.title).join(' / ')
    : ''
);

// Format item number (like 2.1, 2.2 etc.)
function getDisplayNumber() {
  // If item has no parent, use the order number
  if (!props.appeal.parentId) {
    return props.appeal.order;
  }

  // If it has a parent, format as 2.1, 2.2, where first digit is parent number
  return `${props.level}.${props.appeal.order}`;
}

// Methods for action menu
function toggleActionMenu() {
  showActionMenu.value = !showActionMenu.value;
}

function editAppeal() {
  // Logic for editing will go here
  showActionMenu.value = false;
}

function removeAppeal() {
  // Logic for removal will go here
  showActionMenu.value = false;
}

function addFolder() {
  // Logic for adding a new folder as a child
  showActionMenu.value = false;
  console.log('Adding new folder to', props.appeal.title);
}

function addFile() {
  // Logic for adding a new file
  showActionMenu.value = false;
  console.log('Adding new file to', props.appeal.title);
}

// Drag-and-drop states
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

// Methods for drag-and-drop
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
  
  // Determine insertion position based on mouse position
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
/* Main styles for table rows */
.appeal-row {
  position: relative;
  font-size: 14px;
  transition: background-color 0.2s;
  color: #ffffff;
}

.appeal-row:hover {
  background-color: #232736;
}

/* Table cells */
.appeal-row td {
  padding: 12px 16px;
  border-bottom: 1px solid #3d4559;
  vertical-align: middle;
}

/* Number cell */
.number-cell {
  width: 60px;
  white-space: nowrap;
  color: #888888;
  font-size: 13px;
}

.handle-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Name cell */
.name-cell {
  min-width: 300px;
  max-width: 40%;
}

.appeal-name {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Folder toggle */
.folder-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  cursor: pointer;
  margin-left: 8px;
  background-color: #725DF8;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.folder-toggle:hover {
  background-color: #6351de;
}

.folder-icon {
  transition: transform 0.2s;
}

/* Order cell */
.order-cell {
  width: 80px;
  color: #888888;
  text-align: center;
}

/* Subcategories cell */
.subcategories-cell {
  width: 250px;
  max-width: 30%;
}

.subcategories {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #888888;
  font-size: 13px;
}

/* Actions cell */
.actions-cell {
  width: 50px;
  text-align: right;
}

.actions {
  position: relative;
}

.action-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.actions-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background-color: transparent;
  border: none;
  border-radius: 4px;
  color: #888888;
  cursor: pointer;
}

.actions-button:hover {
  background-color: #3d4559;
  color: #ffffff;
}

.actions-menu {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 10;
  background-color: #252525;
  border: 1px solid #333333;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  width: 160px;
  overflow: hidden;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-item:hover {
  background-color: #333333;
}

.action-item svg {
  opacity: 0.8;
}

/* Drag handle */
.drag-handle {
  cursor: grab;
  color: #888888;
  user-select: none;
  display: inline-flex;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.15s;
}

.drag-handle:hover {
  background-color: #333333;
  color: #ffffff;
}

/* Drag states */
.is-dragging {
  z-index: 10;
  opacity: 0.7;
}

/* Improved position indicators */
.drag-over-before::before,
.drag-over-after::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: #4a6dd8;
  border-radius: 2px;
  z-index: 5;
}

.drag-over-before::before {
  top: 0;
}

.drag-over-after::after {
  bottom: 0;
}

.drag-over-inside {
  background-color: #252525;
}

/* Responsive styles */
@media (max-width: 1024px) {
  .appeal-row td {
    padding: 8px 12px;
  }
  
  .appeal-name {
    font-size: 13px;
  }
}
</style>
