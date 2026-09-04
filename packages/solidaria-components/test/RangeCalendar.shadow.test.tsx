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

/**
 * RangeCalendar shadow-DOM tests — Port of RAC RangeCalendar.shadow.test.tsx.
 *
 * The 1.21.0 getEventTarget branch must resolve the composed path so a
 * pointerup whose `event.target` is the shadow host (or window) still sees
 * the inner node.
 */

import { describe, it, expect, afterEach, beforeAll, vi } from "vite-plus/test";
import { render, cleanup, fireEvent, waitFor, within } from "@solidjs/testing-library";
import {
  RangeCalendar,
  RangeCalendarHeading,
  RangeCalendarButton,
  RangeCalendarGrid,
  RangeCalendarCell,
} from "../src/RangeCalendar";
import { CalendarDate } from "@internationalized/date";
import { enableShadowDOM } from "@proyecto-viviana/solid-stately/private/flags/flags";

function TestCalendar(props: { onChange?: (value: unknown) => void }) {
  return (
    <RangeCalendar
      aria-label="Trip dates"
      defaultFocusedValue={new CalendarDate(2019, 6, 5)}
      onChange={props.onChange}
    >
      <header>
        <RangeCalendarButton slot="previous">◀</RangeCalendarButton>
        <RangeCalendarHeading />
        <RangeCalendarButton slot="next">▶</RangeCalendarButton>
      </header>
      <RangeCalendarGrid>{(date) => <RangeCalendarCell date={date} />}</RangeCalendarGrid>
    </RangeCalendar>
  );
}

const pointerOpts = {
  pointerType: "mouse",
  pointerId: 1,
  width: 1,
  height: 1,
  detail: 1,
  pressure: 0.5,
};

describe("RangeCalendar shadow DOM", () => {
  beforeAll(() => {
    enableShadowDOM();
  });

  afterEach(() => {
    cleanup();
  });

  function renderInShadowRoot() {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const shadowRoot = host.attachShadow({ mode: "open" });
    const container = document.createElement("div");
    shadowRoot.appendChild(container);
    const onChange = vi.fn();
    render(() => <TestCalendar onChange={onChange} />, { container });

    return {
      onChange,
      shadowRoot,
      host,
      cleanupHost: () => document.body.removeChild(host),
    };
  }

  it("should support selecting a range by clicking two dates", async () => {
    const { shadowRoot, onChange, cleanupHost } = renderInShadowRoot();

    await waitFor(() => {
      expect(shadowRoot.querySelector('[role="grid"]')).toBeTruthy();
    });
    const grid = shadowRoot.querySelector('[role="grid"]') as HTMLElement;

    fireEvent.pointerDown(within(grid).getByText("17"), pointerOpts);
    fireEvent.pointerUp(within(grid).getByText("17"), pointerOpts);
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.pointerDown(within(grid).getByText("23"), pointerOpts);
    fireEvent.pointerUp(within(grid).getByText("23"), pointerOpts);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledTimes(1);
    });
    expect(onChange).toHaveBeenCalledWith({
      start: new CalendarDate(2019, 6, 17),
      end: new CalendarDate(2019, 6, 23),
    });

    cleanupHost();
  });

  it("should commit the selection when releasing a drag outside the calendar", async () => {
    const { shadowRoot, onChange, cleanupHost } = renderInShadowRoot();

    await waitFor(() => {
      expect(shadowRoot.querySelector('[role="grid"]')).toBeTruthy();
    });
    const grid = shadowRoot.querySelector('[role="grid"]') as HTMLElement;

    const startCell = within(grid).getByText("17");
    fireEvent.pointerDown(startCell, pointerOpts);
    (startCell as HTMLElement).focus();
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.pointerUp(document.body, pointerOpts);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    cleanupHost();
  });

  it("uses getEventTarget so a pointerup whose event.target is not the inner node still sees the composed path", async () => {
    const { shadowRoot, onChange, cleanupHost } = renderInShadowRoot();

    await waitFor(() => {
      expect(shadowRoot.querySelector('[role="grid"]')).toBeTruthy();
    });
    const grid = shadowRoot.querySelector('[role="grid"]') as HTMLElement;
    const calendar = shadowRoot.querySelector('[role="application"]') as HTMLElement;
    const nextButton = within(calendar).getAllByRole("button", { name: /Next/i })[0];

    const startCell = within(grid).getByText("17");
    fireEvent.pointerDown(startCell, pointerOpts);
    (startCell as HTMLElement).focus();
    expect(onChange).not.toHaveBeenCalled();

    // Shadow retargeting would report the host as event.target; the composed
    // path still starts at the next-month button, so commit must not fire.
    const event = new PointerEvent("pointerup", {
      bubbles: true,
      composed: true,
      ...pointerOpts,
    });
    Object.defineProperty(event, "composedPath", {
      value: () => [nextButton, calendar, shadowRoot, document.body, window],
    });
    window.dispatchEvent(event);

    expect(onChange).not.toHaveBeenCalled();

    cleanupHost();
  });

  it("should commit the selection when tabbing away mid selection", async () => {
    const { shadowRoot, onChange, cleanupHost } = renderInShadowRoot();
    const outsideButton = document.createElement("button");
    document.body.appendChild(outsideButton);

    await waitFor(() => {
      expect(shadowRoot.querySelector('[role="grid"]')).toBeTruthy();
    });
    const grid = shadowRoot.querySelector('[role="grid"]') as HTMLElement;
    const startCell = within(grid).getByText("17");
    fireEvent.pointerDown(startCell, pointerOpts);
    (startCell as HTMLElement).focus();
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.keyDown(startCell, { key: "Tab" });
    outsideButton.focus();
    fireEvent.keyUp(outsideButton, { key: "Tab" });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    document.body.removeChild(outsideButton);
    cleanupHost();
  });
});
