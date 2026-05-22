import { createContext, type Accessor, type JSX } from "solid-js";
import type { Color } from "@proyecto-viviana/solid-stately";

export type InternalColorSwatchSize = "XS" | "S" | "M" | "L";
export type InternalColorSwatchRounding = "default" | "none" | "full";

export interface InternalColorSwatchContextValue {
  size?: InternalColorSwatchSize;
  rounding?: InternalColorSwatchRounding;
  useWrapper: (
    swatch: JSX.Element,
    color: Accessor<Color>,
    rounding: Accessor<InternalColorSwatchRounding>,
  ) => JSX.Element;
}

export const InternalColorSwatchContext = createContext<InternalColorSwatchContextValue | null>(
  null,
);
