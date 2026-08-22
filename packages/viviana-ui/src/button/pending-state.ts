/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/Button.tsx

// Port of packages/@react-spectrum/s2/src/Button.tsx.

import { createEffect, createSignal, onCleanup, type Accessor } from "solid-js";

export function createPendingState(isPending: Accessor<boolean | undefined>) {
  const [isProgressVisible, setIsProgressVisible] = createSignal(false);

  createEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    if (isPending()) {
      timeout = setTimeout(() => {
        setIsProgressVisible(true);
      }, 1000);
    } else {
      setIsProgressVisible(false);
    }

    onCleanup(() => {
      if (timeout) {
        clearTimeout(timeout);
      }
    });
  });

  return { isProgressVisible };
}
