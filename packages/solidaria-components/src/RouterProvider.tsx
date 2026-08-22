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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/utils/openLink.tsx

/**
 * RouterProvider for solidaria-components
 *
 * A context provider for client-side router integration.
 * SolidJS apps typically use TanStack Router or SolidRouter directly;
 * this provides API compatibility with React Aria's RouterProvider.
 * Based on packages/react-aria/src/utils/openLink.tsx.
 */

import { type JSX, createContext, useContext } from "solid-js";

export interface RouterClickModifiers {
  metaKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
}

export interface RouterContextValue {
  /** Whether the router is a native browser router (no client-side navigation). */
  isNative: boolean;
  /** Navigate to a given href. */
  navigate: (href: string, routerOptions?: RouterOptions) => void;
  /** Open a link target with router-aware navigation behavior. */
  open: (
    target: Element,
    modifiers: RouterClickModifiers,
    href: string,
    routerOptions?: RouterOptions,
  ) => void;
  /** Transform an href for the router. */
  useHref: (href: string) => string;
}

export interface RouterOptions {
  /** Whether to replace the current history entry. */
  replace?: boolean;
  /** Additional router-specific options. */
  [key: string]: unknown;
}

export interface RouterProviderProps {
  /** A function that performs client-side navigation. */
  navigate: (href: string, routerOptions?: RouterOptions) => void;
  /** An optional function that transforms hrefs. */
  useHref?: (href: string) => string;
  /** Children to render. */
  children: JSX.Element;
}

const defaultRouter: RouterContextValue = {
  isNative: true,
  navigate: () => {},
  open: (target, modifiers) => {
    openSyntheticLink(target, modifiers);
  },
  useHref: (href: string) => href,
};

export const RouterContext = createContext<RouterContextValue>(defaultRouter);

export interface LinkDOMProps {
  href?: string;
  target?: string;
  rel?: string;
  download?: string | boolean;
  ping?: string;
  referrerPolicy?:
    | ""
    | "no-referrer"
    | "no-referrer-when-downgrade"
    | "origin"
    | "origin-when-cross-origin"
    | "same-origin"
    | "strict-origin"
    | "strict-origin-when-cross-origin"
    | "unsafe-url";
}

export function shouldClientNavigate(
  link: HTMLAnchorElement,
  modifiers: RouterClickModifiers,
): boolean {
  const target = link.getAttribute("target");
  const sameOrigin = typeof location === "undefined" ? true : link.origin === location.origin;
  return (
    (!target || target === "_self") &&
    sameOrigin &&
    !link.hasAttribute("download") &&
    !modifiers.metaKey &&
    !modifiers.ctrlKey &&
    !modifiers.altKey &&
    !modifiers.shiftKey
  );
}

export function openLink(target: HTMLAnchorElement, modifiers: RouterClickModifiers): void {
  const event = new MouseEvent("click", {
    metaKey: modifiers.metaKey,
    ctrlKey: modifiers.ctrlKey,
    altKey: modifiers.altKey,
    shiftKey: modifiers.shiftKey,
    detail: 1,
    bubbles: true,
    cancelable: true,
  });
  target.dispatchEvent(event);
}

function getSyntheticLink(target: Element, open: (link: HTMLAnchorElement) => void): void {
  if (target instanceof HTMLAnchorElement) {
    open(target);
    return;
  }

  const href = target.getAttribute("data-href");
  if (!href) {
    return;
  }

  const link = document.createElement("a");
  link.href = href;

  const targetValue = target.getAttribute("data-target");
  if (targetValue) link.target = targetValue;

  const rel = target.getAttribute("data-rel");
  if (rel) link.rel = rel;

  const download = target.getAttribute("data-download");
  if (download) link.download = download;

  const ping = target.getAttribute("data-ping");
  if (ping) link.ping = ping;

  const referrerPolicy = target.getAttribute("data-referrer-policy");
  if (referrerPolicy) {
    link.referrerPolicy = referrerPolicy;
  }

  target.appendChild(link);
  open(link);
  target.removeChild(link);
}

function openSyntheticLink(target: Element, modifiers: RouterClickModifiers): void {
  getSyntheticLink(target, (link) => openLink(link, modifiers));
}

export function useLinkProps(props?: LinkDOMProps): LinkDOMProps {
  const router = useRouter();
  const href = props?.href ?? "";
  return {
    href: props?.href ? router.useHref(href) : undefined,
    target: props?.target,
    rel: props?.rel,
    download: props?.download,
    ping: props?.ping,
    referrerPolicy: props?.referrerPolicy,
  };
}

export function handleLinkClick(
  event: MouseEvent,
  router: RouterContextValue,
  href: string | undefined,
  routerOptions?: RouterOptions,
): void {
  if (
    !router.isNative &&
    event.currentTarget instanceof HTMLAnchorElement &&
    event.currentTarget.href &&
    !event.defaultPrevented &&
    href &&
    shouldClientNavigate(event.currentTarget, event)
  ) {
    event.preventDefault();
    router.open(event.currentTarget, event, href, routerOptions);
  }
}

/**
 * A RouterProvider accepts a `navigate` function from a client-side router,
 * and provides it to all nested solidaria links to enable client-side navigation.
 *
 * @example
 * ```tsx
 * import { useNavigate } from '@solidjs/router';
 *
 * function App() {
 *   const navigate = useNavigate();
 *   return (
 *     <RouterProvider navigate={navigate}>
 *       <Link href="/about">About</Link>
 *     </RouterProvider>
 *   );
 * }
 * ```
 */
export function RouterProvider(props: RouterProviderProps): JSX.Element {
  const ctx: RouterContextValue = {
    isNative: false,
    navigate: props.navigate,
    open: (target, modifiers, href, routerOptions) => {
      getSyntheticLink(target, (link) => {
        if (shouldClientNavigate(link, modifiers)) {
          props.navigate(href, routerOptions);
        } else {
          openLink(link, modifiers);
        }
      });
    },
    useHref: props.useHref ?? ((href: string) => href),
  };

  return <RouterContext.Provider value={ctx}>{props.children}</RouterContext.Provider>;
}

/**
 * Returns the current router context value.
 */
export function useRouter(): RouterContextValue {
  return useContext(RouterContext);
}
