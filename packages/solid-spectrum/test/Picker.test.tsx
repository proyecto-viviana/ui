/**
 * @vitest-environment jsdom
 */
import { render, screen } from "@solidjs/testing-library";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";
import { describe, expect, it, vi } from "vitest";
import { Picker } from "../src/picker";

interface SectionItem {
  href: string;
  label: string;
}

const sections: SectionItem[] = [
  { href: "#page-title", label: "Accordion" },
  { href: "#api", label: "API" },
];

describe("Picker (solid-spectrum)", () => {
  it("uses getKey for generated options from object-backed items", async () => {
    const user = setupUser();
    const onSelectionChange = vi.fn();

    render(() => (
      <Picker<SectionItem>
        aria-label="Table of contents"
        defaultOpen
        items={sections}
        getKey={(item) => item.href}
        getTextValue={(item) => item.label}
        selectedKey="#page-title"
        onSelectionChange={onSelectionChange}
      />
    ));

    await user.click(screen.getByRole("option", { name: "API" }));

    expect(onSelectionChange).toHaveBeenCalledWith("#api");
  });
});
