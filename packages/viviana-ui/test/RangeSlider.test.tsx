/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vite-plus/test";
import { render, screen } from "@solidjs/testing-library";
import { Form, RangeSlider } from "../src";

describe("RangeSlider (viviana-ui)", () => {
  it("omits data-disabled on an enabled group", () => {
    render(() => <RangeSlider label="Range" />);

    expect(screen.getByRole("group", { name: "Range" })).not.toHaveAttribute("data-disabled");
  });

  it("stamps data-disabled on the group when isDisabled is set", () => {
    render(() => <RangeSlider label="Range" isDisabled value={{ start: 25, end: 75 }} />);

    expect(screen.getByRole("group", { name: "Range" })).toHaveAttribute("data-disabled", "true");
    expect(screen.getAllByRole("slider")[0]).toHaveAttribute("aria-disabled", "true");
    expect(screen.getAllByRole("slider")[1]).toHaveAttribute("aria-disabled", "true");
  });

  it("stamps data-disabled when the parent form is disabled", () => {
    render(() => (
      <Form isDisabled>
        <RangeSlider label="Range" value={{ start: 25, end: 75 }} />
      </Form>
    ));

    expect(screen.getByRole("group", { name: "Range" })).toHaveAttribute("data-disabled", "true");
  });
});
