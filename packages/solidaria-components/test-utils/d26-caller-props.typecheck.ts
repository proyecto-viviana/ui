import type { JSX } from "@solidjs/web";
import type { CardProps as SpectrumCardProps } from "../../solid-spectrum/src/card";
import type { CardProps as VivianaCardProps } from "../../viviana-ui/src/card";

type Assert<T extends true> = T;
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

type HTMLTabIndex = JSX.HTMLAttributes<HTMLElement>["tabindex"];
type SpectrumTabIndex = Assert<Equal<SpectrumCardProps["tabindex"], HTMLTabIndex>>;
type VivianaTabIndex = Assert<Equal<VivianaCardProps["tabindex"], HTMLTabIndex>>;
type SpectrumValues = Assert<
  0 | -1 | undefined extends SpectrumCardProps["tabindex"] ? true : false
>;
type VivianaValues = Assert<0 | -1 | undefined extends VivianaCardProps["tabindex"] ? true : false>;
type SpectrumOptional = Assert<{} extends Pick<SpectrumCardProps, "tabindex"> ? true : false>;
type VivianaOptional = Assert<{} extends Pick<VivianaCardProps, "tabindex"> ? true : false>;
type SpectrumNoAlias = Assert<"tabIndex" extends keyof SpectrumCardProps ? false : true>;
type VivianaNoAlias = Assert<"tabIndex" extends keyof VivianaCardProps ? false : true>;
