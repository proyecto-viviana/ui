/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vite-plus/test";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { I18nProvider } from "@proyecto-viviana/solidaria";
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

function stepMarkerText(link: HTMLAnchorElement): string {
  const ids = link.getAttribute("aria-labelledby")?.split(" ") ?? [];
  const markerEl = ids[0] ? document.getElementById(ids[0]) : null;
  return markerEl?.textContent?.trim() ?? "";
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

  it("navigates between selectable steps with ArrowDown and ArrowUp", () => {
    renderProgressStepList();

    const [details, selectOffers, fallback] = stepLinks();
    details.focus();
    expect(document.activeElement).toBe(details);

    fireEvent.keyDown(details, { key: "ArrowDown" });
    expect(document.activeElement).toBe(selectOffers);

    fireEvent.keyDown(selectOffers, { key: "ArrowDown" });
    expect(document.activeElement).toBe(fallback);

    fireEvent.keyDown(fallback, { key: "ArrowUp" });
    expect(document.activeElement).toBe(selectOffers);
  });

  it("focuses matching step via typeahead without selecting", () => {
    renderProgressStepList();

    const [details, selectOffers, fallback] = stepLinks();
    details.focus();
    expect(document.activeElement).toBe(details);

    fireEvent.keyDown(details, { key: "s" });
    expect(document.activeElement).toBe(selectOffers);
    // Selection remains on fallback-offer
    expect(fallback).toHaveAttribute("aria-current", "step");
    expect(selectOffers).not.toHaveAttribute("aria-current");
  });
});

describe("StepList localization", () => {
  it("localizes state prefixes, markers, and default container label under es-ES", () => {
    render(() => (
      <I18nProvider locale="es-ES">
        <StepList
          items={progressItems}
          defaultSelectedKey="fallback-offer"
          defaultLastCompletedStep="select-offers"
        />
      </I18nProvider>
    ));

    const list = screen.getByRole("list");
    expect(list).toHaveAttribute("aria-label", "Lista de pasos");

    const [details, selectOffers, fallback, summary] = stepLinks();

    // Markers format numbers
    expect(stepMarkerText(details)).toBe("1");
    expect(stepMarkerText(selectOffers)).toBe("2");
    expect(stepMarkerText(fallback)).toBe("3");
    expect(stepMarkerText(summary)).toBe("4");

    // State prefixes in Spanish
    expect(stepStateText(details)).toBe("Completado: ");
    expect(stepStateText(selectOffers)).toBe("Completado: ");
    expect(stepStateText(fallback)).toBe("Actual: ");
    expect(stepStateText(summary)).toBe("No se ha completado: ");
  });

  it("localizes state prefixes, markers, and default container label under ar-AE", () => {
    render(() => (
      <I18nProvider locale="ar-AE">
        <StepList
          items={progressItems}
          defaultSelectedKey="fallback-offer"
          defaultLastCompletedStep="select-offers"
        />
      </I18nProvider>
    ));

    const list = screen.getByRole("list");
    expect(list).toHaveAttribute("aria-label", "قائمة الخطوات");

    const [details, selectOffers, fallback, summary] = stepLinks();

    // Markers format numbers (ar-AE standard numbering uses Western digits)
    expect(stepMarkerText(details)).toBe("1");
    expect(stepMarkerText(selectOffers)).toBe("2");
    expect(stepMarkerText(fallback)).toBe("3");
    expect(stepMarkerText(summary)).toBe("4");

    // State prefixes in Arabic
    expect(stepStateText(details)).toBe("مكتمل: ");
    expect(stepStateText(selectOffers)).toBe("مكتمل: ");
    expect(stepStateText(fallback)).toBe("الحالي: ");
    expect(stepStateText(summary)).toBe("غير مكتمل: ");
  });

  it("localizes state prefixes and default container label under de-DE", () => {
    render(() => (
      <I18nProvider locale="de-DE">
        <StepList
          items={progressItems}
          defaultSelectedKey="fallback-offer"
          defaultLastCompletedStep="select-offers"
        />
      </I18nProvider>
    ));

    const list = screen.getByRole("list");
    expect(list).toHaveAttribute("aria-label", "Schrittliste");

    const [details, , fallback, summary] = stepLinks();
    expect(stepStateText(details)).toBe("Abgeschlossen: ");
    expect(stepStateText(fallback)).toBe("Aktuell: ");
    expect(stepStateText(summary)).toBe("Nicht abgeschlossen: ");
  });

  it("preserves explicit aria-label over localized default", () => {
    render(() => (
      <I18nProvider locale="es-ES">
        <StepList
          aria-label="Pasos de compra"
          items={progressItems}
          defaultSelectedKey="fallback-offer"
          defaultLastCompletedStep="select-offers"
        />
      </I18nProvider>
    ));

    const list = screen.getByRole("list");
    expect(list).toHaveAttribute("aria-label", "Pasos de compra");
  });
});
