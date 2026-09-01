import { render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it } from "vite-plus/test";
import { Button } from "../src/button";

describe("Button", () => {
  it("updates direct reactive text children", () => {
    let setLabel!: (value: string) => void;

    render(() => {
      const [label, updateLabel] = createSignal("Save");
      setLabel = updateLabel;
      return <Button>{label()}</Button>;
    });

    expect(screen.getByRole("button")).toHaveTextContent("Save");
    setLabel("Saved");
    expect(screen.getByRole("button")).toHaveTextContent("Saved");
  });
});
