export const avatarGroupSizeOptions = ["16", "20", "24", "28", "32", "36", "40"] as const;
export const avatarGroupCountOptions = ["2", "3", "4"] as const;

export type AvatarGroupDemoSize = (typeof avatarGroupSizeOptions)[number];
export type AvatarGroupDemoCount = (typeof avatarGroupCountOptions)[number];

export interface AvatarGroupDemoProps {
  label: string;
  size: AvatarGroupDemoSize;
  count: AvatarGroupDemoCount;
}

export const avatarGroupDemoDefaults: AvatarGroupDemoProps = {
  label: "Project team",
  size: "24",
  count: "4",
};

export const avatarGroupItems = [
  { id: "alana", alt: "Alana Reid" },
  { id: "kai", alt: "Kai Chen" },
  { id: "mira", alt: "Mira Patel" },
  { id: "noah", alt: "Noah Kim" },
] as const;

function isAvatarGroupSize(value: string | null | undefined): value is AvatarGroupDemoSize {
  return value != null && avatarGroupSizeOptions.includes(value as AvatarGroupDemoSize);
}

function isAvatarGroupCount(value: string | null | undefined): value is AvatarGroupDemoCount {
  return value != null && avatarGroupCountOptions.includes(value as AvatarGroupDemoCount);
}

export function normalizeAvatarGroupDemoProps(
  props: Partial<AvatarGroupDemoProps> = {},
): AvatarGroupDemoProps {
  const size = String(props.size ?? avatarGroupDemoDefaults.size);
  const count = String(props.count ?? avatarGroupDemoDefaults.count);

  return {
    label: typeof props.label === "string" ? props.label : avatarGroupDemoDefaults.label,
    size: isAvatarGroupSize(size) ? size : avatarGroupDemoDefaults.size,
    count: isAvatarGroupCount(count) ? count : avatarGroupDemoDefaults.count,
  };
}

export function avatarGroupDemoPropsFromSearch(search: string): AvatarGroupDemoProps {
  const params = new URLSearchParams(search);
  return normalizeAvatarGroupDemoProps({
    label: params.get("label") ?? avatarGroupDemoDefaults.label,
    size: isAvatarGroupSize(params.get("size"))
      ? params.get("size")!
      : avatarGroupDemoDefaults.size,
    count: isAvatarGroupCount(params.get("count"))
      ? params.get("count")!
      : avatarGroupDemoDefaults.count,
  });
}

export function avatarGroupDemoPropsFromWindow(): AvatarGroupDemoProps {
  if (typeof window === "undefined") {
    return avatarGroupDemoDefaults;
  }

  return avatarGroupDemoPropsFromSearch(window.location.search);
}

export function serializeAvatarGroupDemoProps(props: AvatarGroupDemoProps): string {
  return JSON.stringify(normalizeAvatarGroupDemoProps(props));
}
