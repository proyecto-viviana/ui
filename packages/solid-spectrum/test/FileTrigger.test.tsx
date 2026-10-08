/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from "vite-plus/test";
import { render, screen, fireEvent, cleanup } from "@solidjs/testing-library";
import { Button } from "../src/button";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";
import { FileTrigger } from "../src/filetrigger";

describe("FileTrigger (solid-spectrum)", () => {
  it("renders trigger content", () => {
    render(() => (
      <FileTrigger>
        <button type="button">Upload file</button>
      </FileTrigger>
    ));

    expect(screen.getByRole("button", { name: "Upload file" })).toBeInTheDocument();
  });

  it("wraps trigger with custom class when provided", () => {
    const { container } = render(() => (
      <FileTrigger class="custom-wrapper">
        <button type="button">Upload file</button>
      </FileTrigger>
    ));

    const wrapper = container.querySelector(".custom-wrapper");
    expect(wrapper).toBeInTheDocument();
    expect(wrapper?.querySelector("button")).toBeInTheDocument();
  });

  it("forwards onSelect callback", () => {
    const onSelect = vi.fn();
    const { container } = render(() => (
      <FileTrigger onSelect={onSelect}>
        <button type="button">Upload file</button>
      </FileTrigger>
    ));

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["content"], "example.txt", { type: "text/plain" });
    fireEvent.change(input, { target: { files: [file] } });

    expect(onSelect).toHaveBeenCalled();
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

for (const route of ["pointer", "Enter", "Space"] as const) {
  it(`D21 styled class wrapper delivers ${route} exactly once`, async () => {
    const user = setupUser();
    const own = vi.fn();
    const { container } = render(() => (
      <FileTrigger class="upload-wrapper">
        <Button onPress={own}>Upload</Button>
      </FileTrigger>
    ));
    const button = container.querySelector("button")!;
    const click = vi.spyOn(container.querySelector("input")!, "click");
    expect(container.querySelector(".upload-wrapper")?.contains(button)).toBe(true);
    if (route === "pointer") await user.click(button);
    else {
      button.focus();
      await user.keyboard(route === "Enter" ? "{Enter}" : " ");
    }
    expect(own).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
  });
}
