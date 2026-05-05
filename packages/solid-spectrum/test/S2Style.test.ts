import { describe, expect, it } from "vitest";
import { baseColor, style } from "../src/s2-style";

describe("S2 style color states", () => {
  it("advances semantic 900 color stops to their 1000 hover/press states", () => {
    const selectedBox = style({
      backgroundColor: {
        isSelected: {
          isEmphasized: baseColor("accent-900"),
          isInvalid: baseColor("negative-900"),
        },
      },
    });

    expect(() =>
      selectedBox({
        isSelected: true,
        isEmphasized: true,
        isHovered: true,
      }),
    ).not.toThrow();

    expect(() =>
      selectedBox({
        isSelected: true,
        isInvalid: true,
        isPressed: true,
      }),
    ).not.toThrow();
  });
});
