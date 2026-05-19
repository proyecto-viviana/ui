import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const breadcrumbsSizeOptions = ["M", "L"] as const;
export const breadcrumbsItemSetOptions = ["standard", "overflow"] as const;

export type BreadcrumbsDemoSize = (typeof breadcrumbsSizeOptions)[number];
export type BreadcrumbsDemoItemSet = (typeof breadcrumbsItemSetOptions)[number];

export interface BreadcrumbsDemoProps {
  size: BreadcrumbsDemoSize;
  itemSet: BreadcrumbsDemoItemSet;
  isDisabled: boolean;
}

export interface BreadcrumbsItem {
  id: string;
  label: string;
  href?: string;
}

export const breadcrumbsDemoDefaults: BreadcrumbsDemoProps = {
  size: "M",
  itemSet: "standard",
  isDisabled: false,
};

export const standardBreadcrumbItems: BreadcrumbsItem[] = [
  { id: "home", label: "Home" },
  { id: "breadcrumbs", label: "Breadcrumbs" },
];

export const overflowBreadcrumbItems: BreadcrumbsItem[] = [
  { id: "home", label: "Home" },
  { id: "files", label: "Files" },
  { id: "projects", label: "Projects" },
  { id: "reports", label: "Reports" },
  { id: "annual-report", label: "Annual report" },
];

function isOneOf<T extends readonly string[]>(
  value: string | null | undefined,
  options: T,
): value is T[number] {
  return value != null && options.includes(value);
}

function booleanParam(value: unknown) {
  return value === true || value === "true" || value === "on" || value === "1";
}

export function breadcrumbsItemsForSet(itemSet: BreadcrumbsDemoItemSet): BreadcrumbsItem[] {
  return itemSet === "overflow" ? overflowBreadcrumbItems : standardBreadcrumbItems;
}

export function normalizeBreadcrumbsDemoProps(
  props: Partial<BreadcrumbsDemoProps> = {},
): BreadcrumbsDemoProps {
  const size = String(props.size ?? "");
  const itemSet = String(props.itemSet ?? "");

  return {
    size: isOneOf(size, breadcrumbsSizeOptions) ? size : breadcrumbsDemoDefaults.size,
    itemSet: isOneOf(itemSet, breadcrumbsItemSetOptions)
      ? itemSet
      : breadcrumbsDemoDefaults.itemSet,
    isDisabled: booleanParam(props.isDisabled),
  };
}

export function breadcrumbsDemoPropsFromSearch(search: string): BreadcrumbsDemoProps {
  const params = new URLSearchParams(search);
  const size = params.get("size");
  const itemSet = params.get("itemSet");

  return normalizeBreadcrumbsDemoProps({
    size: isOneOf(size, breadcrumbsSizeOptions) ? size : breadcrumbsDemoDefaults.size,
    itemSet: isOneOf(itemSet, breadcrumbsItemSetOptions)
      ? itemSet
      : breadcrumbsDemoDefaults.itemSet,
    isDisabled: params.get("isDisabled") === "true",
  });
}

export function breadcrumbsDemoPropsFromWindow(): BreadcrumbsDemoProps {
  if (typeof window === "undefined") {
    return breadcrumbsDemoDefaults;
  }

  return breadcrumbsDemoPropsFromSearch(window.location.search);
}

export function serializeBreadcrumbsDemoProps(props: BreadcrumbsDemoProps) {
  return JSON.stringify({
    size: props.size,
    itemSet: props.itemSet,
    isDisabled: props.isDisabled,
  });
}

export function serializeBreadcrumbPath(items: readonly BreadcrumbsItem[]): string {
  return items.map((item) => item.id).join(",");
}
