/**
 * Drag and Drop module for solidaria.
 *
 * Provides ARIA hooks for drag and drop interactions.
 */

// Basic drag/drop hooks
export { createDrag } from "./createDrag";
export { createDrop } from "./createDrop";

// Collection hooks
export {
  createDraggableCollection,
  setGlobalDraggingCollectionRef,
  getGlobalDraggingCollectionRef,
  setGlobalDraggingKeys,
  getGlobalDraggingKeys,
  setGlobalDraggingTypes,
  getGlobalDraggingTypes,
} from "./createDraggableCollection";
export {
  createDroppableCollection,
  setGlobalDropCollectionRef,
  getGlobalDropCollectionRef,
} from "./createDroppableCollection";

// Item hooks
export { createDraggableItem } from "./createDraggableItem";
export { createDroppableItem } from "./createDroppableItem";

// Types
export type { AriaDragOptions, DragAria, AriaDropOptions, DropAria } from "./types";
export type {
  DraggableCollectionOptions,
  DraggableCollectionAria,
} from "./createDraggableCollection";
export type {
  DroppableCollectionOptions,
  DroppableCollectionAria,
  DropTargetDelegate,
} from "./createDroppableCollection";
export type { DraggableItemOptions, DraggableItemAria } from "./createDraggableItem";
export type { DroppableItemOptions, DroppableItemAria } from "./createDroppableItem";

// Utilities
export {
  CUSTOM_DRAG_TYPE,
  NATIVE_DRAG_TYPES,
  GENERIC_TYPE,
  DROP_OPERATION,
  DROP_OPERATION_ALLOWED,
  EFFECT_ALLOWED,
  DROP_EFFECT_TO_DROP_OPERATION,
  DROP_OPERATION_TO_DROP_EFFECT,
  getDragModality,
  getTypes,
  writeToDataTransfer,
  readFromDataTransfer,
  DragTypesImpl,
  isTextDropItem,
  isFileDropItem,
  isDirectoryDropItem,
  setGlobalDropEffect,
  getGlobalDropEffect,
  setGlobalAllowedDropOperations,
  getGlobalAllowedDropOperations,
} from "./utils";
