import type { Key } from "@proyecto-viviana/solid-stately";
import type { ComboBoxProps } from "../src/ComboBox";

type Assert<T extends true> = T;
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

type Item = { id: string };

type MultipleValue = Assert<
  Equal<ComboBoxProps<Item, "multiple">["value"], readonly Key[] | undefined>
>;
type MultipleDefaultValue = Assert<
  Equal<ComboBoxProps<Item, "multiple">["defaultValue"], readonly Key[] | undefined>
>;
type MultipleCallback = Assert<
  Equal<NonNullable<ComboBoxProps<Item, "multiple">["onChange"]>, (value: Key[]) => void>
>;
type SingleValue = Assert<Equal<ComboBoxProps<Item, "single">["value"], Key | null | undefined>>;
type SingleCallback = Assert<
  Equal<NonNullable<ComboBoxProps<Item, "single">["onChange"]>, (value: Key | null) => void>
>;
type RejectSingleArray = Assert<
  readonly Key[] extends NonNullable<ComboBoxProps<Item, "single">["value"]> ? false : true
>;
type RejectSingleMutableArray = Assert<
  Key[] extends NonNullable<ComboBoxProps<Item, "single">["value"]> ? false : true
>;
