/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { type JSX, useContext } from "solid-js";
import { DropZone, DropZoneContext } from "../src/dropzone";
import { IllustratedMessageContext } from "../src/illustratedmessage";

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

function getZone(testId: string): HTMLDivElement {
  return screen.getByTestId(testId) as HTMLDivElement;
}

function ContextProbe(): JSX.Element {
  const context = useContext(IllustratedMessageContext);
  return (
    <span
      data-testid="context-probe"
      data-in-drop-zone={context?.isInDropZone ? "true" : "false"}
      data-drop-target={context?.isDropTarget ? "true" : "false"}
      data-size={context?.size}
    >
      Probe content
    </span>
  );
}

describe("DropZone (solid-spectrum)", () => {
  it("renders S2-generated styles and the hidden accessible drop button", () => {
    render(() => <DropZone data-testid="dropzone-root">Drop files here</DropZone>);

    const zone = getZone("dropzone-root");
    expect(zone).toBeInTheDocument();
    expect(zone.className).not.toBe("");
    expect(zone.className).not.toContain("cursor-not-allowed");
    expect(zone.className).not.toContain("bg-bg-400");

    expect(screen.getByRole("button", { name: "Drop files" })).toBeInTheDocument();
  });

  it("supports S2 context, unsafe escape hatches, and local prop overrides", () => {
    render(() => (
      <DropZoneContext.Provider
        value={{
          "aria-label": "Context upload",
          UNSAFE_className: "context-dropzone",
          UNSAFE_style: { margin: "8px" },
        }}
      >
        <DropZone
          aria-label="Local upload"
          data-testid="dropzone-root"
          UNSAFE_className="local-dropzone"
          UNSAFE_style={{ margin: "12px" }}
        >
          Drop files here
        </DropZone>
      </DropZoneContext.Provider>
    ));

    const zone = getZone("dropzone-root");
    expect(screen.getByRole("button", { name: "Local upload" })).toBeInTheDocument();
    expect(zone).toHaveClass("context-dropzone");
    expect(zone).toHaveClass("local-dropzone");
    expect(zone).toHaveStyle({ margin: "12px" });
  });

  it("provides DropZone state to IllustratedMessage children and shows replace text when filled", () => {
    render(() => (
      <DropZone data-testid="dropzone-root" isFilled replaceMessage="Replace current file" size="L">
        <ContextProbe />
      </DropZone>
    ));

    const probe = screen.getByTestId("context-probe");
    expect(probe).toHaveAttribute("data-in-drop-zone", "true");
    expect(probe).toHaveAttribute("data-drop-target", "false");
    expect(probe).toHaveAttribute("data-size", "L");

    const zone = getZone("dropzone-root");
    fireEvent.dragEnter(zone, {
      dataTransfer: createDataTransferStub(),
      clientX: 0,
      clientY: 0,
    });

    expect(zone).toHaveAttribute("data-drop-target", "true");
    expect(screen.getByText("Replace current file")).toBeInTheDocument();
    expect(screen.getByTestId("context-probe")).toHaveAttribute("data-drop-target", "true");
  });
});
