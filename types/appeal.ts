/**
 * Представляет объект обращения с возможностью вложенности
 */
export interface Appeal {
  /** Уникальный идентификатор обращения */
  id: string;
  /** Заголовок обращения */
  title: string;
  /** Массив дочерних обращений */
  children?: Appeal[];
  /** Идентификатор родительского обращения, null для элементов верхнего уровня */
  parentId?: string | null;
  /** Порядковый номер для сортировки */
  order: number;
}

/**
 * Состояние хранилища обращений
 */
export interface AppealState {
  /** Массив обращений верхнего уровня */
  appeals: Appeal[];
  /** История изменений для undo/redo функциональности */
  history: {
    /** Прошлые состояния (для отмены действий) */
    past: Appeal[][];
    /** Будущие состояния (для повтора действий) */
    future: Appeal[][];
  };
  /** Флаг, указывающий, было ли состояние изменено */
  modified?: boolean;
}

/**
 * Позиция для перемещения элемента
 */
export type DragPosition = 'before' | 'after' | 'inside' | null;

/**
 * Состояние перетаскивания для отслеживания drag-and-drop операций
 */
export interface DragState {
  /** Флаг, указывающий, происходит ли перетаскивание в данный момент */
  isDragging: boolean;
  /** Обращение, которое перетаскивается */
  draggedAppeal: Appeal | null;
  /** Обращение, над которым находится перетаскиваемый элемент */
  dragOverAppeal: Appeal | null;
  /** Позиция для вставки (до, после, внутрь) */
  dragPosition: DragPosition;
}

/**
 * Проверяет, является ли один элемент потомком другого
 * @param potentialParent Потенциальный родительский элемент
 * @param childId Идентификатор дочернего элемента
 * @returns Истина, если childId является потомком potentialParent
 */
export function isDescendant(potentialParent: Appeal, childId: string): boolean {
  if (!potentialParent.children || potentialParent.children.length === 0) {
    return false;
  }
  
  return potentialParent.children.some(child => 
    child.id === childId || isDescendant(child, childId)
  );
}
