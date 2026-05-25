import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  mergeProps,
  onCleanup,
  Show,
  splitProps,
  type Context,
  type JSX,
  untrack,
  useContext,
} from "solid-js";
import { style, type StyleString } from "../style";
import { mergeStyles } from "../style/runtime";
import type { UnsafeClassName } from "../s2-internal/style-utils";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
  type SpectrumContextValue,
} from "../button/spectrum-context";
import { useTheme } from "../provider";
import { createIsSkeleton, loadingStyle, useLoadingAnimation } from "../skeleton";

export interface ImageSource {
  /** A comma-separated list of image URLs and descriptors. */
  srcSet?: string;
  /** The color scheme for this image source. */
  colorScheme?: "light" | "dark";
  /** A media query describing when the source should render. */
  media?: string;
  /** A list of source sizes that describe the final rendered width of the image. */
  sizes?: string;
  /** The mime type of the image. */
  type?: string;
  /** The intrinsic width of the image. */
  width?: number;
  /** The intrinsic height of the image. */
  height?: number;
}

export interface ImageProps {
  /** The URL of the image or a list of conditional sources. */
  src?: string | ImageSource[];
  /** Accessible alt text for the image. */
  alt?: string;
  crossOrigin?: "anonymous" | "use-credentials";
  decoding?: "async" | "auto" | "sync";
  fetchPriority?: "high" | "low" | "auto";
  loading?: "eager" | "lazy";
  referrerPolicy?: JSX.ImgHTMLAttributes<HTMLImageElement>["referrerPolicy"];
  width?: number;
  height?: number;
  styles?: StyleString | (() => StyleString | undefined);
  renderError?: () => JSX.Element;
  group?: ImageGroup;
  itemProp?: string;
  slot?: string | null;
  UNSAFE_className?: UnsafeClassName | string;
  UNSAFE_style?: JSX.CSSProperties;
  ref?: RefLike<HTMLDivElement>;
}

type ImageContextValue = ImageProps & {
  hidden?: boolean;
};

export const ImageContext = createContext<SpectrumContextValue<ImageContextValue>>(null);

export interface ImageCoordinatorProps {
  children?: JSX.Element;
  /** Time in milliseconds after which images are always displayed. @default 5000 */
  timeout?: number;
  group?: ImageGroup;
}

interface ImageGroupValue {
  readonly revealAll: boolean;
  register(url: string): void;
  unregister(url: string): void;
  load(url: string): void;
}

export type ImageGroup = Context<ImageGroupValue>;

const defaultImageGroupValue: ImageGroupValue = {
  revealAll: true,
  register() {},
  unregister() {},
  load() {},
};

export function createImageGroup(): ImageGroup {
  return createContext(defaultImageGroupValue);
}

export const DefaultImageGroup = createImageGroup();

type ImageState = "loading" | "loaded" | "revealed" | "error";

const imageWrapperStyles = style({
  backgroundColor: "gray-100" as never,
  overflow: "hidden",
});

const imageStyles = style({
  display: "block",
  width: "full",
  height: "full",
  objectFit: "inherit",
  objectPosition: "inherit",
  opacity: {
    default: 0,
    isRevealed: 1,
  },
  transition: {
    default: "none",
    isTransitioning: "opacity",
  },
  transitionDuration: 500,
});

const pictureStyles = style({
  objectFit: "inherit",
  objectPosition: "inherit",
});

function isAllLoaded(loaded: Map<string, boolean>) {
  for (const isLoaded of loaded.values()) {
    if (!isLoaded) {
      return false;
    }
  }
  return true;
}

export function ImageCoordinator(props: ImageCoordinatorProps): JSX.Element {
  const group = () => props.group ?? DefaultImageGroup;
  const context = useContext(group());

  if (context !== defaultImageGroupValue) {
    return <>{props.children}</>;
  }

  return <ImageCoordinatorRoot {...props} />;
}

