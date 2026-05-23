/**
 * Tests for solidaria-components DropZone
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { DropZone, DropZoneContext } from "../src/DropZone";

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

function createClipboardDataStub(text: string): DataTransfer {
  return {
    items: [{ kind: "string", type: "text/plain" }] as unknown as DataTransferItemList,
    types: ["text/plain"],
    files: [] as unknown as FileList,
    dropEffect: "copy",
    effectAllowed: "copy",
    getData: (type: string) => (type === "text/plain" ? text : ""),
    setData: () => {},
    clearData: () => {},
    setDragImage: () => {},
  } as unknown as DataTransfer;
}

function dispatchDragEvent(
  element: HTMLElement,
  type: "dragenter" | "dragover" | "dragleave",
  dataTransfer: DataTransfer,
  clientX: number,
  clientY: number,
) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperties(event, {
    clientX: { value: clientX, configurable: true },
    clientY: { value: clientY, configurable: true },
    dataTransfer: { value: dataTransfer, configurable: true },
  });
  element.dispatchEvent(event);
}

describe("DropZone", () => {
  it("renders with default class", () => {
    render(() => <DropZone>Drop files</DropZone>);
    const zone = document.querySelector(".solidaria-DropZone") as HTMLDivElement;
    expect(zone).toBeInTheDocument();
    expect(zone).toHaveClass("solidaria-DropZone");

    const button = screen.getByRole("button", { name: "Drop files" });
    expect(button).toBeInTheDocument();
  });

  it("calls onDrop handler on drop event", () => {
    const onDrop = vi.fn();
    render(() => <DropZone onDrop={onDrop}>Drop files</DropZone>);

    const zone = document.querySelector(".solidaria-DropZone") as HTMLDivElement;
    expect(zone).toBeInTheDocument();
    const dataTransfer = createDataTransferStub();
    fireEvent.drop(zone, {
      dataTransfer,
      clientX: 0,
      clientY: 0,
    });

    expect(onDrop).toHaveBeenCalled();
  });

  it("calls drag lifecycle handlers for valid drags", () => {
    const onDropEnter = vi.fn();
    const onDropMove = vi.fn();
    const onDropExit = vi.fn();
    render(() => (
      <DropZone onDropEnter={onDropEnter} onDropMove={onDropMove} onDropExit={onDropExit}>
        Drop files
      </DropZone>
    ));

    const zone = document.querySelector(".solidaria-DropZone") as HTMLDivElement;
    expect(zone).toBeInTheDocument();
    vi.spyOn(zone, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      top: 0,
      right: 100,
      bottom: 100,
      left: 0,
      width: 100,
      height: 100,
      toJSON: () => ({}),
    } as DOMRect);
    const dataTransfer = createDataTransferStub();

    dispatchDragEvent(zone, "dragenter", dataTransfer, 4, 8);
    expect(onDropEnter).toHaveBeenCalledWith(
      expect.objectContaining({ type: "dropenter", x: 4, y: 8 }),
    );
    expect(zone).toHaveAttribute("data-drop-target");

    dispatchDragEvent(zone, "dragover", dataTransfer, 12, 16);
    expect(onDropMove).toHaveBeenCalledWith(
      expect.objectContaining({ type: "dropmove", x: 12, y: 16 }),
    );

    dispatchDragEvent(zone, "dragleave", dataTransfer, 20, 24);
    expect(onDropExit).toHaveBeenCalledWith(
      expect.objectContaining({ type: "dropexit", x: 20, y: 24 }),
    );
  });

  it("sets disabled state attributes", () => {
    render(() => <DropZone isDisabled>Drop files</DropZone>);
    const zone = document.querySelector(".solidaria-DropZone") as HTMLDivElement;
    expect(zone).toBeInTheDocument();
    expect(zone).toHaveAttribute("data-disabled");

    const button = screen.getByRole("button", { name: "Drop files" });
    expect(button).toBeDisabled();
  });

  it("maps hidden button paste to onDrop copy events", () => {
    const onDrop = vi.fn();
    render(() => <DropZone onDrop={onDrop}>Drop files</DropZone>);

    const button = screen.getByRole("button", { name: "Drop files" });
    const clipboardData = createClipboardDataStub("pasted text");
    fireEvent.paste(button, { clipboardData });

    expect(onDrop).toHaveBeenCalledTimes(1);
    expect(onDrop.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        type: "drop",
        dropOperation: "copy",
      }),
    );
  });

  it("uses explicit aria-label for hidden drop button", () => {
    render(() => <DropZone aria-label="Upload area">Drop files</DropZone>);
    expect(screen.getByRole("button", { name: "Upload area" })).toBeInTheDocument();
  });

  it("merges props from DropZoneContext", () => {
    render(() => (
      <DropZoneContext.Provider
        value={{ "aria-label": "Context upload", class: "context-dropzone" }}
      >
        <DropZone>Drop files</DropZone>
      </DropZoneContext.Provider>
    ));

    expect(screen.getByRole("button", { name: "Context upload" })).toBeInTheDocument();
    expect(document.querySelector(".context-dropzone")).toBeInTheDocument();
  });
});
