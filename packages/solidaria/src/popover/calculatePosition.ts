/**
 * Position calculation utilities for popovers and overlays.
 * Ported from @react-aria/overlays calculatePosition.ts
 */

// Types
export type Placement =
  | "bottom"
  | "bottom left"
  | "bottom right"
  | "bottom start"
  | "bottom end"
  | "top"
  | "top left"
  | "top right"
  | "top start"
  | "top end"
  | "left"
  | "left top"
  | "left bottom"
  | "right"
  | "right top"
  | "right bottom"
  | "start"
  | "start top"
  | "start bottom"
  | "end"
  | "end top"
  | "end bottom";

export type PlacementAxis = "top" | "bottom" | "left" | "right";
export type Axis = "top" | "left";
export type SizeAxis = "width" | "height";

interface Position {
  top?: number;
  left?: number;
  bottom?: number;
  right?: number;
}

interface Dimensions {
  width: number;
  height: number;
  totalWidth: number;
  totalHeight: number;
  top: number;
  left: number;
  scroll: Position;
}

interface ParsedPlacement {
  placement: PlacementAxis;
  crossPlacement: PlacementAxis | "center";
  axis: Axis;
  crossAxis: Axis;
  size: SizeAxis;
  crossSize: SizeAxis;
}

interface Offset {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface PositionOpts {
  arrowSize: number;
  placement: Placement;
  targetNode: Element;
  overlayNode: Element;
  scrollNode: Element;
  padding: number;
  shouldFlip: boolean;
  boundaryElement: Element;
  offset: number;
  crossOffset: number;
  maxHeight?: number;
  arrowBoundaryOffset?: number;
  /** Overrides the target element's measured rect (e.g. position relative to a cursor point). */
  targetRect?: Offset | null | undefined;
}

type HeightGrowthDirection = "top" | "bottom";

export interface PositionResult {
  position: Position;
  arrowOffsetLeft?: number;
  arrowOffsetTop?: number;
  triggerAnchorPoint: { x: number; y: number };
  maxHeight: number;
  placement: PlacementAxis;
}

// Constants
const AXIS: Record<string, Axis> = {
  top: "top",
  bottom: "top",
  left: "left",
  right: "left",
};

const FLIPPED_DIRECTION: Record<string, string> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

const CROSS_AXIS: Record<string, Axis> = {
  top: "left",
  left: "top",
};

const AXIS_SIZE: Record<string, SizeAxis> = {
  top: "height",
  left: "width",
};

const TOTAL_SIZE: Record<SizeAxis, "totalWidth" | "totalHeight"> = {
  width: "totalWidth",
  height: "totalHeight",
};

const PARSED_PLACEMENT_CACHE: Record<string, ParsedPlacement> = {};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function isWebKit(): boolean {
  return typeof window !== "undefined" && "WebkitAppearance" in document.documentElement.style;
}

const getVisualViewport = () => (typeof document !== "undefined" ? window.visualViewport : null);

function getContainerDimensions(
  containerNode: Element,
  visualViewport: VisualViewport | null,
): Dimensions {
  let width = 0,
    height = 0,
    totalWidth = 0,
    totalHeight = 0,
    top = 0,
    left = 0;
  const scroll: Position = {};
  const isPinchZoomedIn = (visualViewport?.scale ?? 1) > 1;

  if (containerNode.tagName === "BODY" || containerNode.tagName === "HTML") {
    const documentElement = document.documentElement;
    totalWidth = documentElement.clientWidth;
    totalHeight = documentElement.clientHeight;
    width = visualViewport?.width ?? totalWidth;
    height = visualViewport?.height ?? totalHeight;
    scroll.top = documentElement.scrollTop || (containerNode as HTMLElement).scrollTop;
    scroll.left = documentElement.scrollLeft || (containerNode as HTMLElement).scrollLeft;

    if (visualViewport) {
      top = visualViewport.offsetTop;
      left = visualViewport.offsetLeft;
    }
  } else {
    ({ width, height, top, left } = getElementOffset(containerNode, false));
    scroll.top = (containerNode as HTMLElement).scrollTop;
    scroll.left = (containerNode as HTMLElement).scrollLeft;
    totalWidth = width;
    totalHeight = height;
  }

  if (
    isWebKit() &&
    (containerNode.tagName === "BODY" || containerNode.tagName === "HTML") &&
    isPinchZoomedIn
  ) {
    scroll.top = 0;
    scroll.left = 0;
    top = visualViewport?.pageTop ?? 0;
    left = visualViewport?.pageLeft ?? 0;
  }

  return { width, height, totalWidth, totalHeight, scroll, top, left };
}

function getScroll(node: Element): Offset {
  return {
    top: (node as HTMLElement).scrollTop,
    left: (node as HTMLElement).scrollLeft,
    width: (node as HTMLElement).scrollWidth,
    height: (node as HTMLElement).scrollHeight,
  };
}

function getDelta(
  axis: Axis,
  offset: number,
  size: number,
  boundaryDimensions: Dimensions,
  containerDimensions: Dimensions,
  padding: number,
  containerOffsetWithBoundary: Offset,
): number {
  const containerScroll = containerDimensions.scroll[axis] ?? 0;
  const boundarySize = boundaryDimensions[AXIS_SIZE[axis]];

  const boundaryStartEdge =
    containerOffsetWithBoundary[axis] + (boundaryDimensions.scroll[AXIS[axis]] ?? 0) + padding;
  const boundaryEndEdge =
    containerOffsetWithBoundary[axis] +
    (boundaryDimensions.scroll[AXIS[axis]] ?? 0) +
    boundarySize -
    padding;

  const startEdgeOffset =
    offset -
    containerScroll +
    (boundaryDimensions.scroll[AXIS[axis]] ?? 0) +
    containerOffsetWithBoundary[axis] -
    boundaryDimensions[AXIS[axis]];
  const endEdgeOffset =
    offset -
    containerScroll +
    size +
    (boundaryDimensions.scroll[AXIS[axis]] ?? 0) +
    containerOffsetWithBoundary[axis] -
    boundaryDimensions[AXIS[axis]];

  if (startEdgeOffset < boundaryStartEdge) {
    return boundaryStartEdge - startEdgeOffset;
  } else if (endEdgeOffset > boundaryEndEdge) {
    return Math.max(boundaryEndEdge - endEdgeOffset, boundaryStartEdge - startEdgeOffset);
  } else {
    return 0;
  }
}

function getMargins(node: Element): Position {
  const style = window.getComputedStyle(node);
  return {
    top: parseInt(style.marginTop, 10) || 0,
    bottom: parseInt(style.marginBottom, 10) || 0,
    left: parseInt(style.marginLeft, 10) || 0,
    right: parseInt(style.marginRight, 10) || 0,
  };
}

function parsePlacement(input: Placement): ParsedPlacement {
  if (PARSED_PLACEMENT_CACHE[input]) {
    return PARSED_PLACEMENT_CACHE[input];
  }

  const [placement, crossPlacement] = input.split(" ") as [PlacementAxis, string?];
  const resolvedCrossPlacementInput = crossPlacement ?? "center";
  const axis: Axis = AXIS[placement] || "right";
  const crossAxis: Axis = CROSS_AXIS[axis];

  let resolvedCrossPlacement: PlacementAxis | "center" = "center";
  if (AXIS[resolvedCrossPlacementInput]) {
    resolvedCrossPlacement = resolvedCrossPlacementInput as PlacementAxis;
  }

  const size = AXIS_SIZE[axis];
  const crossSize = AXIS_SIZE[crossAxis];
  PARSED_PLACEMENT_CACHE[input] = {
    placement,
    crossPlacement: resolvedCrossPlacement,
    axis,
    crossAxis,
    size,
    crossSize,
  };
  return PARSED_PLACEMENT_CACHE[input];
}

function computePosition(
  childOffset: Offset,
  _boundaryDimensions: Dimensions,
  overlaySize: Offset,
  placementInfo: ParsedPlacement,
  offset: number,
  crossOffset: number,
  _containerOffsetWithBoundary: Offset,
  isContainerPositioned: boolean,
  arrowSize: number,
  arrowBoundaryOffset: number,
  containerDimensions: Dimensions,
): Position {
  const { placement, crossPlacement, axis, crossAxis, size, crossSize } = placementInfo;
  const position: Position = {};

  position[crossAxis] = childOffset[crossAxis] ?? 0;
  if (crossPlacement === "center") {
    position[crossAxis]! += ((childOffset[crossSize] ?? 0) - (overlaySize[crossSize] ?? 0)) / 2;
  } else if (crossPlacement !== crossAxis) {
    position[crossAxis]! += (childOffset[crossSize] ?? 0) - (overlaySize[crossSize] ?? 0);
  }

  position[crossAxis]! += crossOffset;

  const minPosition =
    childOffset[crossAxis] - overlaySize[crossSize] + arrowSize + arrowBoundaryOffset;
  const maxPosition =
    childOffset[crossAxis] + childOffset[crossSize] - arrowSize - arrowBoundaryOffset;
  position[crossAxis] = clamp(position[crossAxis]!, minPosition, maxPosition);

  if (placement === axis) {
    const containerHeight = isContainerPositioned
      ? containerDimensions[size]
      : containerDimensions[TOTAL_SIZE[size]];
    position[FLIPPED_DIRECTION[axis] as keyof Position] = Math.floor(
      containerHeight - childOffset[axis] + offset,
    );
  } else {
    position[axis] = Math.floor(childOffset[axis] + childOffset[size] + offset);
  }
  return position;
}

function getMaxHeight(
  position: Position,
  boundaryDimensions: Dimensions,
  containerOffsetWithBoundary: Offset,
  _isContainerPositioned: boolean,
  margins: Position,
  padding: number,
  overlayHeight: number,
  heightGrowthDirection: HeightGrowthDirection,
  containerDimensions: Dimensions,
  isContainerDescendentOfBoundary: boolean,
  visualViewport: VisualViewport | null,
): number {
  const overlayTop =
    (position.top != null
      ? position.top
      : containerDimensions[TOTAL_SIZE.height] - (position.bottom ?? 0) - overlayHeight) -
    (containerDimensions.scroll.top ?? 0);

  const boundaryToContainerTransformOffset = isContainerDescendentOfBoundary
    ? containerOffsetWithBoundary.top
    : 0;
  const boundingRect = {
    top: Math.max(
      boundaryDimensions.top + boundaryToContainerTransformOffset,
      (visualViewport?.offsetTop ?? boundaryDimensions.top) + boundaryToContainerTransformOffset,
    ),
    bottom: Math.min(
      boundaryDimensions.top + boundaryDimensions.height + boundaryToContainerTransformOffset,
      (visualViewport?.offsetTop ?? 0) + (visualViewport?.height ?? 0),
    ),
  };

  const maxHeight =
    heightGrowthDirection !== "top"
      ? Math.max(
          0,
          boundingRect.bottom - overlayTop - ((margins.top ?? 0) + (margins.bottom ?? 0) + padding),
        )
      : Math.max(
          0,
          overlayTop +
            overlayHeight -
            boundingRect.top -
            ((margins.top ?? 0) + (margins.bottom ?? 0) + padding),
        );
  return maxHeight;
}

function getAvailableSpace(
  boundaryDimensions: Dimensions,
  containerOffsetWithBoundary: Offset,
  childOffset: Offset,
  margins: Position,
  padding: number,
  placementInfo: ParsedPlacement,
  containerDimensions: Dimensions,
  isContainerDescendentOfBoundary: boolean,
): number {
  const { placement, axis, size } = placementInfo;
  if (placement === axis) {
    return Math.max(
      0,
      childOffset[axis] -
        (containerDimensions.scroll[axis] ?? 0) -
        (boundaryDimensions[axis] +
          (isContainerDescendentOfBoundary ? containerOffsetWithBoundary[axis] : 0)) -
        (margins[axis] ?? 0) -
        (margins[FLIPPED_DIRECTION[axis] as keyof Position] ?? 0) -
        padding,
    );
  }

  return Math.max(
    0,
    boundaryDimensions[size] +
      boundaryDimensions[axis] +
      (isContainerDescendentOfBoundary ? containerOffsetWithBoundary[axis] : 0) -
      childOffset[axis] -
      childOffset[size] +
      (containerDimensions.scroll[axis] ?? 0) -
      (margins[axis] ?? 0) -
      (margins[FLIPPED_DIRECTION[axis] as keyof Position] ?? 0) -
      padding,
  );
}

export function calculatePositionInternal(
  placementInput: Placement,
  childOffset: Offset,
  overlaySize: Offset,
  _scrollSize: Offset,
  margins: Position,
  padding: number,
  flip: boolean,
  boundaryDimensions: Dimensions,
  containerDimensions: Dimensions,
  containerOffsetWithBoundary: Offset,
  offset: number,
  crossOffset: number,
  isContainerPositioned: boolean,
  userSetMaxHeight: number | undefined,
  arrowSize: number,
  arrowBoundaryOffset: number,
  isContainerDescendentOfBoundary: boolean,
  visualViewport: VisualViewport | null,
): PositionResult {
  let placementInfo = parsePlacement(placementInput);
  let { size, crossAxis, crossSize, placement, crossPlacement } = placementInfo;
  let position = computePosition(
    childOffset,
    boundaryDimensions,
    overlaySize,
    placementInfo,
    offset,
    crossOffset,
    containerOffsetWithBoundary,
    isContainerPositioned,
    arrowSize,
    arrowBoundaryOffset,
    containerDimensions,
  );
  let normalizedOffset = offset;
  const space = getAvailableSpace(
    boundaryDimensions,
    containerOffsetWithBoundary,
    childOffset,
    margins,
    padding + offset,
    placementInfo,
    containerDimensions,
    isContainerDescendentOfBoundary,
  );

  if (flip && overlaySize[size] > space) {
    const flippedPlacementInfo = parsePlacement(
      `${FLIPPED_DIRECTION[placement]} ${crossPlacement}` as Placement,
    );
    const flippedPosition = computePosition(
      childOffset,
      boundaryDimensions,
      overlaySize,
      flippedPlacementInfo,
      offset,
      crossOffset,
      containerOffsetWithBoundary,
      isContainerPositioned,
      arrowSize,
      arrowBoundaryOffset,
      containerDimensions,
    );

    const flippedSpace = getAvailableSpace(
      boundaryDimensions,
      containerOffsetWithBoundary,
      childOffset,
      margins,
      padding + offset,
      flippedPlacementInfo,
      containerDimensions,
      isContainerDescendentOfBoundary,
    );

    if (flippedSpace > space) {
      placementInfo = flippedPlacementInfo;
      position = flippedPosition;
      normalizedOffset = offset;
    }
  }

  let heightGrowthDirection: HeightGrowthDirection = "bottom";
  if (placementInfo.axis === "top") {
    if (placementInfo.placement === "top") {
      heightGrowthDirection = "top";
    } else if (placementInfo.placement === "bottom") {
      heightGrowthDirection = "bottom";
    }
  } else if (placementInfo.crossAxis === "top") {
    if (placementInfo.crossPlacement === "top") {
      heightGrowthDirection = "bottom";
    } else if (placementInfo.crossPlacement === "bottom") {
      heightGrowthDirection = "top";
    }
  }

  let delta = getDelta(
    crossAxis,
    position[crossAxis]!,
    overlaySize[crossSize],
    boundaryDimensions,
    containerDimensions,
    padding,
    containerOffsetWithBoundary,
  );
  position[crossAxis]! += delta;

  let maxHeight = getMaxHeight(
    position,
    boundaryDimensions,
    containerOffsetWithBoundary,
    isContainerPositioned,
    margins,
    padding,
    overlaySize.height,
    heightGrowthDirection,
    containerDimensions,
    isContainerDescendentOfBoundary,
    visualViewport,
  );

  if (userSetMaxHeight && userSetMaxHeight < maxHeight) {
    maxHeight = userSetMaxHeight;
  }

  overlaySize.height = Math.min(overlaySize.height, maxHeight);

  position = computePosition(
    childOffset,
    boundaryDimensions,
    overlaySize,
    placementInfo,
    normalizedOffset,
    crossOffset,
    containerOffsetWithBoundary,
    isContainerPositioned,
    arrowSize,
    arrowBoundaryOffset,
    containerDimensions,
  );
  delta = getDelta(
    crossAxis,
    position[crossAxis]!,
    overlaySize[crossSize],
    boundaryDimensions,
    containerDimensions,
    padding,
    containerOffsetWithBoundary,
  );
  position[crossAxis]! += delta;

  const arrowPosition: Position = {};

  ({ placement, crossPlacement } = placementInfo);
  let origin = childOffset[crossAxis] - position[crossAxis]! - (margins[AXIS[crossAxis]] ?? 0);
  let preferredArrowPosition = origin + 0.5 * childOffset[crossSize];

  const arrowMinPosition = arrowSize / 2 + arrowBoundaryOffset;
  const overlayMargin =
    AXIS[crossAxis] === "left"
      ? (margins.left ?? 0) + (margins.right ?? 0)
      : (margins.top ?? 0) + (margins.bottom ?? 0);
  const arrowMaxPosition =
    overlaySize[crossSize] - overlayMargin - arrowSize / 2 - arrowBoundaryOffset;

  const arrowOverlappingChildMinEdge =
    childOffset[crossAxis] +
    arrowSize / 2 -
    (position[crossAxis]! + (margins[AXIS[crossAxis]] ?? 0));
  const arrowOverlappingChildMaxEdge =
    childOffset[crossAxis] +
    childOffset[crossSize] -
    arrowSize / 2 -
    (position[crossAxis]! + (margins[AXIS[crossAxis]] ?? 0));

  const arrowPositionOverlappingChild = clamp(
    preferredArrowPosition,
    arrowOverlappingChildMinEdge,
    arrowOverlappingChildMaxEdge,
  );
  arrowPosition[crossAxis] = clamp(
    arrowPositionOverlappingChild,
    arrowMinPosition,
    arrowMaxPosition,
  );

  if (arrowSize) {
    origin = arrowPosition[crossAxis]!;
  } else if (crossPlacement === "right" || crossPlacement === "bottom") {
    origin += childOffset[crossSize];
  } else if (crossPlacement === "center") {
    origin += childOffset[crossSize] / 2;
  }

  const crossOrigin = placement === "left" || placement === "top" ? overlaySize[size] : 0;
  const triggerAnchorPoint = {
    x: placement === "top" || placement === "bottom" ? origin : crossOrigin,
    y: placement === "left" || placement === "right" ? origin : crossOrigin,
  };

  return {
    position,
    maxHeight: maxHeight,
    arrowOffsetLeft: arrowPosition.left,
    arrowOffsetTop: arrowPosition.top,
    placement,
    triggerAnchorPoint,
  };
}

export function getRect(node: Element, ignoreScale: boolean) {
  const { top, left, width: bWidth, height: bHeight } = node.getBoundingClientRect();
  let width = bWidth;
  let height = bHeight;

  if (ignoreScale && node instanceof (node.ownerDocument.defaultView?.HTMLElement ?? HTMLElement)) {
    width = (node as HTMLElement).offsetWidth;
    height = (node as HTMLElement).offsetHeight;
  }

  return { top, left, width, height };
}

function getElementOffset(
  node: Element,
  ignoreScale: boolean,
  overrideRect?: Offset | null,
): Offset {
  const { top, left, width, height } = overrideRect || getRect(node, ignoreScale);
  const { scrollTop, scrollLeft, clientTop, clientLeft } = document.documentElement;
  return {
    top: top + scrollTop - clientTop,
    left: left + scrollLeft - clientLeft,
    width,
    height,
  };
}

function getPosition(
  node: Element,
  parent: Element,
  ignoreScale: boolean,
  overrideRect?: Offset | null,
): Offset {
  const style = window.getComputedStyle(node);
  let offset: Offset;
  if (style.position === "fixed") {
    offset = overrideRect || getRect(node, ignoreScale);
  } else {
    offset = getElementOffset(node, ignoreScale, overrideRect);
    const parentOffset = getElementOffset(parent, ignoreScale);
    const parentStyle = window.getComputedStyle(parent);
    parentOffset.top +=
      (parseInt(parentStyle.borderTopWidth, 10) || 0) - (parent as HTMLElement).scrollTop;
    parentOffset.left +=
      (parseInt(parentStyle.borderLeftWidth, 10) || 0) - (parent as HTMLElement).scrollLeft;
    offset.top -= parentOffset.top;
    offset.left -= parentOffset.left;
  }

  offset.top -= parseInt(style.marginTop, 10) || 0;
  offset.left -= parseInt(style.marginLeft, 10) || 0;
  return offset;
}

function getContainingBlock(node: HTMLElement): Element {
  let offsetParent = node.offsetParent;

  if (
    offsetParent &&
    offsetParent === document.body &&
    window.getComputedStyle(offsetParent).position === "static" &&
    !isContainingBlock(offsetParent)
  ) {
    offsetParent = document.documentElement;
  }

  if (offsetParent == null) {
    offsetParent = node.parentElement;
    while (offsetParent && !isContainingBlock(offsetParent)) {
      offsetParent = offsetParent.parentElement;
    }
  }

  return offsetParent || document.documentElement;
}

function isContainingBlock(node: Element): boolean {
  const style = window.getComputedStyle(node);
  return (
    style.transform !== "none" ||
    /transform|perspective/.test(style.willChange) ||
    style.filter !== "none" ||
    style.contain === "paint" ||
    ("backdropFilter" in style && style.getPropertyValue("backdrop-filter") !== "none") ||
    ("WebkitBackdropFilter" in style &&
      style.getPropertyValue("-webkit-backdrop-filter") !== "none")
  );
}

/**
 * Determines where to place the overlay with regards to the target and the position of an optional indicator.
 */
export function calculatePosition(opts: PositionOpts): PositionResult {
  const {
    placement,
    targetNode,
    overlayNode,
    scrollNode,
    padding,
    shouldFlip,
    boundaryElement,
    offset,
    crossOffset,
    maxHeight,
    arrowSize,
    arrowBoundaryOffset = 0,
    targetRect,
  } = opts;

  const visualViewport = getVisualViewport();
  const container =
    overlayNode instanceof HTMLElement ? getContainingBlock(overlayNode) : document.documentElement;
  const isViewportContainer = container === document.documentElement;
  const containerPositionStyle = window.getComputedStyle(container).position;
  const isContainerPositioned = !!containerPositionStyle && containerPositionStyle !== "static";
  const childOffset: Offset = isViewportContainer
    ? getElementOffset(targetNode, false, targetRect)
    : getPosition(targetNode, container, false, targetRect);

  if (!isViewportContainer) {
    const { marginTop, marginLeft } = window.getComputedStyle(targetNode);
    childOffset.top += parseInt(marginTop, 10) || 0;
    childOffset.left += parseInt(marginLeft, 10) || 0;
  }

  const overlaySize: Offset = getElementOffset(overlayNode, true);
  const margins = getMargins(overlayNode);
  overlaySize.width += (margins.left ?? 0) + (margins.right ?? 0);
  overlaySize.height += (margins.top ?? 0) + (margins.bottom ?? 0);

  const scrollSize = getScroll(scrollNode);
  const boundaryDimensions = getContainerDimensions(boundaryElement, visualViewport);
  const containerDimensions = getContainerDimensions(container, visualViewport);
  const containerOffsetWithBoundary: Offset = getPosition(boundaryElement, container, false);

  const isContainerDescendentOfBoundary = boundaryElement.contains(container);
  return calculatePositionInternal(
    placement,
    childOffset,
    overlaySize,
    scrollSize,
    margins,
    padding,
    shouldFlip,
    boundaryDimensions,
    containerDimensions,
    containerOffsetWithBoundary,
    offset,
    crossOffset,
    isContainerPositioned,
    maxHeight,
    arrowSize,
    arrowBoundaryOffset,
    isContainerDescendentOfBoundary,
    visualViewport,
  );
}
