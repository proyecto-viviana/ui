/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@solidjs/testing-library";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";
import { ActionButton } from "../src/button";
import {
  EditableCell,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "../src/table";

interface Fruit {
  id: string;
  fruit: string;
  task: string;
}

const columns = [
  { key: "fruit", name: "Fruit" },
  { key: "task", name: "Task" },
];

const rows: Fruit[] = [{ id: "apples", fruit: "Apples", task: "Collect" }];

function EditableTable(props: {
  onSubmit?: (event: SubmitEvent) => void;
  onCancel?: () => void;
  isSaving?: boolean;
}) {
  return (
    <Table
      aria-label="Fruits"
      items={rows}
      columns={columns}
      getKey={(row) => row.id}
      getTextValue={(row, column) => String(row[column.key as keyof Fruit] ?? "")}
    >
      {() => (
        <>
          <TableHeader>
            <TableColumn id="fruit" isRowHeader>
              {() => <>Fruit</>}
            </TableColumn>
            <TableColumn id="task">{() => <>Task</>}</TableColumn>
          </TableHeader>
          <TableBody>
            {(row) => (
              <TableRow id={row.id} item={row}>
                {() => (
                  <>
                    <EditableCell
                      onSubmit={props.onSubmit}
                      onCancel={props.onCancel}
                      isSaving={props.isSaving}
                      renderEditing={() => (
                        <input aria-label="Edit fruit" name="fruit" value={row.fruit} />
                      )}
                    >
                      {() => (
                        <span>
                          {row.fruit}
                          <ActionButton slot="edit" aria-label="Edit fruit">
                            Edit
                          </ActionButton>
                        </span>
                      )}
                    </EditableCell>
                    <TableCell>{() => <>{row.task}</>}</TableCell>
                  </>
                )}
              </TableRow>
            )}
          </TableBody>
        </>
      )}
    </Table>
  );
}

function focusFromKeyboard(target: HTMLElement): void {
  fireEvent.keyDown(document, { key: "Tab" });
  target.focus();
  fireEvent.focus(target);
}

/** Force the `(hover: hover) and (pointer: fine)` media query that picks the popover vs dialog path. */
function mockMatchMedia(matches: boolean): void {
  window.matchMedia = vi.fn(
    (query: string) =>
      ({
        matches,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(() => false),
      }) as unknown as MediaQueryList,
  );
}

describe("EditableCell (solid-spectrum)", () => {
  const previousMatchMedia = window.matchMedia;

  afterEach(() => {
    cleanup();
    window.matchMedia = previousMatchMedia;
  });

  describe("desktop (fine pointer)", () => {
    beforeEach(() => mockMatchMedia(true));

    it("renders the S2 presentational focus ring on a focus-visible editable cell", () => {
      render(() => <EditableTable />);

      const editableCell = screen.getByText("Apples").closest('[role="rowheader"]') as HTMLElement;
      expect(editableCell).not.toBeNull();
      expect(editableCell.querySelector('[role="presentation"]')).toBeNull();

      focusFromKeyboard(editableCell);

      expect(editableCell).toHaveAttribute("data-focus-visible");
      expect(editableCell.querySelectorAll('[role="presentation"]')).toHaveLength(1);
      expect(editableCell.querySelector('[role="presentation"]')?.className).not.toBe("");
    });

    it("opens an editor popover from the edit button and submits", async () => {
      const user = setupUser();
      const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
      render(() => <EditableTable onSubmit={onSubmit} />);

      expect(screen.queryByRole("textbox", { name: "Edit fruit" })).not.toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Edit fruit" }));

      // Desktop renders the editor inside a popover. Like upstream RAC, a modal
      // popover is exposed as role="dialog" (labelled from table.editCell), and it
      // uses icon-only save/cancel ActionButtons rather than the touch dialog's
      // text buttons.
      const popover = screen.getByRole("dialog", { name: "Edit cell" });
      expect(within(popover).getByRole("textbox", { name: "Edit fruit" })).toBeInTheDocument();
      expect(within(popover).queryByText("Save")).not.toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Save" }));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole("textbox", { name: "Edit fruit" })).not.toBeInTheDocument();
    });

    it("closes without submitting when cancelled", async () => {
      const user = setupUser();
      const onSubmit = vi.fn();
      const onCancel = vi.fn();
      render(() => <EditableTable onSubmit={onSubmit} onCancel={onCancel} />);

      await user.click(screen.getByRole("button", { name: "Edit fruit" }));
      expect(screen.getByRole("textbox", { name: "Edit fruit" })).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Cancel" }));

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.queryByRole("textbox", { name: "Edit fruit" })).not.toBeInTheDocument();
    });
  });

  describe("touch (no fine pointer)", () => {
    beforeEach(() => mockMatchMedia(false));

    it("opens a full dialog from the edit button and submits", async () => {
      const user = setupUser();
      const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
      render(() => <EditableTable onSubmit={onSubmit} />);

      await user.click(screen.getByRole("button", { name: "Edit fruit" }));

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeVisible();
      expect(within(dialog).getByRole("textbox", { name: "Edit fruit" })).toBeInTheDocument();
      // The touch dialog uses text buttons, unlike the desktop popover's icon buttons.
      expect(within(dialog).getByText("Save")).toBeInTheDocument();

      await user.click(within(dialog).getByRole("button", { name: "Save" }));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("cancels via the Cancel button", async () => {
      const user = setupUser();
      const onSubmit = vi.fn();
      const onCancel = vi.fn();
      render(() => <EditableTable onSubmit={onSubmit} onCancel={onCancel} />);

      await user.click(screen.getByRole("button", { name: "Edit fruit" }));
      const dialog = screen.getByRole("dialog");

      await user.click(within(dialog).getByRole("button", { name: "Cancel" }));

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("cancels via the Escape key", async () => {
      const user = setupUser();
      const onCancel = vi.fn();
      render(() => <EditableTable onCancel={onCancel} />);

      await user.click(screen.getByRole("button", { name: "Edit fruit" }));
      const dialog = screen.getByRole("dialog");
      const input = within(dialog).getByRole("textbox", { name: "Edit fruit" });

      fireEvent.keyDown(input, { key: "Escape" });

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("submits the form when dismissed by interacting outside", async () => {
      const user = setupUser();
      const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
      render(() => <EditableTable onSubmit={onSubmit} />);

      await user.click(screen.getByRole("button", { name: "Edit fruit" }));
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      await user.click(document.body);

      expect(onSubmit).toHaveBeenCalled();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
