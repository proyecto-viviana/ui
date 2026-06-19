/**
 * Drag and Drop types for solid-stately.
 *
 * Core types for drag and drop operations, matching React Aria's DnD API.
 */
/** The type of drop operation to perform. */
export type DropOperation = "copy" | "link" | "move" | "cancel";
/** Drag item data as key-value pairs where keys are MIME types or custom types. */
export interface DragItem {
  [type: string]: string;
}
/** Base event for drag/drop operations with coordinates. */
export interface DragDropEvent {
  /** The x coordinate of the event, relative to the target element. */
  x: number;
  /** The y coordinate of the event, relative to the target element. */
  y: number;
}
/** Event fired when a drag operation starts. */
export interface DragStartEvent extends DragDropEvent {
  /** The event type. */
  type: "dragstart";
}
/** Event fired as a drag moves. */
export interface DragMoveEvent extends DragDropEvent {
  /** The event type. */
  type: "dragmove";
}
/** Event fired when a drag operation ends. */
export interface DragEndEvent extends DragDropEvent {
  /** The event type. */
  type: "dragend";
  /** The drop operation that occurred. */
  dropOperation: DropOperation;
}
/** Event fired when a drag enters a drop target. */
export interface DropEnterEvent extends DragDropEvent {
  /** The event type. */
  type: "dropenter";
}
/** Event fired as a drag moves within a drop target. */
export interface DropMoveEvent extends DragDropEvent {
  /** The event type. */
  type: "dropmove";
}
/** Event fired when a drag is held over a drop target. */
export interface DropActivateEvent extends DragDropEvent {
  /** The event type. */
  type: "dropactivate";
}
/** Event fired when a drag exits a drop target. */
export interface DropExitEvent extends DragDropEvent {
  /** The event type. */
  type: "dropexit";
}
/** A text item in a drop operation. */
export interface TextDropItem {
  /** The item kind. */
  kind: "text";
  /** The drag types available for this item. */
  types: Set<string>;
  /** Returns the data for the given type as a string. */
  getText(type: string): Promise<string>;
}
/** A file item in a drop operation. */
export interface FileDropItem {
  /** The item kind. */
  kind: "file";
  /** The file type (usually a mime type). */
  type: string;
  /** The file name. */
  name: string;
  /** Returns the contents of the file as a blob. */
  getFile(): Promise<File>;
  /** Returns the contents of the file as a string. */
  getText(): Promise<string>;
}
/** A directory item in a drop operation. */
export interface DirectoryDropItem {
  /** The item kind. */
  kind: "directory";
  /** The directory name. */
  name: string;
  /** Returns the entries contained within the directory. */
  getEntries(): AsyncIterable<FileDropItem | DirectoryDropItem>;
}
/** Union of all drop item types. */
export type DropItem = TextDropItem | FileDropItem | DirectoryDropItem;
/** Event fired when items are dropped. */
export interface DropEvent extends DragDropEvent {
  /** The event type. */
  type: "drop";
  /** The drop operation that should occur. */
  dropOperation: DropOperation;
  /** The dropped items. */
  items: DropItem[];
}
/** Position relative to an item for drop operations. */
export type DropPosition = "on" | "before" | "after";
/** Drop target representing the root of a collection. */
export interface RootDropTarget {
  /** The drop target type. */
  type: "root";
}
/** Drop target representing an item in a collection. */
export interface ItemDropTarget {
  /** The drop target type. */
  type: "item";
  /** The item key. */
  key: string | number;
  /** The drop position relative to the item. */
  dropPosition: DropPosition;
}
/** Union of drop target types. */
export type DropTarget = RootDropTarget | ItemDropTarget;
/** Event fired when a drag enters a droppable collection. */
export interface DroppableCollectionEnterEvent extends DropEnterEvent {
  /** The drop target. */
  target: DropTarget;
}
/** Event fired as a drag moves within a droppable collection. */
export interface DroppableCollectionMoveEvent extends DropMoveEvent {
  /** The drop target. */
  target: DropTarget;
}
/** Event fired when a drag is held over a droppable collection item. */
export interface DroppableCollectionActivateEvent extends DropActivateEvent {
  /** The drop target. */
  target: DropTarget;
}
/** Event fired when a drag exits a droppable collection. */
export interface DroppableCollectionExitEvent extends DropExitEvent {
  /** The drop target. */
  target: DropTarget;
}
/** Event fired when items are dropped on a droppable collection. */
export interface DroppableCollectionDropEvent extends DropEvent {
  /** The drop target. */
  target: DropTarget;
}
/** Event for inserting items between existing collection items. */
export interface DroppableCollectionInsertDropEvent {
  /** The dropped items. */
  items: DropItem[];
  /** The drop operation that should occur. */
  dropOperation: DropOperation;
  /** The drop target. */
  target: ItemDropTarget;
}
/** Event for dropping on the root of a collection. */
export interface DroppableCollectionRootDropEvent {
  /** The dropped items. */
  items: DropItem[];
  /** The drop operation that should occur. */
  dropOperation: DropOperation;
}
/** Event for dropping on a specific item. */
export interface DroppableCollectionOnItemDropEvent {
  /** The dropped items. */
  items: DropItem[];
  /** The drop operation that should occur. */
  dropOperation: DropOperation;
  /** Whether the drag originated within the same collection as the drop. */
  isInternal: boolean;
  /** The drop target. */
  target: ItemDropTarget;
}
/** Event for reordering items within a collection. */
export interface DroppableCollectionReorderEvent {
  /** The keys of the items that were reordered. */
  keys: Set<string | number>;
  /** The drop operation that should occur. */
  dropOperation: DropOperation;
  /** The drop target. */
  target: ItemDropTarget;
}
/** A drag type: either a MIME type string or a symbol such as the directory drag type. */
export type DragType = string | symbol;
/** Interface for checking drag types. */
export interface DragTypes {
  /** Returns whether the drag contains data of the given type. */
  has(type: DragType | DragType[]): boolean;
}
/** Delegate for determining drop targets within a collection. */
export interface DropTargetDelegate {
  /**
   * Returns a drop target within a collection for the given coordinates.
   * @param x - X coordinate relative to the collection container
   * @param y - Y coordinate relative to the collection container
   * @param isValidDropTarget - Function to check if a target is valid
   */
  getDropTargetFromPoint(
    x: number,
    y: number,
    isValidDropTarget: (target: DropTarget) => boolean,
  ): DropTarget | null;
}
/** Event fired when a collection drag starts. */
export interface DraggableCollectionStartEvent extends DragStartEvent {
  /** The keys of the items that were dragged. */
  keys: Set<string | number>;
}
/** Event fired as a collection drag moves. */
export interface DraggableCollectionMoveEvent extends DragMoveEvent {
  /** The keys of the items that were dragged. */
  keys: Set<string | number>;
}
/** Event fired when a collection drag ends. */
export interface DraggableCollectionEndEvent extends DragEndEvent {
  /** The keys of the items that were dragged. */
  keys: Set<string | number>;
  /** Whether the drop ended within the same collection as it originated. */
  isInternal: boolean;
}
/** Function to render a custom drag preview. */
export type DragPreviewRenderer = (
  items: DragItem[],
  callback: (node: HTMLElement | null, x?: number, y?: number) => void,
) => void;
/** Props for droppable collection utility handlers. */
export interface DroppableCollectionUtilityOptions {
  /**
   * The drag types that the droppable collection accepts.
   * @default 'all'
   */
  acceptedDragTypes?: "all" | Array<string | symbol>;
  /** Handler that is called when external items are dropped "between" items. */
  onInsert?: (e: DroppableCollectionInsertDropEvent) => void;
  /** Handler that is called when external items are dropped on the collection's root. */
  onRootDrop?: (e: DroppableCollectionRootDropEvent) => void;
  /** Handler that is called when items are dropped "on" an item. */
  onItemDrop?: (e: DroppableCollectionOnItemDropEvent) => void;
  /** Handler that is called when items are reordered within the collection. */
  onReorder?: (e: DroppableCollectionReorderEvent) => void;
  /** Handler that is called when items are moved within the source collection. */
  onMove?: (e: DroppableCollectionReorderEvent) => void;
  /** A function returning whether a given target is a valid "on" drop target. */
  shouldAcceptItemDrop?: (target: ItemDropTarget, types: DragTypes) => boolean;
}
/** Base props for droppable collections. */
export interface DroppableCollectionBaseProps {
  /** Handler that is called when a valid drag enters a drop target. */
  onDropEnter?: (e: DroppableCollectionEnterEvent) => void;
  /** Handler that is called after a valid drag is held over a drop target. */
  onDropActivate?: (e: DroppableCollectionActivateEvent) => void;
  /** Handler that is called when a valid drag exits a drop target. */
  onDropExit?: (e: DroppableCollectionExitEvent) => void;
  /** Handler that is called when a valid drag is dropped on a drop target. */
  onDrop?: (e: DroppableCollectionDropEvent) => void;
  /** A function returning the drop operation to be performed. */
  getDropOperation?: (
    target: DropTarget,
    types: DragTypes,
    allowedOperations: DropOperation[],
  ) => DropOperation;
}
/** Combined props for droppable collections. */
export interface DroppableCollectionProps
  extends DroppableCollectionUtilityOptions, DroppableCollectionBaseProps {}
/** Props for draggable collections. */
export interface DraggableCollectionProps<T = object> {
  /** Handler that is called when a drag operation is started. */
  onDragStart?: (e: DraggableCollectionStartEvent) => void;
  /** Handler that is called when the drag is moved. */
  onDragMove?: (e: DraggableCollectionMoveEvent) => void;
  /** Handler that is called when the drag operation ends. */
  onDragEnd?: (e: DraggableCollectionEndEvent) => void;
  /** A function that returns the items being dragged. */
  getItems: (keys: Set<string | number>, items: T[]) => DragItem[];
  /** The ref of the element that will be rendered as the drag preview. */
  preview?: {
    current: DragPreviewRenderer | null;
  };
  /** Function that returns the allowed drop operations. */
  getAllowedDropOperations?: () => DropOperation[];
}
//# sourceMappingURL=types.d.ts.map
