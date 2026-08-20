/**
 * Tests for solidaria-components FileTrigger
 */
import { describe, it, expect, vi } from "vite-plus/test";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { FileTrigger } from "../src/FileTrigger";
import { setupUser } from "@proyecto-viviana/solidaria-test-utils";

describe("FileTrigger", () => {
  it("opens the hidden input when trigger is pressed", async () => {
    const user = setupUser();
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, "click");

    render(() => (
      <FileTrigger>
        <button type="button">Upload</button>
      </FileTrigger>
    ));

    await user.click(screen.getByRole("button", { name: "Upload" }));
    expect(clickSpy).toHaveBeenCalled();
  });

  it("calls onSelect when file input changes", () => {
    const onSelect = vi.fn();
    render(() => (
      <FileTrigger onSelect={onSelect}>
        <button type="button">Upload</button>
      </FileTrigger>
    ));

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["content"], "test.txt", { type: "text/plain" });
    fireEvent.change(input, { target: { files: [file] } });

    expect(onSelect).toHaveBeenCalled();
    const files = onSelect.mock.calls[0][0] as FileList;
    expect(files[0]?.name).toBe("test.txt");
  });

  it("wires file input attributes", () => {
    render(() => (
      <FileTrigger
        acceptedFileTypes={["image/png", "image/jpeg"]}
        allowsMultiple
        defaultCamera="environment"
        acceptDirectory
      >
        <button type="button">Upload</button>
      </FileTrigger>
    ));

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toHaveAttribute("accept", "image/png,image/jpeg");
    expect(input).toHaveAttribute("multiple");
    expect(input).toHaveAttribute("capture", "environment");
    expect(input).toHaveAttribute("webkitdirectory");
  });

  it("does not open picker when disabled", async () => {
    const user = setupUser();
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, "click");

    render(() => (
      <FileTrigger disabled>
        <button type="button">Upload</button>
      </FileTrigger>
    ));

    await user.click(screen.getByRole("button", { name: "Upload" }));
    expect(clickSpy).not.toHaveBeenCalled();

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeDisabled();
  });
});
