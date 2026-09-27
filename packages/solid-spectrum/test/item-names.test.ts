/**
 * #224 — S2 ComboBoxItem is canonical; ComboBoxOption is the deprecated alias.
 */
import { describe, expect, it } from "vite-plus/test";
import { ComboBoxItem, ComboBoxOption } from "../src/index";

describe("canonical item names", () => {
  it("ComboBoxOption is a deprecated alias of ComboBoxItem", () => {
    expect(ComboBoxOption).toBe(ComboBoxItem);
  });
});
