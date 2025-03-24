import { defineStore } from 'pinia';
import { computed, reactive, ref, onMounted, watch } from 'vue';
import type { Appeal, AppealState } from '~/types/appeal';

function ensureArray<T>(value: T[] | undefined): T[] {
  return value || [];
}

/**
 * Максимальный размер данных в localStorage (3.5MB с запасом)
 */
const MAX_STORAGE_SIZE = 3.5 * 1024 * 1024;

/**
 * Ключ для хранения данных в localStorage
 */
const STORAGE_KEY = 'appeals-state';

/**
 * Сохраняет состояние в localStorage с проверкой размера
 * @param state Состояние для сохранения
 * @returns boolean Успешно ли сохранено состояние
 */
function saveStateToLocalStorage(state: AppealState): boolean {
  if (!process.client) return false;
  
  try {
    // Проверяем размер данных перед сохранением
    const serializedState = JSON.stringify(state);
    if (serializedState.length > MAX_STORAGE_SIZE) {
      console.warn('Состояние слишком большое для сохранения в localStorage. Очищаем историю.');
      
      // Уменьшаем размер истории
      const compactState = { ...state };
      compactState.history = {
        past: [],
        future: []
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compactState));
      return false;
    }
    
    localStorage.setItem(STORAGE_KEY, serializedState);
    return true;
  } catch (e) {
    console.error('Ошибка при сохранении состояния в localStorage:', e);
    return false;
  }
}

/**
 * Загружает состояние из localStorage с обработкой ошибок
 * @returns Загруженное состояние или null в случае ошибки
 */
