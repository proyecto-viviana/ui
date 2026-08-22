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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/utils/constants.ts

/**
 * Custom DOM event names used to drive virtual focus into a selectable
 * collection from an outside controller (e.g. an Autocomplete input). Mirrors
 * @react-aria/selection's `utils/constants` (`FOCUS_EVENT` / `CLEAR_FOCUS_EVENT`).
 *
 * Canonical home is here, in the selection layer, because the collection is the
 * consumer that listens for them. A controller that wants to move virtual focus
 * (the deferred autocomplete-collection bridge) dispatches these onto the
 * collection ref.
 */

/** Dispatched onto a collection to focus it (optionally its first item). */
export const FOCUS_EVENT = "react-aria-focus";

/** Dispatched onto a collection to blur it (optionally clearing the focused key). */
export const CLEAR_FOCUS_EVENT = "react-aria-clear-focus";
