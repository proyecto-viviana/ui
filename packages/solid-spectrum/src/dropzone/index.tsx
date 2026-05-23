import {
  type JSX,
  Show,
  createContext,
  createSignal,
  mergeProps,
  splitProps,
  useContext,
} from "solid-js";
import {
  DropZone as HeadlessDropZone,
  type DropZoneProps as HeadlessDropZoneProps,
  type DropZoneRenderProps,
} from "@proyecto-viviana/solidaria-components";
import { createStringFormatter } from "@proyecto-viviana/solidaria";
import { style, type StyleString } from "../s2-style";
import {
  getAllowedOverrides,
  type StylesPropWithHeight,
  type UnsafeClassName,
} from "../s2-internal/style-utils";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
  type SpectrumContextValue,
} from "../button/spectrum-context";
import { IllustratedMessageContext } from "../illustratedmessage";
import { s2IntlStrings } from "../intl";

export type DropZoneSize = "S" | "M" | "L";

export interface DropZoneProps extends Omit<
  HeadlessDropZoneProps,
  | "class"
  | "style"
  | "children"
  | "isDisabled"
  | "onHoverStart"
  | "onHoverEnd"
  | "onHoverChange"
  | "slot"
  | "ref"
> {
  /** The content to display in the DropZone. */
  children: JSX.Element;
  /** Whether the DropZone already contains a file. Shows the replace message while dragging. */
  isFilled?: boolean;
  /**
   * The message shown while dragging over a filled DropZone.
   * @default 'Drop file to replace'
   */
  replaceMessage?: string;
  /**
   * The DropZone size.
   * @default 'M'
   */
  size?: DropZoneSize;
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StylesPropWithHeight | (() => StyleString | undefined);
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: UnsafeClassName | string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  slot?: string | null;
  ref?: RefLike<HTMLDivElement>;
}

export const DropZoneContext = createContext<SpectrumContextValue<DropZoneProps>>(null);

const dropzone = style<DropZoneRenderProps>(
  {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    fontFamily: "sans",
    color: "gray-900" as never,
    borderStyle: {
      default: "dashed",
      isDropTarget: "solid",
    },
    backgroundColor: {
      isDropTarget: "blue-200" as never,
    },
    borderWidth: 2,
    borderColor: {
      default: "gray-300" as never,
      isDropTarget: "blue-800" as never,
      isFocusVisible: "blue-800" as never,
    },
    borderRadius: "lg",
    padding: 24,
    boxSizing: "border-box",
  },
  getAllowedOverrides({ height: true }),
);

const banner = style<{ size: DropZoneSize }>({
  position: "absolute",
  left: 0,
  right: 0,
  marginX: "auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 20,
  width: "fit",
  maxWidth: {
    default: 192,
    size: {
      S: 160,
      L: 208,
    },
  },
  backgroundColor: "accent",
  borderRadius: "default",
  color: "white",
  fontWeight: "bold",
  padding: "[calc((self(minHeight))/1.5)]",
});

/**
 * A drop zone is an area into which one or multiple objects can be dragged and dropped.
 */
export function DropZone(props: DropZoneProps): JSX.Element {
  const contextProps = getSlottedContextProps(useContext(DropZoneContext), props.slot);
  const merged = mergeProps(contextProps ?? {}, props);
  const [local, headlessProps] = splitProps(merged, [
    "children",
    "isFilled",
    "replaceMessage",
    "size",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "slot",
    "ref",
    "id",
    "aria-describedby",
    "aria-details",
  ]);
  const stringFormatter = createStringFormatter(s2IntlStrings, "@react-spectrum/s2");
  const size = () => local.size ?? "M";
  const [isDropTarget, setIsDropTarget] = createSignal(false);
  let previousIsDropTarget = false;
  const syncIsDropTarget = (nextIsDropTarget: boolean) => {
    if (previousIsDropTarget !== nextIsDropTarget) {
      previousIsDropTarget = nextIsDropTarget;
      setIsDropTarget(nextIsDropTarget);
    }
  };
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);

  return (
    <HeadlessDropZone
      {...headlessProps}
      ref={mergeContextRefs(
        (contextProps as { ref?: RefLike<HTMLDivElement> } | null)?.ref,
        props.ref,
      )}
      class={(renderProps) =>
        [
          contextProps?.UNSAFE_className,
          local.UNSAFE_className,
          dropzone(renderProps, mergedStyles()),
        ]
          .filter(Boolean)
          .join(" ")
      }
      style={mergedUnsafeStyle()}
      slot={local.slot ?? undefined}
    >
      {(renderProps) => {
        syncIsDropTarget(renderProps.isDropTarget);
        return (
          <>
            <IllustratedMessageContext.Provider
              value={{
                isInDropZone: true,
                get isDropTarget() {
                  return isDropTarget();
                },
                get size() {
                  return size();
                },
              }}
            >
              {local.children}
            </IllustratedMessageContext.Provider>
            <Show when={renderProps.isDropTarget && local.isFilled}>
              <div class={banner({ size: size() })}>
                <span>
                  {local.replaceMessage ?? stringFormatter().format("dropzone.replaceMessage")}
                </span>
              </div>
            </Show>
          </>
        );
      }}
    </HeadlessDropZone>
  );
}