function ImageCoordinatorRoot(props: ImageCoordinatorProps): JSX.Element {
  const group = () => props.group ?? DefaultImageGroup;
  const timeout = () => props.timeout ?? 5000;
  const [loadedAll, setLoadedAll] = createSignal(true);
  const [timedOut, setTimedOut] = createSignal(false);
  const [loadStartTime, setLoadStartTime] = createSignal(0);
  const [loaded, setLoaded] = createSignal(new Map<string, boolean>());

  const register = (url: string) => {
    untrack(() => {
      setLoaded((current) => {
        if (current.get(url) === false) {
          return current;
        }

        const next = new Map(current);
        next.set(url, false);
        if (loadedAll()) {
          setTimedOut(false);
          setLoadStartTime(Date.now());
        }
        setLoadedAll(false);
        return next;
      });
    });
  };

  const unregister = (url: string) => {
    setLoaded((current) => {
      if (!current.has(url)) {
        return current;
      }

      const next = new Map(current);
      next.delete(url);
      setLoadedAll(isAllLoaded(next));
      return next;
    });
  };

  const load = (url: string) => {
    setLoaded((current) => {
      if (current.get(url) !== false) {
        return current;
      }

      const next = new Map(current);
      next.set(url, true);
      setLoadedAll(isAllLoaded(next));
      return next;
    });
  };

  createEffect(() => {
    if (loadedAll()) {
      return;
    }

    const delay = Math.max(0, loadStartTime() + timeout() - Date.now());
    const timeoutId = window.setTimeout(() => setTimedOut(true), delay);
    onCleanup(() => window.clearTimeout(timeoutId));
  });

  const value: ImageGroupValue = {
    get revealAll() {
      return loadedAll() || timedOut();
    },
    register,
    unregister,
    load,
  };

  const GroupProvider = group().Provider;
  return <GroupProvider value={value}>{props.children}</GroupProvider>;
}

function sourceCacheKey(src: string | ImageSource[] | undefined) {
  return Array.isArray(src) ? JSON.stringify(src) : (src ?? "");
}

function sourceMedia(source: ImageSource, colorScheme: "light" | "dark") {
  return `${source.media ? `${source.media} and ` : ""}(prefers-color-scheme: ${colorScheme})`;
}

