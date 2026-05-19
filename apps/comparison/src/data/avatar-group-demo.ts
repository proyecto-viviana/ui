export const avatarGroupSizeOptions = ["16", "20", "24", "28", "32", "36", "40"] as const;
export const avatarGroupCountOptions = ["2", "3", "4"] as const;

export type AvatarGroupDemoSize = (typeof avatarGroupSizeOptions)[number];
export type AvatarGroupDemoCount = (typeof avatarGroupCountOptions)[number];

export interface AvatarGroupDemoProps {
  label: string;
  ariaLabel: string;
  size: AvatarGroupDemoSize;
  count: AvatarGroupDemoCount;
}

export const avatarGroupDemoDefaults: AvatarGroupDemoProps = {
  label: "123 members",
  ariaLabel: "Collaborators",
  size: "24",
  count: "4",
};

export const avatarGroupItems = [
  {
    id: "abraham-baker",
    alt: "Abraham Baker",
    src: "/fixtures/avatar-group/abraham-baker.png",
  },
  {
    id: "adriana-sullivan",
    alt: "Adriana Sullivan",
    src: "/fixtures/avatar-group/adriana-sullivan.png",
  },
  {
    id: "jonathan-kelly",
    alt: "Jonathan Kelly",
    src: "/fixtures/avatar-group/jonathan-kelly.png",
  },
  {
    id: "zara-bush",
    alt: "Zara Bush",
    src: "/fixtures/avatar-group/zara-bush.png",
  },
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
    ariaLabel:
      typeof props.ariaLabel === "string" ? props.ariaLabel : avatarGroupDemoDefaults.ariaLabel,
    size: isAvatarGroupSize(size) ? size : avatarGroupDemoDefaults.size,
    count: isAvatarGroupCount(count) ? count : avatarGroupDemoDefaults.count,
  };
}

export function avatarGroupDemoPropsFromSearch(search: string): AvatarGroupDemoProps {
  const params = new URLSearchParams(search);
  const size = params.get("size");
  const count = params.get("count");

  return normalizeAvatarGroupDemoProps({
    label: params.get("label") ?? avatarGroupDemoDefaults.label,
    ariaLabel: params.get("ariaLabel") ?? avatarGroupDemoDefaults.ariaLabel,
    size: isAvatarGroupSize(size) ? size : avatarGroupDemoDefaults.size,
    count: isAvatarGroupCount(count) ? count : avatarGroupDemoDefaults.count,
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
