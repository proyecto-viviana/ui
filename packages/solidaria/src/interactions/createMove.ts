/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/interactions/useMove.ts

/**
 * createMove - Handles move interactions across mouse, touch, pointer, and keyboard.
 *
 * Port of @react-aria/interactions useMove, adapted for SolidJS.
 */

import { JSX, createSignal, createEffect, onCleanup } from "solid-js";
import { disableTextSelection, restoreTextSelection, createGlobalListeners } from "../utils";

export type PointerType = "mouse" | "pen" | "touch" | "keyboard";

interface BaseMoveEvent {
  pointerType: PointerType;
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
}

export interface MoveStartEvent extends BaseMoveEvent {
  type: "movestart";
}

export interface MoveMoveEvent extends BaseMoveEvent {
  type: "move";
  deltaX: number;
  deltaY: number;
}

export interface MoveEndEvent extends BaseMoveEvent {
  type: "moveend";
}

export interface MoveEvents {
  onMoveStart?: (e: MoveStartEvent) => void;
  onMove?: (e: MoveMoveEvent) => void;
  onMoveEnd?: (e: MoveEndEvent) => void;
}

export interface MoveResult {
  /** Props to spread on the target element. */
  moveProps: JSX.HTMLAttributes<HTMLElement>;
}

interface MoveState {
  didMove: boolean;
  lastPosition: { pageX: number; pageY: number } | null;
  id: number | null;
}

function createBaseEvent(
  originalEvent: { shiftKey: boolean; ctrlKey: boolean; metaKey: boolean; altKey: boolean },
  pointerType: PointerType,
): BaseMoveEvent {
  return {
    pointerType,
    shiftKey: originalEvent.shiftKey,
    ctrlKey: originalEvent.ctrlKey,
    metaKey: originalEvent.metaKey,
    altKey: originalEvent.altKey,
  };
}

/**
 * Handles move interactions across mouse, touch, pointer, and keyboard.
 */
