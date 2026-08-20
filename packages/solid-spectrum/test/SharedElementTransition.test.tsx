import { describe, expect, it } from "vite-plus/test";
import { render, screen } from "@solidjs/testing-library";
import { SharedElementTransition, SharedElement } from "../src/shared-element";

describe("SharedElement UI wrappers", () => {
  it("adds the default styling hook to shared elements", () => {
    render(() => (
      <SharedElementTransition>
        <SharedElement name="card">Card</SharedElement>
      </SharedElementTransition>
    ));

    expect(screen.getByText("Card")).toHaveClass("vui-shared-element");
  });

  it("forwards inline style overrides", () => {
    render(() => (
      <SharedElementTransition>
        <SharedElement name="card" style={{ color: "magenta" }}>
          Card
        </SharedElement>
      </SharedElementTransition>
    ));

    expect(screen.getByText("Card")).toHaveStyle({ color: "rgb(255, 0, 255)" });
  });
});
