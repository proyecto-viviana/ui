/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/tokenfield/useTokenField.ts

/**
 * Provides the behavior and accessibility implementation for a token field.
 * A token field allows users to enter text with inline tokens.
 */

import { createEffect, createMemo, onCleanup, type JSX } from "solid-js";
import { announce } from "../live-announcer";
import { createField, type AriaLabelingProps } from "../label";
import {
  createFocusable,
  createKeyboard,
  setInteractionModality,
  type FocusableProps,
} from "../interactions";
import { getActiveElement, getOwnerDocument, isMac, mergeProps } from "../utils";
import { useLocale } from "../i18n";
import {
  TokenFieldValue,
  type Position,
  type TokenFieldSegment,
  type TokenFieldState,
} from "@proyecto-viviana/solid-stately";

export interface AriaTokenFieldProps<T extends TokenFieldValue = TokenFieldValue>
  extends FocusableProps, AriaLabelingProps {
  /** The current value (controlled). */
  value?: T;
  /** The default value (uncontrolled). */
  defaultValue?: T;
  /** Handler that is called when the value changes. */
  onChange?: (value: T) => void;
  /**
   * The accessibility role of the token field.
   *
   * @default 'textbox'
   */
  role?: "textbox" | "searchbox" | "combobox";
  /** Whether the token field allows newlines. */
  allowsNewlines?: boolean;
  /** Whether the token field is read only. */
  isReadOnly?: boolean;
  /** Whether the token field is disabled. */
  isDisabled?: boolean;
  /** A function that is called when the user presses the Enter key. */
  onSubmit?: () => void;
  /** Handler that is called when a key is pressed. */
  onKeyDown?: (e: KeyboardEvent) => void;
  /** Handler that is called when a key is released. */
  onKeyUp?: (e: KeyboardEvent) => void;
  /** Handler that is called when the user copies text. */
  onCopy?: JSX.EventHandlerUnion<HTMLDivElement, ClipboardEvent>;
  /** Handler that is called when the user cuts text. */
  onCut?: JSX.EventHandlerUnion<HTMLDivElement, ClipboardEvent>;
  /** Handler that is called when the user pastes text. */
  onPaste?: JSX.EventHandlerUnion<HTMLDivElement, ClipboardEvent>;
}

export interface TokenFieldAria {
  /** Props for the token field's input element. */
  tokenFieldProps: JSX.HTMLAttributes<HTMLDivElement>;
  /** Props for the text field's visible label element, if any. */
  labelProps: JSX.HTMLAttributes<HTMLElement>;
  /** Props for the text field's description element, if any. */
  descriptionProps: JSX.HTMLAttributes<HTMLElement>;
}

const CLIPBOARD_MIME_TYPE = "application/vnd.react-aria.tokens+json";

function bindNativeEvent(
  getEl: () => EventTarget | null,
  type: string,
  handler: (e: Event) => void,
): void {
  createEffect(() => {
    const el = getEl();
    if (!el) return;
    el.addEventListener(type, handler);
    onCleanup(() => el.removeEventListener(type, handler));
  });
}

/**
 * Provides the behavior and accessibility implementation for a token field.
 */
