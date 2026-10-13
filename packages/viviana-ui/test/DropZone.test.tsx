/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from "vite-plus/test";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal, flush } from "solid-js";
import { DropZone } from "../src/dropzone";

function createDataTransferStub(): DataTransfer {
  return {
    items: [] as unknown as DataTransferItemList,
    types: [],
    files: [] as unknown as FileList,
    dropEffect: "copy",
    effectAllowed: "copy",
    getData: () => "",
    setData: () => {},
    clearData: () => {},
    setDragImage: () => {},
  } as unknown as DataTransfer;
}

describe("DropZone (viviana-ui)", () => {
  // Beyond S2 (#653): the styled DropZone forwards isDisabled to the headless one.
  it("refuses a drop while disabled and takes it again once enabled", () => {
    const onDrop = vi.fn();
    const [disabled, setDisabled] = createSignal(true);
    render(() => (
      <DropZone data-testid="zone" isDisabled={disabled()} onDrop={onDrop}>
        Drop files
      </DropZone>
    ));
    const zone = screen.getByTestId("zone");
    const button = screen.getByRole("button", { hidden: true });

    expect(button).toBeDisabled();
    fireEvent.drop(zone, { dataTransfer: createDataTransferStub(), clientX: 0, clientY: 0 });
    expect(onDrop).not.toHaveBeenCalled();

    setDisabled(false);
    flush();

    expect(button).not.toBeDisabled();
    fireEvent.drop(zone, { dataTransfer: createDataTransferStub(), clientX: 0, clientY: 0 });
    expect(onDrop).toHaveBeenCalledTimes(1);
  });
});
