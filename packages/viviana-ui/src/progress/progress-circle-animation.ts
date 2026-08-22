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

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/ProgressCircle.tsx

// Port of packages/@react-spectrum/s2/src/ProgressCircle.tsx.

import { keyframes } from "../style/style-macro" with { type: "macro" };

const progressCircleRotationAnimation = keyframes(`
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
`);

const progressCircleDashoffsetAnimation = keyframes(`
  0%, 100% {
    stroke-dashoffset: 75;
  }

  30% {
    stroke-dashoffset: 20;
  }
`);

export const s2ProgressCircleIndeterminateAnimation = `${progressCircleRotationAnimation} 1s cubic-bezier(.6, .1, .3, .9) infinite, ${progressCircleDashoffsetAnimation} 1s cubic-bezier(.25, .1, .25, 1.3) infinite`;
