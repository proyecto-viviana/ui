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

// D26: the styled AlertDialog boundary exposes only DOM identity and labeling.
import type { AlertDialogProps as SpectrumAlertDialogProps } from "../../solid-spectrum/src/dialog/AlertDialog";
type SpectrumAlertId = Assert<Equal<SpectrumAlertDialogProps["id"], string | undefined>>;
type SpectrumAlertLabel = Assert<Equal<SpectrumAlertDialogProps["aria-label"], string | undefined>>;
type SpectrumAlertLabelledBy = Assert<
  Equal<SpectrumAlertDialogProps["aria-labelledby"], string | undefined>
>;
type SpectrumAlertDescribedBy = Assert<
  Equal<SpectrumAlertDialogProps["aria-describedby"], string | undefined>
>;
type SpectrumAlertDetails = Assert<
  Equal<SpectrumAlertDialogProps["aria-details"], string | undefined>
>;
type SpectrumAlertOptional = Assert<
  {} extends Pick<
    SpectrumAlertDialogProps,
    "id" | "aria-label" | "aria-labelledby" | "aria-describedby" | "aria-details"
  >
    ? true
    : false
>;
type SpectrumAlertNarrow = Assert<
  Equal<
    Extract<
      keyof SpectrumAlertDialogProps,
      "role" | "onClick" | "onKeyDown" | "tabindex" | "style" | "hidden" | "lang" | "dir"
    >,
    never
  >
>;
import type { AlertDialogProps as VivianaAlertDialogProps } from "../../viviana-ui/src/dialog/AlertDialog";
type VivianaAlertId = Assert<Equal<VivianaAlertDialogProps["id"], string | undefined>>;
type VivianaAlertLabel = Assert<Equal<VivianaAlertDialogProps["aria-label"], string | undefined>>;
type VivianaAlertLabelledBy = Assert<
  Equal<VivianaAlertDialogProps["aria-labelledby"], string | undefined>
>;
type VivianaAlertDescribedBy = Assert<
  Equal<VivianaAlertDialogProps["aria-describedby"], string | undefined>
>;
type VivianaAlertDetails = Assert<
  Equal<VivianaAlertDialogProps["aria-details"], string | undefined>
>;
type VivianaAlertOptional = Assert<
  {} extends Pick<
    VivianaAlertDialogProps,
    "id" | "aria-label" | "aria-labelledby" | "aria-describedby" | "aria-details"
  >
    ? true
    : false
>;
type VivianaAlertNarrow = Assert<
  Equal<
    Extract<
      keyof VivianaAlertDialogProps,
      "role" | "onClick" | "onKeyDown" | "tabindex" | "style" | "hidden" | "lang" | "dir"
    >,
    never
  >
>;
