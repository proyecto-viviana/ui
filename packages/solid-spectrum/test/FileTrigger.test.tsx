/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vite-plus/test";
import { render, screen, fireEvent } from "@solidjs/testing-library";
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
