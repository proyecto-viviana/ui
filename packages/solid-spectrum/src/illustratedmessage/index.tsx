import { type JSX, Show, createContext, mergeProps, splitProps, useContext } from "solid-js";
import { filterDOMProps } from "@proyecto-viviana/solidaria";
import { ButtonGroupContext } from "../button";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
  type SpectrumContextValue,
} from "../button/spectrum-context";
import { IllustrationContext } from "../icon";
import {
  controlFont,
  getAllowedOverrides,
  type StylesPropWithHeight,
  type UnsafeClassName,
} from "../s2-internal/style-utils";
import { style, type StyleString } from "../style";
import { ContentContext, HeadingContext } from "../text";

export type IllustratedMessageSize = "S" | "M" | "L";
export type IllustratedMessageOrientation = "horizontal" | "vertical";

interface IllustratedMessageStyleProps {
  size?: IllustratedMessageSize;
  orientation?: IllustratedMessageOrientation;
}

export interface IllustratedMessageProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "children" | "class" | "style" | "ref" | "slot"
> {
  /** The content to display in the IllustratedMessage. */
  children?: JSX.Element;
  /**
   * The size of the IllustratedMessage.
   * @default 'M'
   */
  size?: IllustratedMessageSize;
  /**
   * The direction that the IllustratedMessage should be laid out in.
   * @default 'vertical'
   */
  orientation?: IllustratedMessageOrientation;
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StylesPropWithHeight | (() => StyleString | undefined);
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: UnsafeClassName | string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  slot?: string | null;
  ref?: RefLike<HTMLDivElement>;
  /** Legacy shortcut. Prefer passing an Illustration child. */
  illustration?: JSX.Element;
  /** Legacy shortcut. Prefer passing a Heading child. */
  heading?: JSX.Element;
  /** Legacy shortcut. Prefer passing Content children. */
  description?: JSX.Element;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
  itemID?: string;
}

export interface IllustratedMessageContextProps extends Partial<IllustratedMessageProps> {
  isInDropZone?: boolean;
  isDropTarget?: boolean;
}

export const IllustratedMessageContext =
  createContext<SpectrumContextValue<IllustratedMessageContextProps>>(null);

const illustratedMessage = style<IllustratedMessageStyleProps & { isInDropZone?: boolean }>(
  {
    display: "grid",
    font: controlFont(),
    maxWidth: {
      orientation: {
        vertical: 380,
        horizontal: 528,
      },
    },
    gridTemplateAreas: {
      orientation: {
        vertical: [
          "   .  illustration .   ",
          "   .       .       .   ",
          "heading heading heading",
          "   .       .       .   ",
          "content content content",
          "   .  buttonGroup  .   ",
        ],
        horizontal: [
          "illustration . heading",
          "illustration .    .   ",
          "illustration . content",
          "illustration . buttonGroup",
        ],
      },
    },
    gridTemplateRows: {
      orientation: {
        vertical: {
          default: ["min-content", 12, "min-content", 4, "min-content", "min-content"],
          size: {
            L: ["min-content", 8, "min-content", 4, "min-content", "min-content"],
          },
        },
        horizontal: ["1fr", 4, "1fr"],
      },
    },
    gridTemplateColumns: {
      orientation: {
        horizontal: ["1fr", 12, "auto"],
      },
    },
    justifyItems: {
      orientation: {
        vertical: "center",
        horizontal: "start",
      },
    },
    textAlign: {
      orientation: {
        vertical: "center",
      },
    },
  },
  getAllowedOverrides({ height: true }),
);

const illustration = style<
  IllustratedMessageStyleProps & { isInDropZone?: boolean; isDropTarget?: boolean }
>({
  gridArea: "illustration",
  alignSelf: "center",
  "--iconPrimary": {
    type: "color",
    value: {
      default: "neutral",
      isDropTarget: "accent",
    },
  },
});

const heading = style<IllustratedMessageStyleProps>({
  gridArea: "heading",
  font: {
    size: {
      S: "title",
      M: "title-xl",
      L: "title-2xl",
    },
  },
  alignSelf: "end",
  margin: 0,
});

const content = style<IllustratedMessageStyleProps>({
  font: {
    size: {
      S: "body-xs",
      M: "body-sm",
      L: "body-sm",
    },
  },
  gridArea: "content",
  alignSelf: "start",
});

const buttonGroup = style({
  gridArea: "buttonGroup",
  marginTop: 16,
});

/**
 * An IllustratedMessage displays an illustration and a message, usually for an empty state or error page.
 */
export function IllustratedMessage(props: IllustratedMessageProps): JSX.Element {
  const contextProps = getSlottedContextProps(useContext(IllustratedMessageContext), props.slot);
  const merged = mergeProps(contextProps ?? {}, props);
  const [local, domProps] = splitProps(merged, [
    "children",
    "orientation",
    "size",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "slot",
    "ref",
    "isInDropZone",
    "isDropTarget",
    "illustration",
    "heading",
    "description",
    "class",
  ]);
  const size = () => local.size ?? "M";
  const orientation = () => local.orientation ?? "vertical";
  const isInDropZone = () => !!local.isInDropZone;
  const isDropTarget = () => !!local.isDropTarget;
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);
  const className = () =>
    [
      contextProps?.UNSAFE_className,
      local.UNSAFE_className,
      local.class,
      illustratedMessage(
        {
          size: size(),
          orientation: orientation(),
          isInDropZone: isInDropZone(),
        },
        mergedStyles(),
      ),
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <div
      {...filterDOMProps(domProps as Record<string, unknown>)}
      ref={mergeContextRefs(
        (contextProps as { ref?: RefLike<HTMLDivElement> } | null)?.ref,
        props.ref,
      )}
      class={className()}
      style={mergedUnsafeStyle()}
    >
      <HeadingContext.Provider
        value={{ styles: () => heading({ orientation: orientation(), size: size() }) }}
      >
        <ContentContext.Provider value={{ styles: () => content({ size: size() }) }}>
          <IllustrationContext.Provider
            value={{
              get size() {
                return size() === "L" ? "L" : "M";
              },
              styles: () =>
                illustration({
                  orientation: orientation(),
                  size: size(),
                  isInDropZone: isInDropZone(),
                  isDropTarget: isDropTarget(),
                }),
            }}
          >
            <ButtonGroupContext.Provider value={{ styles: buttonGroup }}>
              <Show when={local.illustration}>
                <div class={illustration({ orientation: orientation(), size: size() })}>
                  {local.illustration}
                </div>
              </Show>
              <Show when={local.heading}>
                <h3 class={heading({ orientation: orientation(), size: size() })}>
                  {local.heading}
                </h3>
              </Show>
              <Show when={local.description}>
                <div class={content({ size: size() })}>{local.description}</div>
              </Show>
              {local.children}
            </ButtonGroupContext.Provider>
          </IllustrationContext.Provider>
        </ContentContext.Provider>
      </HeadingContext.Provider>
    </div>
  );
}
