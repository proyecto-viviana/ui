import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@solidjs/testing-library";
import { createSignal, For, onCleanup } from "solid-js";
import { Button } from "../src/Button";
import { Checkbox } from "../src/Checkbox";
import {
  Calendar,
  CalendarButton,
  CalendarCell,
  CalendarGrid,
  CalendarHeading,
} from "../src/Calendar";
import { DateInput, DateSegment } from "../src/DateField";
import { DatePicker, DatePickerButton, DatePickerContent } from "../src/DatePicker";
import { Dialog, DialogTrigger, Heading } from "../src/Dialog";
import { Modal } from "../src/Modal";
import { Radio, RadioGroup } from "../src/RadioGroup";
import {
  SearchField,
  SearchFieldClearButton,
  SearchFieldInput,
  SearchFieldLabel,
} from "../src/SearchField";
import { Select, SelectListBox, SelectOption, SelectTrigger, SelectValue } from "../src/Select";
import { Input, Label, TextField } from "../src/TextField";
import { ToastProvider, ToastRegion, DefaultToast, addToast, globalToastQueue } from "../src/Toast";
import { ToggleButton } from "../src/ToggleButton";
import { Toolbar } from "../src/Toolbar";
import { Tooltip, TooltipTrigger } from "../src/Tooltip";
import { hc, renderProp } from "../../../apps/comparison/src/components/solid/solid-h";

interface TestItem {
  id: string;
  label: string;
}

const items: TestItem[] = [
  { id: "alpha", label: "Alpha" },
  { id: "bravo", label: "Bravo" },
];

