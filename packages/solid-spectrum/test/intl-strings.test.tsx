/**
 * @vitest-environment jsdom
 *
 * These assertions fail if the styled layer still inlines English instead of
 * formatting the S2 catalog string at the matching S2 call site.
 */

import { describe, expect, it } from "vite-plus/test";
import { render, screen, waitFor } from "@solidjs/testing-library";
import { I18nProvider } from "@proyecto-viviana/solidaria";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";
import { ActionBar } from "../src/actionbar";
import { ComboBox, ComboBoxOption } from "../src";
import { DatePicker } from "../src/calendar/DatePicker";
import { DateRangePicker } from "../src/calendar/DateRangePicker";
import { parseDateTime } from "@proyecto-viviana/solid-stately";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuTrigger,
  Text,
  UnavailableMenuItemTrigger,
} from "../src/menu";
import { Picker, PickerItem } from "../src/picker";
import { TextField } from "../src/textfield";

const user = setupUser();

describe("S2 catalog strings under I18nProvider", () => {
  it("renders the ar-AE necessity marker on TextField instead of English", () => {
    render(() => (
      <I18nProvider locale="ar-AE">
        <TextField label="Name" isRequired necessityIndicator="label" />
      </I18nProvider>
    ));
    expect(screen.getByText("(مطلوب)")).toBeInTheDocument();
    expect(screen.queryByText("(required)")).not.toBeInTheDocument();
  });

  it("renders the ar-AE necessity marker on Picker instead of English", () => {
    render(() => (
      <I18nProvider locale="ar-AE">
        <Picker label="Plan" isRequired necessityIndicator="label">
          <PickerItem id="a">A</PickerItem>
        </Picker>
      </I18nProvider>
    ));
    expect(screen.getByText("(مطلوب)")).toBeInTheDocument();
    expect(screen.queryByText("(required)")).not.toBeInTheDocument();
  });

  it("labels Picker loading-more from the ar-AE catalog, not English", () => {
    render(() => (
      <I18nProvider locale="ar-AE">
        <Picker
          aria-label="Docs"
          defaultOpen
          items={[{ id: "a", label: "A" }]}
          getKey={(item) => item.id}
          getTextValue={(item) => item.label}
          loadingState="loadingMore"
          onLoadMore={() => {}}
        >
          {(item) => <PickerItem id={item.id}>{item.label}</PickerItem>}
        </Picker>
      </I18nProvider>
    ));
    expect(screen.getByRole("progressbar", { name: "جارٍ تحميل المزيد..." })).toBeInTheDocument();
    expect(screen.queryByRole("progressbar", { name: "Loading more…" })).not.toBeInTheDocument();
  });

  it("renders the ar-AE DatePicker time label instead of English", async () => {
    render(() => (
      <I18nProvider locale="ar-AE">
        <DatePicker label="Event" granularity="minute" />
      </I18nProvider>
    ));
    await user.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(screen.getByText("الوقت")).toBeInTheDocument();
    });
    expect(screen.queryByText("Time")).not.toBeInTheDocument();
  });

  it("renders ar-AE DateRangePicker start and end time labels instead of English", async () => {
    render(() => (
      <I18nProvider locale="ar-AE">
        <DateRangePicker
          aria-label="Range"
          defaultOpen
          granularity="minute"
          defaultValue={{
            start: parseDateTime("2025-02-03T08:45:00"),
            end: parseDateTime("2025-02-14T17:30:00"),
          }}
        />
      </I18nProvider>
    ));
    await waitFor(() => {
      expect(screen.getByText("وقت البدء")).toBeInTheDocument();
      expect(screen.getByText("وقت الانتهاء")).toBeInTheDocument();
    });
    expect(screen.queryByText("Start time")).not.toBeInTheDocument();
    expect(screen.queryByText("End time")).not.toBeInTheDocument();
  });

  it("formats the ActionBar selected count through the ICU message under ar-AE", () => {
    render(() => (
      <I18nProvider locale="ar-AE">
        <ActionBar selectedItemCount={3} onClearSelection={() => {}}>
          <button type="button">Delete</button>
        </ActionBar>
      </I18nProvider>
    ));
    expect(screen.getByText("3 محدد")).toBeInTheDocument();
    expect(screen.queryByText("3 selected")).not.toBeInTheDocument();
  });

  it("formats the ActionBar selected count through the ICU plural under de-DE", () => {
    render(() => (
      <I18nProvider locale="de-DE">
        <ActionBar selectedItemCount={1} onClearSelection={() => {}}>
          <button type="button">Delete</button>
        </ActionBar>
      </I18nProvider>
    ));
    expect(screen.getByText("1 ausgewählt")).toBeInTheDocument();
    expect(screen.queryByText("1 selected")).not.toBeInTheDocument();
  });

  it("labels an unavailable Menu item from the ar-AE catalog, not English", () => {
    render(() => (
      <I18nProvider locale="ar-AE">
        <MenuTrigger defaultOpen>
          <MenuButton>Actions</MenuButton>
          <Menu aria-label="Actions">
            <UnavailableMenuItemTrigger isUnavailable>
              <MenuItem id="locked" textValue="Locked">
                <Text slot="label">Locked</Text>
              </MenuItem>
            </UnavailableMenuItemTrigger>
          </Menu>
        </MenuTrigger>
      </I18nProvider>
    ));
    expect(
      screen.getByRole("img", { name: "غير مُتوفر، قُم بالتوسيع للحصول على التفاصيل" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("img", { name: "Unavailable, expand for details" }),
    ).not.toBeInTheDocument();
  });

  it("renders ComboBox no-results from the ar-AE catalog, not English", () => {
    render(() => (
      <I18nProvider locale="ar-AE">
        <ComboBox<{ id: string; name: string }>
          label="Fruit"
          items={[]}
          defaultOpen
          getKey={(item) => item.id}
          getTextValue={(item) => item.name}
        >
          {(item) => <ComboBoxOption id={item.id}>{item.name}</ComboBoxOption>}
        </ComboBox>
      </I18nProvider>
    ));
    expect(screen.getByText("لا توجد نتائج")).toBeInTheDocument();
    expect(screen.queryByText("No results")).not.toBeInTheDocument();
  });
});
