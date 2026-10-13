/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { render, screen } from "@solidjs/testing-library";
import { createSignal, flush, useContext } from "solid-js";
import {
  ActionButton,
  Button,
  Checkbox,
  ColorSchemeContext,
  Dialog,
  DialogTrigger,
  Menu,
  MenuItem,
  MenuTrigger,
  Provider,
  SearchField,
  SegmentedControl,
  SegmentedControlItem,
  Switch,
  TextField,
  ToggleButton,
  Tooltip,
  TooltipTrigger,
} from "../src";

function strictReads(warn: ReturnType<typeof vi.spyOn>): string[] {
  return warn.mock.calls
    .map((call) => String(call[0]))
    .filter((message) => message.includes("STRICT_READ_UNTRACKED"))
    .map((message) => message.split("\n")[0]!);
}

function SchemeReadout() {
  const scheme = useContext(ColorSchemeContext);
  return <output data-testid="scheme">{scheme?.()}</output>;
}

describe("Provider", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // #651: the context held the scheme string, so a consumer kept the scheme
  // the provider mounted with.
  it("a consumer of ColorSchemeContext follows a scheme change", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const [scheme, setScheme] = createSignal<"light" | "dark">("dark");

    render(() => (
      <Provider colorScheme={scheme()}>
        <SchemeReadout />
        <Provider>
          <span data-testid="nested">
            <SchemeReadout />
          </span>
        </Provider>
      </Provider>
    ));

    expect(strictReads(warn)).toEqual([]);
    const [outer, nested] = screen.getAllByTestId("scheme");
    expect(outer).toHaveTextContent("dark");
    expect(nested).toHaveTextContent("dark");

    setScheme("light");
    flush();

    expect(outer).toHaveTextContent("light");
    expect(nested).toHaveTextContent("light");
  });

  it("reads null outside a Provider", () => {
    let seen: unknown = "unset";
    function Probe() {
      seen = useContext(ColorSchemeContext);
      return null;
    }
    render(() => <Probe />);
    expect(seen).toBeNull();
  });

  // The #651 probe page: eleven components with signal-driven props under a
  // Provider. It logged 199 reports before the ticket and 1 before this case.
  it("eleven components with signal-driven props mount with no STRICT_READ_UNTRACKED report", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const [on] = createSignal(false);
    const [text] = createSignal("query");
    const [scheme] = createSignal<"light" | "dark">("dark");

    render(() => (
      <Provider colorScheme={scheme()}>
        <ToggleButton isSelected={on()} isDisabled={on()}>
          Pin
        </ToggleButton>
        <Button isDisabled={on()}>Save</Button>
        <ActionButton isDisabled={on()}>Edit</ActionButton>
        <SearchField aria-label="Search" value={text()} isDisabled={on()} />
        <Switch isSelected={on()} isDisabled={on()}>
          Alerts
        </Switch>
        <SegmentedControl aria-label="View" selectedKey={on() ? "grid" : "list"}>
          <SegmentedControlItem id="list">List</SegmentedControlItem>
          <SegmentedControlItem id="grid">Grid</SegmentedControlItem>
        </SegmentedControl>
        <MenuTrigger>
          <ActionButton>More</ActionButton>
          <Menu aria-label="More">
            <MenuItem id="copy">Copy</MenuItem>
          </Menu>
        </MenuTrigger>
        <DialogTrigger>
          <ActionButton>Details</ActionButton>
          <Dialog>Body</Dialog>
        </DialogTrigger>
        <TextField label="Name" value={text()} isDisabled={on()} />
        <Checkbox isSelected={on()} isDisabled={on()}>
          Terms
        </Checkbox>
        <TooltipTrigger>
          <ActionButton>Help</ActionButton>
          <Tooltip>Hint</Tooltip>
        </TooltipTrigger>
      </Provider>
    ));

    expect(screen.getByRole("button", { name: "Pin" })).toBeInTheDocument();
    expect(strictReads(warn)).toEqual([]);
  });
});
