import type { JSX } from "@solidjs/web";
import type { ButtonProps } from "../src/components/button";

type Assert<T extends true> = T;
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

// The existing content slots must accept all JSX, not intersect RDFa's string.
type PrefixAcceptsJSX = Assert<JSX.Element extends ButtonProps["prefix"] ? true : false>;
type PrefixAcceptsNode = Assert<HTMLSpanElement extends ButtonProps["prefix"] ? true : false>;
type PrefixAcceptsArray = Assert<JSX.Element[] extends ButtonProps["prefix"] ? true : false>;
type SuffixAcceptsJSX = Assert<JSX.Element extends ButtonProps["suffix"] ? true : false>;
type Forwarded = "form" | "name" | "value" | "onClick" | "about" | "property" | "vocab";
type NativeForwarding = Assert<
  Equal<Pick<ButtonProps, Forwarded>, Pick<JSX.ButtonHTMLAttributes<HTMLButtonElement>, Forwarded>>
>;
type IconOnlyRequiresName = Assert<{ svgOnly: true } extends ButtonProps ? false : true>;
type NamedIconOnlyAccepted = Assert<
  { svgOnly: true; "aria-label": string } extends ButtonProps ? true : false
>;