export function Image(props: ImageProps): JSX.Element {
  const contextProps = getSlottedContextProps(useContext(ImageContext), props.slot);
  const merged = mergeProps(contextProps ?? {}, props);
  const [local] = splitProps(merged, [
    "src",
    "alt",
    "crossOrigin",
    "decoding",
    "fetchPriority",
    "loading",
    "referrerPolicy",
    "width",
    "height",
    "styles",
    "renderError",
    "group",
    "itemProp",
    "slot",
    "UNSAFE_className",
    "UNSAFE_style",
    "hidden",
    "ref",
  ]);
  const theme = useTheme();
  const imageGroup = useContext(local.group ?? DefaultImageGroup);
  const [state, setState] = createSignal<ImageState>("loading");
  const [lastCacheKey, setLastCacheKey] = createSignal(sourceCacheKey(local.src));
  const [startTime, setStartTime] = createSignal(Date.now());
  const [loadTime, setLoadTime] = createSignal(0);
  const isSkeleton = createIsSkeleton();
  let imageElement: HTMLImageElement | undefined;

  const nodeEnv = (globalThis as typeof globalThis & { process?: { env?: { NODE_ENV?: string } } })
    .process?.env?.NODE_ENV;
  if (local.alt == null && nodeEnv !== "production") {
    console.warn(
      'The `alt` prop was not provided to an image. Add `alt` text for screen readers, or set `alt=""` prop to indicate that the image is decorative or redundant with displayed text and should not be announced by screen readers.',
    );
  }

  const hidden = () => local.hidden === true;
  const srcProp = () => local.src ?? "";
  const cacheKey = createMemo(() => sourceCacheKey(local.src));
  const revealed = () => state() === "revealed" && !isSkeleton();
  const transitioning = () => revealed() && loadTime() > 200;
  const animating = () => isSkeleton() || state() === "loading" || state() === "loaded";
  const loadingAnimationRef = useLoadingAnimation(animating);

  createEffect(() => {
    const nextKey = cacheKey();
    if (nextKey !== lastCacheKey() && !hidden()) {
      setState("loading");
      setLastCacheKey(nextKey);
      setStartTime(Date.now());
      setLoadTime(0);
    }
  });

  createEffect(() => {
    if (hidden()) {
      return;
    }

    const key = cacheKey();
    imageGroup.register(key);
    onCleanup(() => imageGroup.unregister(key));
  });

  createEffect(() => {
    if (state() === "loaded" && imageGroup.revealAll && !hidden()) {
      setState("revealed");
      setLoadTime(Date.now() - startTime());
    }
  });

  createEffect(() => {
    if (hidden()) {
      return;
    }

    const image = imageElement;
    if (state() === "loading" && image?.complete) {
      queueMicrotask(() => {
        if (image.naturalWidth === 0 && image.naturalHeight === 0) {
          handleError();
        } else {
          handleLoad();
        }
      });
    }
  });

  const handleLoad = () => {
    imageGroup.load(cacheKey());
    setState("loaded");
  };

  const handleError = () => {
    setState("error");
    imageGroup.unregister(cacheKey());
  };

  const slot = () => (local.slot === null ? undefined : (local.slot ?? contextProps?.slot));
  const wrapperClass = () =>
    [
      local.UNSAFE_className,
      mergeStyles(
        imageWrapperStyles as unknown as StyleString,
        mergeContextStyles(contextProps?.styles, props.styles),
      ),
      animating() ? loadingStyle : undefined,
    ]
      .filter(Boolean)
      .join(" ");
  const wrapperStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);
  const errorState = () => !isSkeleton() && state() === "error" && local.renderError?.();

  const sources = () => {
    const src = srcProp();
    if (!Array.isArray(src)) {
      return [];
    }

    return src
      .map((source) => {
        if (!source.colorScheme) {
          return source;
        }

        const colorScheme = theme.colorScheme;
        if (!colorScheme || colorScheme === "light dark") {
          return {
            ...source,
            media: sourceMedia(source, source.colorScheme),
          };
        }

        return source.colorScheme === colorScheme ? source : null;
      })
      .filter((source): source is ImageSource => source != null);
  };

  const img = () => (
    <img
      src={typeof srcProp() === "string" && srcProp() ? (srcProp() as string) : undefined}
      alt={local.alt}
      crossOrigin={local.crossOrigin}
      decoding={local.decoding}
      loading={local.loading}
      referrerPolicy={local.referrerPolicy}
      width={local.width}
      height={local.height}
      ref={(element) => {
        imageElement = element;
      }}
      itemProp={local.itemProp}
      onLoad={handleLoad}
      onError={handleError}
      class={imageStyles({
        isRevealed: revealed(),
        isTransitioning: transitioning(),
      })}
      {...({ fetchpriority: local.fetchPriority } as Record<string, string | undefined>)}
    />
  );

  const imageContent = () => {
    if (Array.isArray(srcProp())) {
      return (
        <picture class={pictureStyles}>
          {sources().map((source) => {
            const { colorScheme: _colorScheme, ...sourceProps } = source;
            return (
              <source
                srcset={sourceProps.srcSet}
                media={sourceProps.media}
                sizes={sourceProps.sizes}
                type={sourceProps.type}
                width={sourceProps.width}
                height={sourceProps.height}
              />
            );
          })}
          {img()}
        </picture>
      );
    }

    return img();
  };

  if (hidden()) {
    return null as unknown as JSX.Element;
  }

  return (
    <div
      ref={mergeContextRefs(
        (contextProps as { ref?: RefLike<HTMLDivElement> } | null)?.ref,
        props.ref,
        (element) => {
          loadingAnimationRef(element);
        },
      )}
      slot={slot() ?? undefined}
      style={wrapperStyle()}
      class={wrapperClass()}
    >
      <Show when={!errorState()} fallback={errorState()}>
        {imageContent()}
      </Show>
    </div>
  );
}
