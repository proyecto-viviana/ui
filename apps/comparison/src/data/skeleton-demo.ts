export interface SkeletonDemoProps {
  isLoading: boolean;
}

export const skeletonDemoDefaults: SkeletonDemoProps = {
  isLoading: true,
};

function booleanParam(value: string | null | undefined) {
  return value === "true" || value === "on" || value === "1";
}

export function normalizeSkeletonDemoProps(
  props: Partial<SkeletonDemoProps> = {},
): SkeletonDemoProps {
  return {
    isLoading: props.isLoading ?? skeletonDemoDefaults.isLoading,
  };
}

export function skeletonDemoPropsFromSearch(search: string): SkeletonDemoProps {
  const params = new URLSearchParams(search);
  return normalizeSkeletonDemoProps({
    isLoading: params.has("isLoading")
      ? booleanParam(params.get("isLoading"))
      : skeletonDemoDefaults.isLoading,
  });
}

export function skeletonDemoPropsFromWindow(): SkeletonDemoProps {
  if (typeof window === "undefined") {
    return skeletonDemoDefaults;
  }

  return skeletonDemoPropsFromSearch(window.location.search);
}

export function serializeSkeletonDemoProps(props: SkeletonDemoProps): string {
  return JSON.stringify(normalizeSkeletonDemoProps(props));
}
