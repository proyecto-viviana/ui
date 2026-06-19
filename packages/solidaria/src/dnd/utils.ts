/**
 * Drag and Drop utilities for solidaria.
 */

import type {
  DragItem,
  DragType,
  DropItem,
  TextDropItem,
  FileDropItem,
  DirectoryDropItem,
  DropOperation,
} from "@proyecto-viviana/solid-stately";
import { DIRECTORY_DRAG_TYPE } from "@proyecto-viviana/solid-stately";

// Native drag types that can be transferred between applications
export const NATIVE_DRAG_TYPES: Set<string> = new Set(["text/plain", "text/uri-list", "text/html"]);

// Custom drag type for serializing multiple items
export const CUSTOM_DRAG_TYPE = "application/vnd.solidaria.items+json";

// Generic type for unknown file types
export const GENERIC_TYPE = "application/octet-stream";

// Drop operation bit flags
export enum DROP_OPERATION {
  none = 0,
  cancel = 0,
  move = 1 << 0,
  copy = 1 << 1,
  link = 1 << 2,
  all = (1 << 0) | (1 << 1) | (1 << 2),
}

// Map from effectAllowed to DROP_OPERATION
export const DROP_OPERATION_ALLOWED: Record<string, number> = {
  none: DROP_OPERATION.none,
  copy: DROP_OPERATION.copy,
  copyLink: DROP_OPERATION.copy | DROP_OPERATION.link,
  copyMove: DROP_OPERATION.copy | DROP_OPERATION.move,
  link: DROP_OPERATION.link,
  linkMove: DROP_OPERATION.link | DROP_OPERATION.move,
  move: DROP_OPERATION.move,
  all: DROP_OPERATION.all,
  uninitialized: DROP_OPERATION.all,
};

// Map from DROP_OPERATION to effectAllowed
export const EFFECT_ALLOWED: Record<number, string> = {
  [DROP_OPERATION.none]: "none",
  [DROP_OPERATION.move]: "move",
  [DROP_OPERATION.copy]: "copy",
  [DROP_OPERATION.copy | DROP_OPERATION.move]: "copyMove",
  [DROP_OPERATION.link]: "link",
  [DROP_OPERATION.link | DROP_OPERATION.move]: "linkMove",
  [DROP_OPERATION.copy | DROP_OPERATION.link]: "copyLink",
  [DROP_OPERATION.all]: "all",
};

// Map from dropEffect to DropOperation
export const DROP_EFFECT_TO_DROP_OPERATION: Record<string, DropOperation> = {
  none: "cancel",
  link: "link",
  copy: "copy",
  move: "move",
};

// Map from DropOperation to dropEffect
export const DROP_OPERATION_TO_DROP_EFFECT: Record<DropOperation, string> = {
  cancel: "none",
  link: "link",
  copy: "copy",
  move: "move",
};

/**
 * Get the types present in drag items.
 */
export function getTypes(items: DragItem[]): Set<string> {
  const types = new Set<string>();
  for (const item of items) {
    for (const type of Object.keys(item)) {
      types.add(type);
    }
  }
  return types;
}

/**
 * Write drag items to a DataTransfer object.
 */
export function writeToDataTransfer(dataTransfer: DataTransfer, items: DragItem[]): void {
  const groupedByType = new Map<string, string[]>();
  let needsCustomData = false;
  const customData: object[] = [];

  for (const item of items) {
    const types = Object.keys(item);
    if (types.length > 1) {
      needsCustomData = true;
    }

    const dataByType: Record<string, string> = {};
    for (const type of types) {
      let typeItems = groupedByType.get(type);
      if (!typeItems) {
        typeItems = [];
        groupedByType.set(type, typeItems);
      } else {
        needsCustomData = true;
      }

      const data = item[type];
      dataByType[type] = data;
      typeItems.push(data);
    }

    customData.push(dataByType);
  }

  for (const [type, typeItems] of groupedByType) {
    if (NATIVE_DRAG_TYPES.has(type)) {
      // Join all items of this type with newlines
      const data = typeItems.join("\n");
      dataTransfer.items.add(data, type);
    } else {
      // Set first item for non-native types
      dataTransfer.items.add(typeItems[0], type);
    }
  }

  if (needsCustomData) {
    const data = JSON.stringify(customData);
    dataTransfer.items.add(data, CUSTOM_DRAG_TYPE);
  }
}

