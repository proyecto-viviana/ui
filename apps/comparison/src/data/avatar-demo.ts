import { sanitizeDemoSrc } from "./demo-url";

export const avatarSizeOptions = [
  "16",
  "20",
  "24",
  "28",
  "32",
  "36",
  "40",
  "44",
  "48",
  "56",
  "64",
  "80",
  "96",
  "112",
] as const;

export type AvatarDemoSize = (typeof avatarSizeOptions)[number];

export const avatarDocsExampleSrc = "/fixtures/avatar/docs-avatar.png";

export interface AvatarDemoProps {
  alt: string;
  src: string;
  size: AvatarDemoSize;
  isOverBackground: boolean;
}

export const avatarDemoDefaults: AvatarDemoProps = {
  alt: "Avatar",
  src: avatarDocsExampleSrc,
  size: "24",
  isOverBackground: false,
};

function isAvatarSize(value: string | null | undefined): value is AvatarDemoSize {
  return value != null && avatarSizeOptions.includes(value as AvatarDemoSize);
}

function booleanParam(value: string | null | undefined) {
  return value === "true" || value === "on" || value === "1";
}

export function normalizeAvatarDemoProps(props: Partial<AvatarDemoProps> = {}): AvatarDemoProps {
  const size = String(props.size ?? avatarDemoDefaults.size);

  return {
    alt: typeof props.alt === "string" ? props.alt : avatarDemoDefaults.alt,
    src: sanitizeDemoSrc(
      typeof props.src === "string" ? props.src : undefined,
      avatarDemoDefaults.src,
    ),
    size: isAvatarSize(size) ? size : avatarDemoDefaults.size,
    isOverBackground: props.isOverBackground === true,
  };
}

export function avatarDemoPropsFromSearch(search: string): AvatarDemoProps {
  const params = new URLSearchParams(search);
  const size = params.get("size");

  return normalizeAvatarDemoProps({
    alt: params.get("alt") ?? avatarDemoDefaults.alt,
    src: params.get("src") ?? avatarDemoDefaults.src,
    size: isAvatarSize(size) ? size : avatarDemoDefaults.size,
    isOverBackground: booleanParam(params.get("isOverBackground")),
  });
}

export function avatarDemoPropsFromWindow(): AvatarDemoProps {
  if (typeof window === "undefined") {
    return avatarDemoDefaults;
  }

  return avatarDemoPropsFromSearch(window.location.search);
}

/**
 * Both comparison islands share one document. Chromium performs one fetch per
 * image URL, so the later `<img>` joins that response in flight or, once it
 * has ended, is already `complete` from the memory cache. Either way its
 * `loadTime` drops under Image's 200ms opacity threshold. A per-stack query
 * on this fixture path makes the two loads independent. Serialized demo props
 * stay on the canonical path; this is applied only to the Avatar `src`.
 */
export function comparisonHarnessAvatarSrc(src: string, stack: "react" | "solid"): string {
  if (typeof document === "undefined") {
    return src;
  }
  if (document.querySelector(".js-component-example-section-mount") == null) {
    return src;
  }
  if (!src.startsWith("/") || src.startsWith("//")) {
    return src;
  }

  const url = new URL(src, "http://comparison.local");
  if (url.pathname !== avatarDocsExampleSrc) {
    return src;
  }

  url.searchParams.set("stack", stack);
  return `${url.pathname}${url.search}${url.hash}`;
}

export function serializeAvatarDemoProps(props: AvatarDemoProps): string {
  return JSON.stringify(normalizeAvatarDemoProps(props));
}