export function createTokenField<T extends TokenFieldValue = TokenFieldValue>(
  props: AriaTokenFieldProps<T>,
  state: TokenFieldState<T>,
  getRef: () => HTMLDivElement | null,
): TokenFieldAria {
  const role = () => props.role ?? "textbox";
  const multiline = () => props.allowsNewlines ?? false;
  const isReadOnly = () => props.isReadOnly ?? false;
  const isDisabled = () => props.isDisabled ?? false;
  const ariaDetails = () => props["aria-details"];

  const value = () => state.value();
  const locale = useLocale();
  const graphemeSegmenter = createMemo(
    () => new Intl.Segmenter(locale().locale, { granularity: "grapheme" }),
  );
  const wordSegmenter = createMemo(
    () => new Intl.Segmenter(locale().locale, { granularity: "word" }),
  );

  let dropPosition: Position | null = null;
  let transferredData: TokenFieldSegment[] | null = null;
  let nextValue: T | null = null;

  let apply = (fn: (value: T) => TokenFieldValue) => {
    state.setValue((current) => {
      const newValue = fn(current) as T;
      nextValue = newValue;
      return newValue;
    });
  };

  // Composition events are not cancelable. The browser will mutate the DOM, making it out of sync with React.
  // To account for this, we prevent React from re-rendering during composition, and track DOM mutations performed
  // by the browser. When composition ends, we revert the DOM to its original state, and re-render with React.
  // Mutating the DOM in any way during composition breaks the IME, causing composition to end unexpectedly.
  // During composition, we still emit updates via onChange to ensure that things like autocomplete work,
  // but we don't actually re-render to the DOM unless the value changes from what we expect (e.g. inserting a completion).
  const mutationTracker = createMutationTracker(getRef);
  let startComposition = () => {
    mutationTracker.start();
    state.setComposing(true);
  };
  let stopComposition = () => {
    mutationTracker.stop();
    state.setComposing(false);
  };

  bindNativeEvent(getRef, "compositionstart", () => {
    startComposition();

    let range = window.getSelection()?.getRangeAt(0);
    if (range) {
      let [start, end] = rangeToPositions(getRef()!, range);

      // Normalize the range to ensure it is not inside a token, otherwise the browser
      // will attempt to insert the composed text into the token instead of replacing it.
      let r = createDOMRange(getRef()!, start, end);
      if (r.startContainer !== range.startContainer || r.startOffset !== range.startOffset) {
        range.setStart(r.startContainer, r.startOffset);
      }
      if (r.endContainer !== range.endContainer || r.endOffset !== range.endOffset) {
        range.setEnd(r.endContainer, r.endOffset);
      }
    }
  });

  bindNativeEvent(getRef, "compositionend", stopComposition);

  // If a prop update occurs during composition that doesn't match the expected value,
  // end composition and re-render the controlled value.
  createEffect(() => {
    if (state.isComposing() && value() !== nextValue) {
      stopComposition();
    }
    nextValue = value();
  });

  let caretPosition: Position | null = null;
  createEffect(() => {
    const el = getRef();
    const caret = value().caretPosition;
    if (el && caret && !state.isComposing() && value().caretPosition !== caretPosition) {
      // Only move the caret when the field is already focused.
      if (el === getActiveElement(getOwnerDocument(el))) {
        setCursor(el, caret);
      }
      caretPosition = value().caretPosition;
    }
  });

  // Handle text editing commands and prevent browser default behavior.
  bindNativeEvent(getRef, "beforeinput", (raw) => {
    const e = raw as InputEvent;
    // Android sometimes doesn't fire a compositionend event before a regular input event.
    if (state.isComposing() && !e.isComposing) {
      stopComposition();
    }

    let selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }
    let range = selection.getRangeAt(0);
    let [start, end] = rangeToPositions(getRef()!, range);

    // https://www.w3.org/TR/input-events-2/#interface-InputEvent-Attributes
    switch (e.inputType) {
      case "insertText":
      case "insertReplacementText":
      case "insertCompositionText":
      case "insertFromComposition": // Removed from the spec, but still fired by Safari.
      case "insertFromPaste":
      case "insertFromYank":
      case "insertFromDrop": {
        let data: TokenFieldSegment[] = [{ type: "text", text: e.data ?? "" }];
        if (transferredData) {
          data = transferredData;
          transferredData = null;
        } else if (e.dataTransfer) {
          let parsed = e.dataTransfer.types.includes(CLIPBOARD_MIME_TYPE)
            ? parseSegments(e.dataTransfer.getData(CLIPBOARD_MIME_TYPE))
            : null;
          if (parsed) {
            data = parsed;
          } else if (e.dataTransfer.types.includes("text/plain")) {
            data[0].text = e.dataTransfer.getData("text/plain");
          }
        }

        if (e.inputType === "insertFromDrop" && dropPosition) {
          start = end = dropPosition;
          dropPosition = null;
        }

        if (!multiline) {
          for (let segment of data) {
            segment.text = segment.text.replace(/[\r\n]+/g, " ");
          }
        }

        apply((tokens) =>
          tokens.replaceRangeWithSegments(
            start,
            end,
            data,
            // Don't coalesce paste/drop events with other edits.
            e.inputType === "insertText" ||
              e.inputType === "insertCompositionText" ||
              e.inputType === "insertFromComposition",
          ),
        );
        break;
      }
      case "insertParagraph": {
        if (props.onSubmit) {
          props.onSubmit();
          break;
        }
        if (multiline()) {
          apply((tokens) => tokens.replaceRange(start, end, "\n"));
        }
        break;
      }
      case "insertLineBreak": {
        if (multiline()) {
          apply((tokens) => tokens.replaceRange(start, end, "\n"));
        }
        break;
      }
      case "deleteContentBackward":
      case "deleteContentForward":
      case "deleteWordBackward":
      case "deleteWordForward":
      case "deleteHardLineForward":
      case "deleteHardLineBackward":
      case "deleteSoftLineForward":
      case "deleteSoftLineBackward":
      case "deleteContent":
      case "deleteByCut":
      case "deleteCompositionText": {
        if (!range.collapsed) {
          apply((tokens) => tokens.replaceRange(start, end, ""));
          break;
        }

        switch (e.inputType) {
          case "deleteContentBackward": {
            apply((tokens) =>
              tokens.delete(start, graphemeSegmenter(), TokenFieldValue.Direction.Backward),
            );
            break;
          }
          case "deleteContentForward":
            apply((tokens) =>
              tokens.delete(start, graphemeSegmenter(), TokenFieldValue.Direction.Forward),
            );
            break;
          case "deleteWordBackward": {
            apply((tokens) =>
              tokens.delete(start, wordSegmenter(), TokenFieldValue.Direction.Backward),
            );
            break;
          }
          case "deleteWordForward":
            apply((tokens) =>
              tokens.delete(start, wordSegmenter(), TokenFieldValue.Direction.Forward),
            );
            break;
          case "deleteHardLineForward":
          case "deleteSoftLineForward": // TODO: this usually deletes to the nearest *visual* line break rather than a hard break
            apply((tokens) => tokens.deleteLine(start, TokenFieldValue.Direction.Forward));
            break;
          case "deleteHardLineBackward":
          case "deleteSoftLineBackward":
            apply((tokens) => tokens.deleteLine(start, TokenFieldValue.Direction.Backward));
            break;
        }
        break;
      }
      case "deleteByDrag": {
        apply((tokens) => {
          let endOffset =
            start.index === end.index ? end.offset : tokens.segments[start.index].text.length;
          let change = tokens.replaceRange(start, end, "");
          if (
            dropPosition &&
            dropPosition.index === start.index &&
            dropPosition.offset >= start.offset
          ) {
            dropPosition.offset -= endOffset - start.offset;
          }

          return change;
        });
        break;
      }
    }

    e.preventDefault();
  });

  let writeClipboardData = (e: ClipboardEvent | DragEvent) => {
    if ("clipboardData" in e) {
      e.preventDefault();
    }
    let selection = getSelection(getRef()!);
    if (!selection) {
      return;
    }
    let [start, end] = selection;
    let slice = value().slice(start, end);
    let dataTransfer = "clipboardData" in e ? e.clipboardData : e.dataTransfer;
    dataTransfer?.setData(CLIPBOARD_MIME_TYPE, JSON.stringify(slice.segments));
    dataTransfer?.setData("text/plain", slice.toString());

    if (e.type === "cut") {
      apply((tokens) => tokens.replaceRange(start, end, "", false));
    }
  };

  bindNativeEvent(getRef, "copy", (e) => writeClipboardData(e as ClipboardEvent | DragEvent));
  bindNativeEvent(getRef, "cut", writeClipboardData as (e: Event) => void);
  bindNativeEvent(getRef, "dragstart", (e) => writeClipboardData(e as ClipboardEvent | DragEvent));
  bindNativeEvent(getRef, "paste", (raw) => {
    const e = raw as ClipboardEvent;
    // Safari doesn't pass the custom clipboard data type to beforeinput dataTransfer so we handle it here.
    if (e.clipboardData && e.clipboardData.types.includes(CLIPBOARD_MIME_TYPE)) {
      transferredData = parseSegments(e.clipboardData.getData(CLIPBOARD_MIME_TYPE));
    }
  });

  // Store the cursor position on drop so we know where to insert when the insertFromDrop event occurs.
  bindNativeEvent(getRef, "drop", (raw) => {
    const e = raw as DragEvent;
    if (typeof document.caretPositionFromPoint === "function") {
      let pos = document.caretPositionFromPoint(e.clientX, e.clientY);
      if (pos) {
        dropPosition = getPosition(getRef()!, pos.offsetNode, pos.offset);
      }
    } else if (typeof document.caretRangeFromPoint === "function") {
      let range = document.caretRangeFromPoint(e.clientX, e.clientY);
      if (range) {
        dropPosition = getPosition(getRef()!, range.startContainer, range.startOffset);
      }
    }

    if (e.dataTransfer && e.dataTransfer.types.includes(CLIPBOARD_MIME_TYPE)) {
      transferredData = parseSegments(e.dataTransfer.getData(CLIPBOARD_MIME_TYPE));
    }
  });

  bindSelectionChange(getRef, () => {
    if (state.isComposing()) {
      return;
    }

    value().endCoalescing();

    // When the cursor moves next to a token, announce it.
    // Otherwise the screen reader will only announce the first/last character.
    if (window.getSelection()?.isCollapsed) {
      let [start, end] = getSelection(getRef()!)!;
      if (start.offset === 0) {
        let segment = value().segments[start.index];
        if (segment?.type !== "token") {
          segment = value().segments[start.index - 1];
        }
        if (segment?.type === "token") {
          announce(segment.text, "assertive");
        }

        // Update the caret position in the value.
        state.setValue((value) => value.withCaretPosition(end));
      }
    }
  });

  // Override the default triple click behavior to ensure that tokens get selected.
  // Some browsers only select the text between tokens instead of the entire line.
  bindNativeEvent(getRef, "mousedown", (raw) => {
    const e = raw as MouseEvent;
    if (e.detail === 3) {
      let selection = getSelection(getRef()!);
      if (!selection) {
        return;
      }

      let start = value().findLineBoundary(selection[0], TokenFieldValue.Direction.Backward);
      let end = value().findLineBoundary(selection[1], TokenFieldValue.Direction.Forward);
      if (start && end) {
        e.preventDefault();
        setTokenFieldSelection(getRef()!, start, end, true);
      }
    }
  });

  let moveSelection = (
    direction: "left" | "right",
    granularity: "character" | "word",
    extend = false,
  ) => {
    let selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !selection.focusNode || !selection.anchorNode) {
      return false;
    }

    // Pressing an arrow with a non-empty selection collapses it to the corresponding edge.
    // The browser handles this natively.
    if (!extend && !selection.isCollapsed) {
      return false;
    }

    // Move the caret using the browser's native caret movement (Selection.modify) so that
    // bidirectional text is handled correctly. Repeat until the position actually changes
    // to account for the zero width spaces around tokens.
    let pos = getPosition(getRef()!, selection.focusNode, selection.focusOffset);
    while (true) {
      const focusNode: Node | null = selection.focusNode;
      const focusOffset = selection.focusOffset;
      selection.modify(extend ? "extend" : "move", direction, granularity);
      if (selection.focusNode === focusNode && selection.focusOffset === focusOffset) {
        return false;
      }
      let newPos = getPosition(getRef()!, selection.focusNode, selection.focusOffset);
      if (!isSamePosition(pos, newPos)) {
        return true;
      }
    }
  };

  // macOS supports additional keyboard shortcuts for text editing.
  // We need to handle these manually so they behave consistently with tokens.
  // https://support.apple.com/en-us/102650#text
  let macShortcuts: Record<string, () => boolean | void> = isMac()
    ? {
        "Control+a": () => {
          return shortcuts.Home();
        },
        "Control+e": () => {
          return shortcuts.End();
        },
        "Control+f": () => {
          return shortcuts.ArrowRight();
        },
        "Control+b": () => {
          return shortcuts.ArrowLeft();
        },
      }
    : {};

  let mod = isMac() ? "Meta" : "Control";
  let wordModKey = isMac() ? "Alt" : "Control";
  let shortcuts: Record<string, () => boolean | void> = {
    ...macShortcuts,
    [`${mod}+z`]: () => {
      // If composing, the browser handles undo natively.
      if (state.isComposing()) {
        return false;
      }
      apply((state) => state.undo());
    },
    [isMac() ? "Shift+Meta+z" : "Control+y"]: () => {
      if (state.isComposing()) {
        return false;
      }
      apply((state) => state.redo());
    },
    ArrowLeft: () => {
      return moveSelection("left", "character");
    },
    [`${wordModKey}+ArrowLeft`]: () => {
      return moveSelection("left", "word");
    },
    "Shift+ArrowLeft": () => {
      return moveSelection("left", "character", true);
    },
    [`Shift+${wordModKey}+ArrowLeft`]: () => {
      return moveSelection("left", "word", true);
    },
    ArrowRight: () => {
      return moveSelection("right", "character");
    },
    [`${wordModKey}+ArrowRight`]: () => {
      return moveSelection("right", "word");
    },
    "Shift+ArrowRight": () => {
      return moveSelection("right", "character", true);
    },
    [`Shift+${wordModKey}+ArrowRight`]: () => {
      return moveSelection("right", "word", true);
    },
    Home: () => {
      // Browsers do not behave consistently when there are tokens.
      let selection = getSelection(getRef()!);
      if (!selection) {
        return false;
      }
      let boundary = value().findLineBoundary(selection[0], TokenFieldValue.Direction.Backward);
      if (boundary) {
        setCursor(getRef()!, boundary, true);
        return true;
      }
      return false;
    },
    End: () => {
      let selection = getSelection(getRef()!);
      if (!selection) {
        return false;
      }
      let boundary = value().findLineBoundary(selection[1], TokenFieldValue.Direction.Forward);
      if (boundary) {
        setCursor(getRef()!, boundary, true);
        return true;
      }
      return false;
    },
  };

  // TODO: user provided onKeyDown currently relies on user provided preventDefault to stop submit
  // maybe can have them specify a format like shortcuts and merge into above?
  const { keyboardProps } = createKeyboard({
    get isDisabled() {
      return isDisabled() || isReadOnly();
    },
    onKeyDown: props.onKeyDown,
    onKeyUp: props.onKeyUp,
    shortcuts: shortcuts,
    allowRepeats: true,
  });

  const { focusableProps } = createFocusable(props);
  const { labelProps, fieldProps, descriptionProps } = createField({
    ...props,
    labelElementType: "span",
  });

  return {
    labelProps: {
      ...(labelProps as JSX.HTMLAttributes<HTMLElement>),
      onClick: () => {
        if (!isDisabled()) {
          getRef()?.focus();

          // Show the focus ring so the user knows where focus went
          setInteractionModality("keyboard");
        }
      },
    } as JSX.HTMLAttributes<HTMLElement>,
    descriptionProps,
    tokenFieldProps: mergeProps(
      focusableProps as object,
      keyboardProps as object,
      fieldProps as object,
      {
        onPaste: props.onPaste,
        onCopy: props.onCopy,
        onCut: props.onCut,
        contentEditable: !isDisabled() && !isReadOnly(),
        role: role(),
        "aria-multiline": multiline(),
        "aria-details": ariaDetails(),
        "aria-readonly": isReadOnly(),
        "aria-disabled": isDisabled(),
        style: { whiteSpace: "pre-wrap" },
      },
    ) as JSX.HTMLAttributes<HTMLDivElement>,
  };
}

