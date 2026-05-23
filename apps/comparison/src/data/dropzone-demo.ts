export const dropZoneSizeOptions = ["S", "M", "L"] as const;

export type DropZoneDemoSize = (typeof dropZoneSizeOptions)[number];

export interface DropZoneDemoProps {
  size: DropZoneDemoSize;
  isFilled: boolean;
  replaceMessage: string;
  ariaLabel: string;
}

export const dropZoneDemoDefaults: DropZoneDemoProps = {
  size: "M",
  isFilled: false,
  replaceMessage: "",
  ariaLabel: "Upload files",
};

function isOneOf<T extends readonly string[]>(
  value: string | null | undefined,
  options: T,
): value is T[number] {
  return value != null && options.includes(value);
}

function booleanParam(value: string | null | undefined) {
  return value === "true" || value === "on" || value === "1";
}

export function normalizeDropZoneDemoProps(
  props: Partial<DropZoneDemoProps> = {},
): DropZoneDemoProps {
  return {
    size: isOneOf(props.size, dropZoneSizeOptions) ? props.size : dropZoneDemoDefaults.size,
    isFilled: !!props.isFilled,
    replaceMessage: props.replaceMessage ?? dropZoneDemoDefaults.replaceMessage,
    ariaLabel: props.ariaLabel || dropZoneDemoDefaults.ariaLabel,
  };
}

export function dropZoneDemoPropsFromSearch(search: string): DropZoneDemoProps {
  const params = new URLSearchParams(search);
  const size = params.get("size");

  return normalizeDropZoneDemoProps({
    size: isOneOf(size, dropZoneSizeOptions) ? size : dropZoneDemoDefaults.size,
    isFilled: booleanParam(params.get("isFilled")),
    replaceMessage: params.get("replaceMessage") ?? dropZoneDemoDefaults.replaceMessage,
    ariaLabel: params.get("ariaLabel") || dropZoneDemoDefaults.ariaLabel,
  });
}

export function dropZoneDemoPropsFromWindow(): DropZoneDemoProps {
  if (typeof window === "undefined") {
    return dropZoneDemoDefaults;
  }

  return dropZoneDemoPropsFromSearch(window.location.search);
}

export function serializeDropZoneDemoProps(props: DropZoneDemoProps): string {
  return JSON.stringify(normalizeDropZoneDemoProps(props));
}
