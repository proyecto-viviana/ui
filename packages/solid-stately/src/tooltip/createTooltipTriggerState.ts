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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-stately/src/tooltip/useTooltipTriggerState.ts

/**
 * Manages state for a tooltip trigger.
 * Based on @react-stately/tooltip useTooltipTriggerState.
 *
 * Tracks whether the tooltip is open, and provides methods to toggle this state.
 * Ensures only one tooltip is open at a time and controls the delay for showing a tooltip.
 */

import { createSignal, onCleanup, type Accessor } from "solid-js";
import { createOverlayTriggerState, type OverlayTriggerProps } from "../overlays";
import { isServer } from "../ssr";

// Default delays (in ms)
const TOOLTIP_DELAY = 1500;
const TOOLTIP_COOLDOWN = 500;

export interface TooltipTriggerProps extends OverlayTriggerProps {
  /** The delay time in milliseconds for the tooltip to show up. */
  delay?: number;
  /** The delay time in milliseconds for the tooltip to close. */
  closeDelay?: number;
  /** Whether the tooltip trigger is disabled. */
  isDisabled?: boolean;
}

export interface TooltipTriggerState {
  /** Whether the tooltip is currently showing. */
  readonly isOpen: Accessor<boolean>;
  /**
   * Whether the tooltip is being shown or hidden without an animation. True while
   * the global warmup timer is active, i.e. when quickly moving between tooltips.
   */
  readonly shouldSkipAnimation: Accessor<boolean>;
  /**
   * Shows the tooltip. By default, the tooltip becomes visible after a delay
   * depending on a global warmup timer. The `immediate` option shows the
   * tooltip immediately instead.
   */
  open(immediate?: boolean): void;
  /** Hides the tooltip. */
  close(immediate?: boolean): void;
}

// Global state for coordinating tooltips
let tooltips: Record<string, (immediate?: boolean, instant?: boolean) => void> = {};
let tooltipId = 0;
let globalWarmedUp = false;
let globalWarmUpTimeout: ReturnType<typeof setTimeout> | null = null;
let globalCooldownTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Resets the global tooltip state. Useful for testing.
 * @internal
 */
export function resetTooltipState(): void {
  tooltips = {};
  tooltipId = 0;
  globalWarmedUp = false;
  if (globalWarmUpTimeout) {
    clearTimeout(globalWarmUpTimeout);
    globalWarmUpTimeout = null;
  }
  if (globalCooldownTimeout) {
    clearTimeout(globalCooldownTimeout);
    globalCooldownTimeout = null;
  }
}

/**
 * Manages state for a tooltip trigger. Tracks whether the tooltip is open, and provides
 * methods to toggle this state. Ensures only one tooltip is open at a time and controls
 * the delay for showing a tooltip.
 */
export function createTooltipTriggerState(props: TooltipTriggerProps = {}): TooltipTriggerState {
  const delay = () => props.delay ?? TOOLTIP_DELAY;
  const closeDelay = () => props.closeDelay ?? TOOLTIP_COOLDOWN;

  const overlayState = createOverlayTriggerState(props);
  const id = `tooltip-${++tooltipId}`;
  const [shouldSkipAnimation, setShouldSkipAnimation] = createSignal(false);

  let closeTimeout: ReturnType<typeof setTimeout> | null = null;
  const [closeCallback, setCloseCallback] = createSignal<() => void>(() => overlayState.close());

  const ensureTooltipEntry = () => {
    tooltips[id] = hideTooltip;
  };

  const closeOpenTooltips = () => {
    for (const hideTooltipId in tooltips) {
      if (hideTooltipId !== id) {
        tooltips[hideTooltipId](true, true);
        delete tooltips[hideTooltipId];
      }
    }
  };

  const showTooltip = (instant?: boolean) => {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      closeTimeout = null;
    }
    closeOpenTooltips();
    ensureTooltipEntry();
    setShouldSkipAnimation(!!instant);
    globalWarmedUp = true;
    overlayState.open();

    if (globalWarmUpTimeout) {
      clearTimeout(globalWarmUpTimeout);
      globalWarmUpTimeout = null;
    }
    if (globalCooldownTimeout) {
      clearTimeout(globalCooldownTimeout);
      globalCooldownTimeout = null;
    }
  };

  const hideTooltip = (immediate?: boolean, instant?: boolean) => {
    setShouldSkipAnimation(!!instant);
    if (immediate || closeDelay() <= 0) {
      if (closeTimeout) {
        clearTimeout(closeTimeout);
        closeTimeout = null;
      }
      closeCallback()();
    } else if (!closeTimeout) {
      closeTimeout = setTimeout(() => {
        closeTimeout = null;
        closeCallback()();
      }, closeDelay());
    }

    if (globalWarmUpTimeout) {
      clearTimeout(globalWarmUpTimeout);
      globalWarmUpTimeout = null;
    }

    if (globalWarmedUp) {
      if (globalCooldownTimeout) {
        clearTimeout(globalCooldownTimeout);
      }
      globalCooldownTimeout = setTimeout(
        () => {
          delete tooltips[id];
          globalCooldownTimeout = null;
          globalWarmedUp = false;
        },
        Math.max(TOOLTIP_COOLDOWN, closeDelay()),
      );
    }
  };

  const warmupTooltip = () => {
    closeOpenTooltips();
    ensureTooltipEntry();

    if (!overlayState.isOpen() && !globalWarmUpTimeout && !globalWarmedUp) {
      globalWarmUpTimeout = setTimeout(() => {
        globalWarmUpTimeout = null;
        globalWarmedUp = true;
        showTooltip(false);
      }, delay());
    } else if (!overlayState.isOpen()) {
      showTooltip(true);
    }
  };

  // Update close callback when overlayState.close changes
  setCloseCallback(() => overlayState.close);

  // Cleanup on unmount
  onCleanup(() => {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
    }
    if (tooltips[id]) {
      delete tooltips[id];
    }
  });

  return {
    isOpen: overlayState.isOpen,
    shouldSkipAnimation,
    open: (immediate?: boolean) => {
      if (isServer) return;
      if (!immediate && delay() > 0 && !closeTimeout) {
        warmupTooltip();
      } else {
        showTooltip(true);
      }
    },
    close: hideTooltip,
  };
}