function indexOfNode(node: Node) {
  let index = 0;
  let n: Node | null = node;

  while ((n = n.previousSibling)) {
    index++;
  }
  return index;
}

export function getSelection(container: Element): [Position, Position] | null {
  let selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return null;
  }
  let range = selection.getRangeAt(0);
  return rangeToPositions(container, range);
}

function rangeToPositions(container: Element, range: Range | StaticRange): [Position, Position] {
  let start = getPosition(container, range.startContainer, range.startOffset);
  let end = getPosition(container, range.endContainer, range.endOffset);
  return [start, end];
}

function getPosition(container: Element, node: Node, offset: number): Position {
  if (node === container) {
    return { index: offset, offset: 0 };
  }

  let originalNode = node;
  while (node.parentNode !== container) {
    node = node.parentNode!;
  }

  let index = indexOfNode(node);
  if (node.nodeType === Node.ELEMENT_NODE) {
    let tokenNode = node.childNodes[1];
    let atEnd: boolean;
    let endOffset = 0;
    if (originalNode === tokenNode) {
      // Cursor is inside the token.
      atEnd = offset > 0;
    } else if (originalNode === node) {
      // Cursor is inside the wrapper element.
      atEnd = offset > 1;
    } else {
      // Cursor is on one of the zero width spaces.
      atEnd = originalNode !== tokenNode.previousSibling;
      // If the offset is greater than 1, the browser is trying to insert text into
      // the zero width space node. This will actually end up in the next text node.
      endOffset = atEnd && offset > 1 ? offset - 1 : 0;
    }

    offset = atEnd ? (tokenNode?.textContent?.length ?? 0) : 0;

    // Several positions are equivalent due to the zero width spaces around tokens.
    // Normalize offset to the end of the preceding text node, or the beginning of the following node.
    if (offset === 0 && node.previousSibling?.nodeType === Node.TEXT_NODE) {
      index--;
      offset = node.previousSibling?.textContent?.length ?? 0;
    } else if (atEnd) {
      index++;
      offset = endOffset;
    }
  }
  return { index, offset };
}

