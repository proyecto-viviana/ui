import { expect } from "@playwright/test";
import { registerSsrHydrationDriver, type SsrHydrationCase } from "../drivers/ssr-hydration";

const cases = [
  { id: "controlled-field", label: "Controlled field", nextValue: "field-next" },
  { id: "uncontrolled-field", label: "Uncontrolled field", nextValue: "field-free" },
  { id: "controlled-area", label: "Controlled area", nextValue: "area-next" },
  { id: "uncontrolled-area", label: "Uncontrolled area", nextValue: "area-free" },
] as const;

const scenarios: SsrHydrationCase[] = cases.map((entry) => ({
  id: entry.id,
  route: "/d12/text-entry-callback/",
  target: (page) => page.locator(`[data-callback-case='${entry.id}'] label`),
  expectTag: "label",
  expectText: entry.label,
  interact: async ({ page }) => {
    const contractRoot = page.locator(`[data-callback-case='${entry.id}']`);
    const target = page.getByRole("textbox", { name: entry.label, exact: true });

    await expect(contractRoot).toHaveAttribute("data-callback-count", "0");
    await contractRoot.locator("label").dispatchEvent("change");
    await expect(
      contractRoot,
      "a descendant native change must not invoke the public string callback on the wrapper",
    ).toHaveAttribute("data-callback-count", "0");

    await target.fill(entry.nextValue);
    await expect(target).toHaveValue(entry.nextValue);
    await expect(contractRoot).toHaveAttribute("data-callback-count", "1");
    await expect(contractRoot).toHaveAttribute("data-callback-type", "string");
    await expect(contractRoot).toHaveAttribute("data-callback-value", entry.nextValue);

    await target.press("Tab");
    await expect(contractRoot).toHaveAttribute("data-callback-count", "1");
  },
}));

registerSsrHydrationDriver({
  slug: "text-entry-callback",
  title: "Text entry callback contract",
  cases: scenarios,
});
