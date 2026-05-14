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

export interface AvatarDemoProps {
  alt: string;
  src: string;
  size: AvatarDemoSize;
  isOverBackground: boolean;
}

export const avatarDemoDefaults: AvatarDemoProps = {
  alt: "Alana",
  src: "",
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
    src: typeof props.src === "string" ? props.src : avatarDemoDefaults.src,
    size: isAvatarSize(size) ? size : avatarDemoDefaults.size,
    isOverBackground: props.isOverBackground === true,
  };
}

export function avatarDemoPropsFromSearch(search: string): AvatarDemoProps {
  const params = new URLSearchParams(search);
  return normalizeAvatarDemoProps({
    alt: params.get("alt") ?? avatarDemoDefaults.alt,
    src: params.get("src") ?? avatarDemoDefaults.src,
    size: isAvatarSize(params.get("size")) ? params.get("size")! : avatarDemoDefaults.size,
    isOverBackground: booleanParam(params.get("isOverBackground")),
  });
}

export function avatarDemoPropsFromWindow(): AvatarDemoProps {
  if (typeof window === "undefined") {
    return avatarDemoDefaults;
  }

  return avatarDemoPropsFromSearch(window.location.search);
}

export function serializeAvatarDemoProps(props: AvatarDemoProps): string {
  return JSON.stringify(normalizeAvatarDemoProps(props));
}