function loadStateFromLocalStorage(): AppealState | null {
  if (!process.client) return null;
  
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) return null;
    
    const parsedState = JSON.parse(storedData) as AppealState;
    
    // Проверяем структуру данных
    if (!parsedState || !Array.isArray(parsedState.appeals)) {
      console.warn('Структура данных в localStorage неверна');
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    
    // Убедимся, что история существует
    if (!parsedState.history || !Array.isArray(parsedState.history.past) || !Array.isArray(parsedState.history.future)) {
      parsedState.history = { past: [], future: [] };
    }
    
    return parsedState;
  } catch (e) {
    console.error('Ошибка при загрузке состояния из localStorage:', e);
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

const MAX_HISTORY_LENGTH = 20;

export const useAppealsStore = defineStore('appeals', () => {
  // Инициализируем состояние значениями по умолчанию
  const state = reactive<AppealState>({
    appeals: [],
    history: {
      past: [],
      future: []
    }
  });
  
  // Флаг, указывающий, было ли состояние загружено из localStorage
  const stateLoaded = ref(false);
  
  // Загружаем состояние из localStorage при инициализации на клиенте
  onMounted(() => {
    const savedState = loadStateFromLocalStorage();
    if (savedState) {
      state.appeals = savedState.appeals;
      state.history = savedState.history;
      stateLoaded.value = true;
    }
  });
  
  // Сохраняем состояние в localStorage при его изменении
  watch(() => JSON.parse(JSON.stringify(state)), () => {
    saveStateToLocalStorage(state);
  }, { deep: true });

  function setAppeals(appeals: Appeal[]) {
    state.appeals = appeals;
  }

  /**
   * Проверяет, является ли один элемент потомком другого
   */
  function isDescendantInState(appeals: Appeal[], potentialAncestorId: string, childId: string): boolean {
    for (const appeal of appeals) {
      if (appeal.id === potentialAncestorId) {
        // Проверяем, есть ли childId в детях или потомках
        const children = ensureArray(appeal.children);
        if (children.some(child => child.id === childId || isDescendantInState([child], child.id, childId))) {
          return true;
        }
      } else {
        // Рекурсивно проверяем детей
        const children = ensureArray(appeal.children);
        if (children.length > 0 && isDescendantInState(children, potentialAncestorId, childId)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Перемещает обращение в новую позицию
   * @param draggedAppeal Перетаскиваемое обращение
   * @param targetAppeal Целевое обращение
   * @param position Позиция размещения
   * @returns Успешно ли выполнено перемещение
   */
  function moveAppeal(draggedAppeal: Appeal, targetAppeal: Appeal, position: 'before' | 'after' | 'inside'): boolean {
    // Проверка на перемещение элемента в своего потомка
    if (position === 'inside' && isDescendantInState(state.appeals, draggedAppeal.id, targetAppeal.id)) {
      console.warn('Нельзя переместить элемент внутрь своего потомка - это создаст циклическую зависимость');
      return false;
    }
    
    // Проверка на перемещение в ту же самую позицию
    if (draggedAppeal.id === targetAppeal.id) {
      return false;
    }

    // Создаем копию состояния для изменений
    const newState = JSON.parse(JSON.stringify(state.appeals));
    
    // Сохраняем текущее состояние в истории
    state.history.past.push(JSON.parse(JSON.stringify(state.appeals)));
    if (state.history.past.length > MAX_HISTORY_LENGTH) {
      state.history.past.shift();
    }
    state.history.future = [];

    // Удаляем обращение из текущей позиции
    const removeAppeal = (appeals: Appeal[], appealId: string): Appeal | null => {
      for (let i = 0; i < appeals.length; i++) {
        if (appeals[i].id === appealId) {
          return appeals.splice(i, 1)[0];
        }
        const children = ensureArray(appeals[i].children);
        if (children.length > 0) {
          const found = removeAppeal(children, appealId);
          if (found) {
            appeals[i].children = children;
            return found;
          }
        }
      }
      return null;
    };

    const appeal = removeAppeal(newState, draggedAppeal.id);
    if (!appeal) {
      console.warn('Обращение для перемещения не найдено:', draggedAppeal.id);
      return false;
    }

    // Добавляем обращение в новую позицию
    const insertAppeal = (appeals: Appeal[], targetId: string): boolean => {
      for (let i = 0; i < appeals.length; i++) {
        if (appeals[i].id === targetId) {
          if (position === 'inside') {
            const children = ensureArray(appeals[i].children);
            children.push(appeal);
            appeals[i].children = children;
            appeal.parentId = appeals[i].id;
          } else if (position === 'before') {
            appeals.splice(i, 0, appeal);
            appeal.parentId = appeals[i].parentId;
          } else {
            appeals.splice(i + 1, 0, appeal);
            appeal.parentId = appeals[i].parentId;
          }
          return true;
        }
        const children = ensureArray(appeals[i].children);
        if (children.length > 0) {
          if (insertAppeal(children, targetId)) {
            appeals[i].children = children;
            return true;
          }
        }
      }
      return false;
    };

    const inserted = insertAppeal(newState, targetAppeal.id);
    if (!inserted) {
      console.warn('Целевое обращение для вставки не найдено:', targetAppeal.id);
      return false;
    }
    
    state.appeals = newState;
    state.modified = true;
    return true;
  }

  function undo() {
    if (state.history.past.length === 0) return;
    const previous = state.history.past.pop()!;
    state.history.future.push(JSON.parse(JSON.stringify(state.appeals)));
    state.appeals = previous;
  }

  function redo() {
    if (state.history.future.length === 0) return;
    const next = state.history.future.pop()!;
    state.history.past.push(JSON.parse(JSON.stringify(state.appeals)));
    state.appeals = next;
  }

  /**
   * Добавляет новый раздел
   * @param appeal Новый раздел для добавления
   */
  function addAppeal(appeal: Appeal) {
    // Сохраняем текущее состояние в историю для возможности отмены
    state.history.past.push(JSON.parse(JSON.stringify(state.appeals)));
    if (state.history.past.length > MAX_HISTORY_LENGTH) {
      state.history.past = state.history.past.slice(-MAX_HISTORY_LENGTH);
    }
    state.history.future = [];
    
    // Добавляем новый раздел
    state.appeals.push(appeal);
    
    // Сохраняем состояние в localStorage
    saveStateToLocalStorage(state);
  }

  return {
    appeals: computed(() => state.appeals),
    history: computed(() => state.history),
    setAppeals,
    moveAppeal,
    addAppeal,
    undo,
    redo
  };
});

