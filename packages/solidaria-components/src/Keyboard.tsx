/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria-components/src/Keyboard.tsx

/**
 * Keyboard primitive for solidaria-components.
 *
 * Displays keyboard key hints with semantic <kbd> markup.
 * Based on packages/react-aria-components/src/Keyboard.tsx.
 */

import { type JSX, createContext, splitProps, useContext } from "solid-js";

export interface KeyboardProps extends JSX.HTMLAttributes<HTMLElement> {
  children?: JSX.Element;
}

export const KeyboardContext = createContext<KeyboardProps | null>(null);

export function Keyboard(props: KeyboardProps): JSX.Element {
  const context = useContext(KeyboardContext);
  const merged = () => ({ ...context, ...props });
  const [local, domProps] = splitProps(merged(), ["children"]);

  return (
    <kbd dir="ltr" {...domProps}>
      {local.children}
    </kbd>
  );
}
