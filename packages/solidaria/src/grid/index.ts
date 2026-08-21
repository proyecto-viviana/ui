/**
 * Local Solidaria barrel for grid accessibility primitives.
 * Each exported module owns its upstream source mapping.
 */

export { createGrid, getGridData } from "./createGrid";
export { createGridRow } from "./createGridRow";
export { createGridCell } from "./createGridCell";
export { GridKeyboardDelegate } from "./GridKeyboardDelegate";
export type {
  KeyboardDelegate,
  GridProps,
  GridAria,
  GridRowProps,
  GridRowAria,
  GridCellProps,
  GridCellAria,
} from "./types";
