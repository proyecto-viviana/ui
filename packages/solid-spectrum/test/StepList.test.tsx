/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vite-plus/test";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { StepList } from "../src/steplist";

const progressItems = [
  { key: "details", label: "Details" },
  { key: "select-offers", label: "Select offers" },
  { key: "fallback-offer", label: "Fallback offer" },
  { key: "summary", label: "Summary" },
];

function renderProgressStepList() {
  return render(() => (
    <StepList
      aria-label="Checkout steps"
      items={progressItems}
      defaultSelectedKey="fallback-offer"
      defaultLastCompletedStep="select-offers"
    />
  ));
}

function stepLinks(): HTMLAnchorElement[] {
  return screen.getAllByRole("link") as HTMLAnchorElement[];
}

function stepStateText(link: HTMLAnchorElement): string {
  const ids = link.getAttribute("aria-labelledby")?.split(" ") ?? [];
  const stateEl = ids[1] ? document.getElementById(ids[1]) : null;
  return stateEl?.textContent ?? "";
}

describe("StepList DefaultStep (solid-spectrum)", () => {
  it("selects a completed step on click and moves aria-current", () => {
    renderProgressStepList();

    const [details, , fallback] = stepLinks();
    expect(fallback).toHaveAttribute("aria-current", "step");
    expect(stepStateText(fallback)).toContain("Current");
    expect(stepStateText(details)).toContain("Completed");

    fireEvent.click(details);

    expect(details).toHaveAttribute("aria-current", "step");
    expect(fallback).not.toHaveAttribute("aria-current");
    expect(stepStateText(details)).toContain("Current");
    expect(stepStateText(fallback)).toContain("Not completed");
  });

  it("selects a completed step on Enter", () => {
    renderProgressStepList();

    const [, selectOffers, fallback] = stepLinks();
    expect(fallback).toHaveAttribute("aria-current", "step");

    selectOffers.focus();
    fireEvent.keyDown(selectOffers, { key: "Enter" });

    expect(selectOffers).toHaveAttribute("aria-current", "step");
    expect(fallback).not.toHaveAttribute("aria-current");
    expect(stepStateText(selectOffers)).toContain("Current");
    expect(stepStateText(fallback)).toContain("Not completed");
  });

  it("does not select on Space", () => {
    renderProgressStepList();

    const [, selectOffers, fallback] = stepLinks();
    expect(fallback).toHaveAttribute("aria-current", "step");

    selectOffers.focus();
    fireEvent.keyDown(selectOffers, { key: " " });

    expect(fallback).toHaveAttribute("aria-current", "step");
    expect(selectOffers).not.toHaveAttribute("aria-current");
  });

  it("does not select an unreached step on click", () => {
    renderProgressStepList();

    const [, , fallback, summary] = stepLinks();
    expect(fallback).toHaveAttribute("aria-current", "step");

    fireEvent.click(summary);

    expect(fallback).toHaveAttribute("aria-current", "step");
    expect(summary).not.toHaveAttribute("aria-current");
  });
});