describe("comparison Solid h helper", () => {
  afterEach(() => {
    clearGlobalToasts();
    cleanup();
    delete document.body.dataset.lastComparisonSelection;
  });

  it("rejects zero-argument child functions at the helper boundary", () => {
    expect(() => hc("div", {}, (() => []) as unknown as never)).toThrow(
      "Use child arrays, or renderProp(fn) for intentional render props.",
    );
  });

  it("preserves zero-argument callback props when components read them", () => {
    function Probe(props: { onDone: () => void }) {
      const onDone = props.onDone;
      return <button onClick={() => onDone()}>Done</button>;
    }

    let doneCount = 0;
    render(() =>
      hc(Probe, {
        onDone: () => {
          doneCount += 1;
        },
      })(),
    );

    expect(doneCount).toBe(0);

    fireEvent.click(screen.getByRole("button", { name: "Done" }));

    expect(doneCount).toBe(1);
  });

  it("composes Button press handlers through hc child arrays", async () => {
    function Demo() {
      const [pressCount, setPressCount] = createSignal(0);

      return hc(
        "div",
        {
          get "data-action-count"() {
            return String(pressCount());
          },
        },
        [
          hc(Button, { onClick: (_event: MouseEvent) => setPressCount((count) => count + 1) }, [
            "Primary",
          ]),
        ],
      )();
    }

    render(() => hc(Demo, {})());

    fireEvent.click(screen.getByRole("button", { name: "Primary" }));

    expect(screen.getByText("Primary").closest("[data-action-count]")).toHaveAttribute(
      "data-action-count",
      "1",
    );
  });

  it("keeps TextField input changes observable through hc composition", () => {
    function Demo() {
      const [value, setValue] = createSignal("Quarterly report");

      return hc(
        "div",
        {
          get "data-value"() {
            return value();
          },
        },
        [
          hc(TextField, { defaultValue: "Quarterly report", onChange: setValue }, [
            hc(Label, { for: "comparison-name" }, ["Name"]),
            hc(Input, {
              id: "comparison-name",
              onInput: (event: InputEvent) => {
                setValue((event.currentTarget as HTMLInputElement).value);
              },
            }),
          ]),
        ],
      )();
    }

    render(() => hc(Demo, {})());

    fireEvent.input(screen.getByLabelText("Name"), {
      target: { value: "Updated report" },
    });

    expect(screen.getByLabelText("Name")).toHaveValue("Updated report");
    expect(screen.getByLabelText("Name").closest("[data-value]")).toHaveAttribute(
      "data-value",
      "Updated report",
    );
  });

  it("keeps SelectValue reactive for h-composed option selection", async () => {
    function Demo() {
      const [selectedKey, setSelectedKey] = createSignal<string | null>("bravo");

      return hc(
        Select<TestItem>,
        {
          "aria-label": "Channel",
          items,
          selectedKey,
          onSelectionChange: (key: string | number | null) => {
            const nextKey = key == null ? null : String(key);
            document.body.dataset.lastComparisonSelection = nextKey ?? "";
            setSelectedKey(nextKey);
          },
          getKey: (item: TestItem) => item.id,
          getTextValue: (item: TestItem) => item.label,
        },
        [
          hc(SelectTrigger, {}, [hc(SelectValue, { placeholder: "Pick one" })]),
          hc(
            SelectListBox<TestItem>,
            {},
            renderProp((item: TestItem) => hc(SelectOption, { id: item.id }, [item.label])),
          ),
        ],
      )();
    }

    const user = userEventSetup();
    render(() => hc(Demo, {})());

    expect(screen.getByRole("button", { name: "Channel" })).toHaveTextContent("Bravo");

    await user.click(screen.getByRole("button", { name: "Channel" }));
    await user.click(screen.getByRole("option", { name: "Alpha" }));

    expect(document.body.dataset.lastComparisonSelection).toBe("alpha");
    expect(screen.getByRole("button", { name: "Channel" })).toHaveTextContent("Alpha");
  });

  it("keeps Checkbox state reactive through hc composition", async () => {
    function Demo() {
      const [checked, setChecked] = createSignal(true);

      return hc(
        "div",
        {
          get "data-checked"() {
            return String(checked());
          },
        },
        [
          hc(
            Checkbox,
            {
              defaultSelected: true,
              onChange: setChecked,
            },
            ["Enable alerts"],
          ),
        ],
      )();
    }

    const user = userEventSetup();
    render(() => hc(Demo, {})());

    const checkbox = screen.getByRole("checkbox", { name: "Enable alerts" });
    expect(checkbox).toBeChecked();

    await user.click(checkbox);

    expect(checkbox).not.toBeChecked();
    expect(checkbox.closest("[data-checked]")).toHaveAttribute("data-checked", "false");
  });

  it("keeps RadioGroup selection reactive through hc composition", async () => {
    function Demo() {
      const [selectedKey, setSelectedKey] = createSignal("compact");

      return hc(
        "div",
        {
          get "data-selected-key"() {
            return selectedKey();
          },
        },
        [
          hc(
            RadioGroup,
            {
              "aria-label": "Density",
              defaultValue: "compact",
              onChange: setSelectedKey,
            },
            renderProp(() => [
              hc(Radio, { value: "compact" }, ["Compact"]),
              hc(Radio, { value: "comfortable" }, ["Comfortable"]),
            ]),
          ),
        ],
      )();
    }

    const user = userEventSetup();
    render(() => hc(Demo, {})());

    const comfortable = screen.getByRole("radio", { name: "Comfortable" });

    await user.click(comfortable);

    expect(comfortable).toBeChecked();
    expect(comfortable.closest("[data-selected-key]")).toHaveAttribute(
      "data-selected-key",
      "comfortable",
    );
  });

  it("keeps DialogTrigger open state and close render prop reactive through hc composition", async () => {
    function Demo() {
      const [closeCount, setCloseCount] = createSignal(0);

      return hc(
        "div",
        {
          get "data-close-count"() {
            return String(closeCount());
          },
        },
        [
          hc(
            Dialog,
            {},
            renderProp(({ close }) => [
              hc(Heading, {}, ["Review Changes"]),
              hc(
                Button,
                {
                  onPress: () => {
                    setCloseCount((count) => count + 1);
                    close();
                  },
                },
                ["Close"],
              ),
            ]),
          ),
        ],
      )();
    }

    const user = userEventSetup();
    render(() => hc(Demo, {})());

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    const beforeCloseCount = Number(
      screen.getByRole("dialog").closest("[data-close-count]")?.getAttribute("data-close-count") ??
        "0",
    );

    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Close" }));

    expect(screen.getByRole("dialog").closest("[data-close-count]")).toHaveAttribute(
      "data-close-count",
      String(beforeCloseCount + 1),
    );
  });

  it("keeps Tooltip open state reactive through hc composition", async () => {
    function Demo() {
      const [isOpen, setIsOpen] = createSignal(false);

      return hc(
        "div",
        {
          get "data-open"() {
            return String(isOpen());
          },
        },
        [
          hc(TooltipTrigger, { delay: 0, onOpenChange: setIsOpen }, [
            hc(Button, {}, ["Inspect"]),
            hc(Tooltip, {}, ["Tooltip content"]),
          ]),
        ],
      )();
    }

    render(() => hc(Demo, {})());

    const triggerWrapper = screen.getByRole("button", { name: "Inspect" }).closest("span")!;
    fireEvent.pointerEnter(triggerWrapper, { pointerType: "mouse" });

    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Inspect" }).closest("[data-open]")).toHaveAttribute(
      "data-open",
      "true",
    );
  });

  it("opens DatePicker calendar content through hc-composed date segment render props", async () => {
    function Demo() {
      const [value, setValue] = createSignal("");

      return hc(
        "div",
        {
          get "data-value"() {
            return value();
          },
        },
        [
          hc(
            DatePicker,
            {
              "aria-label": "Due date",
              onChange: (nextValue: unknown) =>
                setValue(nextValue == null ? "" : String(nextValue)),
            },
            [
              hc(
                DateInput,
                {},
                renderProp((segment) => hc(DateSegment, { segment })),
              ),
              hc(DatePickerButton, {}, ["Open calendar"]),
              hc(DatePickerContent, {}, [
                hc(Calendar, {}, [
                  hc("header", {}, [
                    hc(CalendarButton, { slot: "previous" }, ["Previous"]),
                    hc(CalendarHeading, {}),
                    hc(CalendarButton, { slot: "next" }, ["Next"]),
                  ]),
                  hc(
                    CalendarGrid,
                    {},
                    renderProp((date) => hc(CalendarCell, { date })),
                  ),
                ]),
              ]),
            ],
          ),
        ],
      )();
    }

    const user = userEventSetup();
    render(() => hc(Demo, {})());

    await waitFor(() => {
      expect(
        document.querySelector(".solidaria-DatePicker:not(.solidaria-DatePicker--placeholder)"),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Open calendar" }));

    await waitFor(() => {
      expect(screen.getByRole("grid")).toBeInTheDocument();
    });
    expect(document.querySelector(".solidaria-DatePicker")).toHaveAttribute("data-open");
  });

  it("keeps SearchField value and clear behavior reactive through hc composition", async () => {
    function Demo() {
      const [value, setValue] = createSignal("status");
      const [clearCount, setClearCount] = createSignal(0);

      return hc(
        "div",
        {
          get "data-value"() {
            return value();
          },
          get "data-clear-count"() {
            return String(clearCount());
          },
        },
        [
          hc(
            SearchField,
            {
              "aria-label": "Search",
              defaultValue: "status",
              onChange: setValue,
              onClear: () => {
                setValue("");
                setClearCount((count) => count + 1);
              },
            },
            renderProp(() => [
              hc(SearchFieldLabel, {}, ["Search"]),
              hc(SearchFieldInput, {}),
              hc(SearchFieldClearButton, {}, ["Clear"]),
            ]),
          ),
        ],
      )();
    }

    const user = userEventSetup();
    render(() => hc(Demo, {})());

    const input = screen.getByRole("searchbox");
    fireEvent.change(input, { target: { value: "status open" } });
    await waitFor(() => {
      expect(input.closest("[data-value]")).toHaveAttribute("data-value", "status open");
    });

    await user.click(screen.getByRole("button", { name: "Clear search" }));

    expect(input.closest("[data-value]")).toHaveAttribute("data-value", "");
    expect(input.closest("[data-clear-count]")).toHaveAttribute("data-clear-count", "1");
    expect(document.querySelector(".solidaria-SearchField")).toHaveAttribute("data-empty", "true");
  });

  it("keeps Toolbar toggle action state reactive through hc composition", async () => {
    function Demo() {
      const [pressed, setPressed] = createSignal(false);

      return hc(
        "div",
        {
          get "data-pressed"() {
            return String(pressed());
          },
        },
        [
          hc(
            Toolbar,
            { "aria-label": "Formatting tools" },
            renderProp(() => [
              hc(
                ToggleButton,
                {
                  "aria-label": "Bold",
                  isSelected: pressed,
                  onChange: setPressed,
                },
                ["Bold"],
              ),
            ]),
          ),
        ],
      )();
    }

    const user = userEventSetup();
    render(() => hc(Demo, {})());

    const bold = screen.getByRole("button", { name: "Bold" });
    await user.click(bold);

    expect(bold).toHaveAttribute("aria-pressed", "true");
    expect(bold.closest("[data-pressed]")).toHaveAttribute("data-pressed", "true");
  });

  it("keeps Toast visible count and dismissal reactive through hc composition", async () => {
    function Demo() {
      const [visibleCount, setVisibleCount] = createSignal(0);
      const shownKeys: string[] = [];
      const unsubscribe = globalToastQueue.subscribe((toasts) => {
        setVisibleCount(toasts.length);
      });
      onCleanup(() => {
        unsubscribe();
        for (const key of shownKeys) {
          globalToastQueue.close(key);
          globalToastQueue.remove(key);
        }
      });

      const showToast = () => {
        const key = addToast(
          { title: "Saved successfully", description: "Toast content", type: "success" },
          { timeout: 0 },
        );
        shownKeys.push(key);
      };

      return hc(
        "div",
        {
          get "data-visible-count"() {
            return String(visibleCount());
          },
        },
        [
          hc(Button, { onPress: showToast }, ["Show toast"]),
          hc(ToastProvider, { useGlobalQueue: true }, [
            hc(
              ToastRegion,
              { portal: false },
              renderProp((renderProps) =>
                hc(For, {
                  each: renderProps.visibleToasts(),
                  children: (toast) => hc(DefaultToast, { toast }),
                }),
              ),
            ),
          ]),
        ],
      )();
    }

    const user = userEventSetup();
    render(() => hc(Demo, {})());

    await user.click(screen.getByRole("button", { name: "Show toast" }));

    await waitFor(() => {
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });
    expect(
      screen.getByRole("button", { name: "Show toast" }).closest("[data-visible-count]"),
    ).toHaveAttribute("data-visible-count", "1");

    await user.click(screen.getByRole("button", { name: "Close" }));

    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
    expect(
      screen.getByRole("button", { name: "Show toast" }).closest("[data-visible-count]"),
    ).toHaveAttribute("data-visible-count", "0");
  });
});

function userEventSetup() {
  return {
    async click(element: Element) {
      const Pointer = globalThis.PointerEvent ?? MouseEvent;
      element.dispatchEvent(new Pointer("pointerdown", { bubbles: true }));
      element.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      element.dispatchEvent(new Pointer("pointerup", { bubbles: true }));
      element.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
      element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await Promise.resolve();
    },
  };
}

function clearGlobalToasts() {
  const unsubscribe = globalToastQueue.subscribe((toasts) => {
    for (const toast of toasts) {
      globalToastQueue.close(toast.key);
      globalToastQueue.remove(toast.key);
    }
  });
  unsubscribe();
}
