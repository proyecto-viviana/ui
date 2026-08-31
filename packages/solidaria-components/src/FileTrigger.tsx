/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria-components/src/FileTrigger.tsx

/**
 * FileTrigger primitive for solidaria-components.
 *
 * Opens the native file picker from any pressable child.
 * Based on packages/react-aria-components/src/FileTrigger.tsx.
 */

import { type JSX, createSignal, splitProps } from "solid-js";
import { createPress, type PressEvent } from "@proyecto-viviana/solidaria";

export interface FileTriggerProps extends Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "type" | "onChange" | "children" | "onSelect"
> {
  /** Mime types accepted by the file picker. */
  acceptedFileTypes?: ReadonlyArray<string>;
  /** Whether multiple files can be selected. */
  allowsMultiple?: boolean;
  /** Default camera capture mode for mobile devices. */
  defaultCamera?: "user" | "environment";
  /** Enables directory selection in supported browsers. */
  acceptDirectory?: boolean;
  /** Called when user selection changes. */
  onSelect?: (files: FileList | null) => void;
  /** Trigger content (typically a button). */
  children?: JSX.Element;
}

/**
 * A FileTrigger allows a user to access the file system using a custom trigger.
 */
export function FileTrigger(props: FileTriggerProps): JSX.Element {
  const [local, inputProps] = splitProps(props, [
    "acceptedFileTypes",
    "allowsMultiple",
    "defaultCamera",
    "acceptDirectory",
    "onSelect",
    "children",
    "disabled",
  ]);

  const [inputRef, setInputRef] = createSignal<HTMLInputElement | null>(null);

  const openFilePicker = () => {
    const input = inputRef();
    if (!input) return;
    if (input.value) input.value = "";
    input.click();
  };

  const { pressProps } = createPress({
    get isDisabled() {
      return !!local.disabled;
    },
    onPress: (_e: PressEvent) => {
      openFilePicker();
    },
  });

  const onInputChange: JSX.EventHandler<HTMLInputElement, Event> = (e) => {
    local.onSelect?.(e.currentTarget.files);
  };

  return (
    <>
      <span {...pressProps}>{local.children}</span>
      <input
        {...inputProps}
        ref={setInputRef}
        type="file"
        style={{ display: "none" }}
        accept={local.acceptedFileTypes?.join(",")}
        multiple={local.allowsMultiple}
        capture={local.defaultCamera}
        disabled={local.disabled}
        // @ts-expect-error Non-standard attribute supported by WebKit browsers.
        webkitdirectory={local.acceptDirectory ? "" : undefined}
        onChange={onInputChange}
      />
    </>
  );
}