/**
 * Read drop items from a DataTransfer object.
 */
export function readFromDataTransfer(dataTransfer: DataTransfer): DropItem[] {
  const items: DropItem[] = [];

  if (!dataTransfer) {
    return items;
  }

  // Check for custom drag type first
  let hasCustomType = false;
  if (dataTransfer.types.includes(CUSTOM_DRAG_TYPE)) {
    try {
      const data = dataTransfer.getData(CUSTOM_DRAG_TYPE);
      const parsed = JSON.parse(data);
      for (const item of parsed) {
        items.push({
          kind: "text",
          types: new Set(Object.keys(item)),
          getText: (type) => Promise.resolve(item[type]),
        });
      }
      hasCustomType = true;
    } catch {
      // ignore parsing errors
    }
  }

  // Fall back to native items
  if (!hasCustomType) {
    const stringItems = new Map<string, string>();

    for (const item of dataTransfer.items) {
      if (item.kind === "string") {
        const type = item.type || GENERIC_TYPE;
        stringItems.set(type, dataTransfer.getData(item.type));
      } else if (item.kind === "file") {
        const file = item.getAsFile();
        if (file) {
          items.push(createFileItem(file));
        }
      }
    }

    if (stringItems.size > 0) {
      items.push({
        kind: "text",
        types: new Set(stringItems.keys()),
        getText: (type) => Promise.resolve(stringItems.get(type) ?? ""),
      });
    }
  }

  return items;
}

/**
 * Create a FileDropItem from a File object.
 */
function createFileItem(file: File): FileDropItem {
  return {
    kind: "file",
    type: file.type || GENERIC_TYPE,
    name: file.name,
    getText: () => file.text(),
    getFile: () => Promise.resolve(file),
  };
}

/**
 * DragTypes implementation for checking drag types.
 */
export class DragTypesImpl {
  private types: Set<string>;
  private includesUnknownTypes: boolean;

  constructor(dataTransfer: DataTransfer) {
    this.types = new Set<string>();
    let hasFiles = false;

    for (const item of dataTransfer.items) {
      if (item.type !== CUSTOM_DRAG_TYPE) {
        if (item.kind === "file") {
          hasFiles = true;
        }
        if (item.type) {
          this.types.add(item.type);
        } else {
          this.types.add(GENERIC_TYPE);
        }
      }
    }

    // Safari doesn't expose file types until drop
    this.includesUnknownTypes = !hasFiles && dataTransfer.types.includes("Files");
  }

  has(type: DragType | DragType[]): boolean {
    if (Array.isArray(type)) {
      return type.some((t) => this.has(t));
    }

    if (
      this.includesUnknownTypes ||
      (type === DIRECTORY_DRAG_TYPE && this.types.has(GENERIC_TYPE)) ||
      type === "*/*"
    ) {
      return true;
    }

    if (typeof type === "string") {
      // Wildcard MIME match, e.g. "image/*" accepts "image/png".
      if (type.endsWith("/*")) {
        for (const key of this.types) {
          if (key.startsWith(type.slice(0, -2))) {
            return true;
          }
        }
        return false;
      }
      return this.types.has(type);
    }

    return false;
  }
}

/**
 * Check if a drop item is a text item.
 */
export function isTextDropItem(dropItem: DropItem): dropItem is TextDropItem {
  return dropItem.kind === "text";
}

/**
 * Check if a drop item is a file item.
 */
export function isFileDropItem(dropItem: DropItem): dropItem is FileDropItem {
  return dropItem.kind === "file";
}

/**
 * Check if a drop item is a directory item.
 */
export function isDirectoryDropItem(dropItem: DropItem): dropItem is DirectoryDropItem {
  return dropItem.kind === "directory";
}

// Global state for tracking drag operations
let globalDropEffect: string | undefined;
let globalAllowedDropOperations: number = DROP_OPERATION.none;

export function setGlobalDropEffect(effect: string | undefined): void {
  globalDropEffect = effect;
}

export function getGlobalDropEffect(): string | undefined {
  return globalDropEffect;
}

export function setGlobalAllowedDropOperations(ops: number): void {
  globalAllowedDropOperations = ops;
}

export function getGlobalAllowedDropOperations(): number {
  return globalAllowedDropOperations;
}