let isProgrammaticSelectionChange = Symbol("isProgrammaticSelectionChange");

function setCursor(root: Element, pos: Position, fireEvent = false) {
  setTokenFieldSelection(root, pos, pos, fireEvent);
}

export function setTokenFieldSelection(
  root: Element,
  start: Position,
  end: Position,
  fireEvent = false,
) {
  let selection = window.getSelection();
  if (selection) {
    let range = createDOMRange(root, start, end);
    (root as Element & { [isProgrammaticSelectionChange]?: boolean })[
      isProgrammaticSelectionChange
    ] = !fireEvent;
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

export function tokenFieldPositionToDOMRange(root: Element, pos: Position): Range {
  return createDOMRange(root, pos, pos);
}

function createDOMRange(root: Element, start: Position, end: Position): Range {
  let range = document.createRange();
  let startChild = root.childNodes[start.index];
  if (!startChild) {
    range.setStart(root, Math.min(root.childNodes.length, start.index));
  } else if (startChild.nodeType === Node.ELEMENT_NODE) {
    // Place the cursor outside the token wrapper element.
    if (start.offset > 0) {
      range.setStartAfter(startChild);
    } else {
      range.setStartBefore(startChild);
    }
  } else {
    range.setStart(startChild, start.offset);
  }

  let endChild = root.childNodes[end.index];
  if (!endChild) {
    range.setEnd(root, Math.min(root.childNodes.length, end.index));
  } else if (endChild.nodeType === Node.ELEMENT_NODE) {
    if (end.offset > 0) {
      range.setEndAfter(endChild);
    } else {
      range.setEndBefore(endChild);
    }
  } else {
    range.setEnd(endChild, end.offset);
  }
  return range;
}

function isSamePosition(a: Position, b: Position): boolean {
  return a.index === b.index && a.offset === b.offset;
}

// Parse and validate segments from clipboard/drag data. Returns null if the data is not valid
// JSON or does not match the expected shape, so malformed or untrusted data is ignored rather
// than throwing or being inserted into the field.
function parseSegments(json: string): TokenFieldSegment[] | null {
  try {
    let data = JSON.parse(json);
    if (Array.isArray(data) && data.length > 0 && data.every(isValidSegment)) {
      return data;
    }
  } catch {
    // Ignore invalid clipboard data.
  }
  return null;
}

function isValidSegment(segment: unknown): segment is TokenFieldSegment {
  return (
    typeof segment === "object" &&
    segment != null &&
    ((segment as TokenFieldSegment).type === "text" ||
      (segment as TokenFieldSegment).type === "token") &&
    typeof (segment as TokenFieldSegment).text === "string"
  );
}

function bindSelectionChange(getEl: () => Element | null, handler: () => void) {
  bindNativeEvent(
    () => (typeof document !== "undefined" ? document : null),
    "selectionchange",
    () => {
      const el = getEl();
      const flagged = el as unknown as Record<symbol, boolean | undefined>;
      if (el && flagged[isProgrammaticSelectionChange]) {
        flagged[isProgrammaticSelectionChange] = false;
        return;
      }

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || !el) {
        return;
      }

      const range = selection.getRangeAt(0);
      if (range.intersectsNode(el)) {
        handler();
      }
    },
  );
}

function createMutationTracker(getEl: () => Element | null) {
  let stopMutations: (() => void) | null = null;

  createEffect(() => {
    onCleanup(() => {
      stopMutations?.();
      stopMutations = null;
    });
  });

  return {
    start() {
      stopMutations ||= trackMutations(getEl()!);
    },
    stop() {
      stopMutations?.();
      stopMutations = null;
    },
  };
}

// Tracks mutations to the DOM until the returned function is called,
// at which point the mutations are reverted.
function trackMutations(element: Element) {
  let mutations: MutationRecord[] = [];
  let observer = new MutationObserver((records) => {
    mutations.push(...records);
  });

  observer.observe(element, {
    childList: true,
    subtree: true,
    characterData: true,
    characterDataOldValue: true,
  });

  return () => {
    mutations.push(...observer.takeRecords());
    observer.disconnect();

    for (let record of mutations.reverse()) {
      switch (record.type) {
        case "childList":
          for (let node of record.removedNodes) {
            record.target.insertBefore(node, record.nextSibling);
          }
          for (let node of record.addedNodes) {
            record.target.removeChild(node);
          }
          break;
        case "characterData":
          record.target.nodeValue = record.oldValue;
          break;
      }
    }
  };
}