export function createMove(props: MoveEvents = {}): MoveResult {
  const { onMoveStart, onMove, onMoveEnd } = props;

  const state: MoveState = {
    didMove: false,
    lastPosition: null,
    id: null,
  };

  const { addGlobalListener, removeGlobalListener } = createGlobalListeners();
  const [pointerDown, setPointerDown] = createSignal<"pointer" | "mouse" | "touch" | null>(null);

  const move = (
    originalEvent: { shiftKey: boolean; ctrlKey: boolean; metaKey: boolean; altKey: boolean },
    pointerType: PointerType,
    deltaX: number,
    deltaY: number,
  ) => {
    if (deltaX === 0 && deltaY === 0) {
      return;
    }

    if (!state.didMove) {
      state.didMove = true;
      onMoveStart?.({
        type: "movestart",
        ...createBaseEvent(originalEvent, pointerType),
      });
    }

    onMove?.({
      type: "move",
      deltaX,
      deltaY,
      ...createBaseEvent(originalEvent, pointerType),
    });
  };

  const end = (
    originalEvent: { shiftKey: boolean; ctrlKey: boolean; metaKey: boolean; altKey: boolean },
    pointerType: PointerType,
  ) => {
    restoreTextSelection();
    if (state.didMove) {
      onMoveEnd?.({
        type: "moveend",
        ...createBaseEvent(originalEvent, pointerType),
      });
    }
  };

  createEffect(() => {
    const activePointer = pointerDown();
    if (!activePointer) return;

    if (activePointer === "pointer") {
      const onPointerMove = (e: PointerEvent) => {
        if (e.pointerId === state.id) {
          const pointerType = (e.pointerType || "mouse") as PointerType;
          move(
            e,
            pointerType,
            e.pageX - (state.lastPosition?.pageX ?? 0),
            e.pageY - (state.lastPosition?.pageY ?? 0),
          );
          state.lastPosition = { pageX: e.pageX, pageY: e.pageY };
        }
      };

      const onPointerUp = (e: PointerEvent) => {
        if (e.pointerId === state.id) {
          const pointerType = (e.pointerType || "mouse") as PointerType;
          end(e, pointerType);
          state.id = null;
          removeGlobalListener("pointermove", onPointerMove, { isWindow: true });
          removeGlobalListener("pointerup", onPointerUp, { isWindow: true });
          removeGlobalListener("pointercancel", onPointerUp, { isWindow: true });
          setPointerDown(null);
        }
      };

      addGlobalListener("pointermove", onPointerMove, { isWindow: true });
      addGlobalListener("pointerup", onPointerUp, { isWindow: true });
      addGlobalListener("pointercancel", onPointerUp, { isWindow: true });
      onCleanup(() => {
        removeGlobalListener("pointermove", onPointerMove, { isWindow: true });
        removeGlobalListener("pointerup", onPointerUp, { isWindow: true });
        removeGlobalListener("pointercancel", onPointerUp, { isWindow: true });
      });
    }

    // Mouse/touch listeners are attached directly in their handlers.
  });

  const start = () => {
    disableTextSelection();
    state.didMove = false;
  };

  const moveProps: JSX.HTMLAttributes<HTMLElement> = {};

  const hasPointerEvents =
    typeof window !== "undefined" && typeof window.PointerEvent !== "undefined";

  moveProps.onMouseDown = (e: MouseEvent) => {
    if (pointerDown() != null) {
      return;
    }
    if (e.button === 0) {
      start();
      e.stopPropagation();
      e.preventDefault();
      state.lastPosition = { pageX: e.pageX, pageY: e.pageY };
      setPointerDown("mouse");

      const onMouseMove = (event: MouseEvent) => {
        move(
          event,
          "mouse",
          event.pageX - (state.lastPosition?.pageX ?? 0),
          event.pageY - (state.lastPosition?.pageY ?? 0),
        );
        state.lastPosition = { pageX: event.pageX, pageY: event.pageY };
      };
      const onMouseUp = (event: MouseEvent) => {
        end(event, "mouse");
        removeGlobalListener("mousemove", onMouseMove);
        removeGlobalListener("mouseup", onMouseUp);
        setPointerDown(null);
      };
      addGlobalListener("mousemove", onMouseMove);
      addGlobalListener("mouseup", onMouseUp);
    }
  };

  moveProps.onTouchStart = (e: TouchEvent) => {
    if (pointerDown() != null || e.changedTouches.length === 0 || state.id != null) {
      return;
    }
    const { pageX, pageY, identifier } = e.changedTouches[0];
    start();
    e.stopPropagation();
    e.preventDefault();
    state.lastPosition = { pageX, pageY };
    state.id = identifier;
    setPointerDown("touch");

    const onTouchMove = (event: TouchEvent) => {
      const touchIndex = [...event.changedTouches].findIndex(
        ({ identifier: touchId }) => touchId === state.id,
      );
      if (touchIndex >= 0) {
        const { pageX: moveX, pageY: moveY } = event.changedTouches[touchIndex];
        move(
          event,
          "touch",
          moveX - (state.lastPosition?.pageX ?? 0),
          moveY - (state.lastPosition?.pageY ?? 0),
        );
        state.lastPosition = { pageX: moveX, pageY: moveY };
      }
    };
    const onTouchEnd = (event: TouchEvent) => {
      const touchIndex = [...event.changedTouches].findIndex(
        ({ identifier: touchId }) => touchId === state.id,
      );
      if (touchIndex >= 0) {
        end(event, "touch");
        state.id = null;
        removeGlobalListener("touchmove", onTouchMove);
        removeGlobalListener("touchend", onTouchEnd);
        removeGlobalListener("touchcancel", onTouchEnd);
        setPointerDown(null);
      }
    };
    addGlobalListener("touchmove", onTouchMove);
    addGlobalListener("touchend", onTouchEnd);
    addGlobalListener("touchcancel", onTouchEnd);
  };

  if (hasPointerEvents) {
    moveProps.onPointerDown = (e: PointerEvent) => {
      const button = e.button ?? 0;
      if (button === 0 && state.id == null) {
        start();
        e.stopPropagation();
        e.preventDefault();
        state.lastPosition = { pageX: e.pageX, pageY: e.pageY };
        state.id = e.pointerId;
        setPointerDown("pointer");
      }
    };
  }

  const triggerKeyboardMove = (e: KeyboardEvent, deltaX: number, deltaY: number) => {
    start();
    move(e, "keyboard", deltaX, deltaY);
    end(e, "keyboard");
  };

  moveProps.onKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case "Left":
      case "ArrowLeft":
        e.preventDefault();
        e.stopPropagation();
        triggerKeyboardMove(e, -1, 0);
        break;
      case "Right":
      case "ArrowRight":
        e.preventDefault();
        e.stopPropagation();
        triggerKeyboardMove(e, 1, 0);
        break;
      case "Up":
      case "ArrowUp":
        e.preventDefault();
        e.stopPropagation();
        triggerKeyboardMove(e, 0, -1);
        break;
      case "Down":
      case "ArrowDown":
        e.preventDefault();
        e.stopPropagation();
        triggerKeyboardMove(e, 0, 1);
        break;
      default:
        break;
    }
  };

  return { moveProps };
}
