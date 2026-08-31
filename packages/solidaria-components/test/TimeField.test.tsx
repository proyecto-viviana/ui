/**
 * TimeField tests - Port of React Aria's TimeField.test.tsx
 *
 * Tests for TimeField component functionality including:
 * - Rendering
 * - Segments
 * - Value control
 * - Keyboard interactions
 * - Disabled/readonly states
 * - ARIA attributes
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vite-plus/test";
import { render, screen, cleanup, fireEvent, waitFor } from "@solidjs/testing-library";
import { Time } from "@internationalized/date";
import { I18nProvider } from "@proyecto-viviana/solidaria";
import {
  TimeField,
  TimeFieldLabel,
  TimeFieldDescription,
  TimeFieldErrorMessage,
} from "../src/TimeField";
// TimeField reuses the certified DateField segment stack — there is no
// TimeInput/TimeSegment upstream (RAC TimeField renders DateInput/DateSegment).
import { DateInput, DateSegment } from "../src/DateField";
import { Text } from "../src/Text";
import { Form } from "../src/Form";
import { setupUser } from "@proyecto-viviana/solidaria-test-utils";

// setupUser is consolidated in solidaria-test-utils.

// Helper to wait for TimeField to hydrate (it uses client-only rendering)
async function waitForTimeFieldHydration() {
  await waitFor(
    () => {
      // TimeField should have rendered its inner content (not the placeholder)
      const field = document.querySelector(".solidaria-TimeField");
      expect(field).toBeInTheDocument();
      // Also check for segments to ensure hydration is complete
      const segments = document.querySelectorAll(".solidaria-DateSegment");
      expect(segments.length).toBeGreaterThan(0);
    },
    { timeout: 2000 },
  );
}

// Helper component for testing
function TestTimeField(props: { fieldProps?: Partial<Parameters<typeof TimeField>[0]> }) {
  return (
    <TimeField aria-label="Test Time" {...props.fieldProps}>
      <DateInput>{(segment) => <DateSegment segment={segment} />}</DateInput>
    </TimeField>
  );
}

describe("TimeField", () => {
  let user: ReturnType<typeof setupUser>;

  beforeEach(() => {
    user = setupUser();
  });

  afterEach(() => {
    cleanup();
  });

  // ============================================
  // RENDERING
  // ============================================

  describe("rendering", () => {
    it("should render with default class", async () => {
      render(() => <TestTimeField />);
      await waitForTimeFieldHydration();

      const field = document.querySelector(".solidaria-TimeField");
      expect(field).toBeInTheDocument();
    });

    it("should render time input", async () => {
      render(() => <TestTimeField />);
      await waitForTimeFieldHydration();

      const input = document.querySelector(".solidaria-DateInput");
      expect(input).toBeInTheDocument();
    });

    it("should render segments", async () => {
      render(() => <TestTimeField />);
      await waitForTimeFieldHydration();

      const segments = document.querySelectorAll(".solidaria-DateSegment");
      expect(segments.length).toBeGreaterThan(0);
    });

    it("should render with custom class", async () => {
      render(() => <TestTimeField fieldProps={{ class: "my-time-field" }} />);

      // Wait for segments since custom class overrides default class
      await waitFor(
        () => {
          const segments = document.querySelectorAll(".solidaria-DateSegment");
          expect(segments.length).toBeGreaterThan(0);
        },
        { timeout: 2000 },
      );

      const field = document.querySelector(".my-time-field");
      expect(field).toBeInTheDocument();
    });

    it('links aria-describedby to a <Text slot="description"> via TextContext slots', async () => {
      // TimeField provides descriptionProps as a TextContext slot, so the
      // <Text slot="description"> picks up the id the group's aria-describedby
      // references — the faithful upstream wiring path.
      render(() => (
        <TimeField aria-label="Test Time" description="Help text">
          <DateInput>{(segment) => <DateSegment segment={segment} />}</DateInput>
          <Text slot="description">Help text</Text>
        </TimeField>
      ));
      await waitForTimeFieldHydration();

      const group = screen.getByRole("group", { name: "Test Time" });
      const describedById = group.getAttribute("aria-describedby");
      expect(describedById).toBeTruthy();
      const description = document.getElementById(describedById!);
      expect(description).toHaveTextContent("Help text");
      expect(description).toHaveClass("solidaria-Text");
    });

    it("should render hidden form input when name is provided", async () => {
      render(() => (
        <TestTimeField
          fieldProps={{
            name: "startTime",
            defaultValue: new Time(9, 30),
          }}
        />
      ));
      await waitForTimeFieldHydration();

      const input = document.querySelector('input[name="startTime"]') as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("type", "text");
      expect(input).toHaveAttribute("hidden");
      // Faithful to upstream useTimeField: the hidden input serializes
      // state.timeValue, and Time.toString() always includes seconds.
      expect(input).toHaveValue("09:30:00");
    });

    it("should render a native required input for native validation behavior", async () => {
      render(() => (
        <TestTimeField
          fieldProps={{
            name: "startTime",
            isRequired: true,
            validationBehavior: "native",
            defaultValue: new Time(9, 30),
          }}
        />
      ));
      await waitForTimeFieldHydration();

      const input = document.querySelector('input[name="startTime"]') as HTMLInputElement;
      expect(input).toHaveAttribute("type", "text");
      expect(input).toHaveAttribute("hidden");
      expect(input).toBeRequired();
    });

    it("should render hidden input semantics for aria validation behavior", async () => {
      render(() => (
        <TestTimeField
          fieldProps={{
            name: "startTime",
            isRequired: true,
            validationBehavior: "aria",
            defaultValue: new Time(9, 30),
          }}
        />
      ));
      await waitForTimeFieldHydration();

      const input = document.querySelector('input[name="startTime"]') as HTMLInputElement;
      expect(input).toHaveAttribute("type", "hidden");
      expect(input).not.toHaveAttribute("hidden");
      expect(input).not.toBeRequired();
    });

    it("should inherit validation behavior from Form context", async () => {
      render(() => (
        <Form validationBehavior="aria">
          <TestTimeField
            fieldProps={{
              name: "startTime",
              isRequired: true,
              defaultValue: new Time(9, 30),
            }}
          />
        </Form>
      ));
      await waitForTimeFieldHydration();

      const input = document.querySelector('input[name="startTime"]') as HTMLInputElement;
      expect(input).toHaveAttribute("type", "hidden");
      expect(input).not.toHaveAttribute("hidden");
      expect(input).not.toBeRequired();
    });

    it("should participate in associated form data", async () => {
      render(() => (
        <div>
          <form id="scheduleForm" />
          <TestTimeField
            fieldProps={{
              name: "startTime",
              form: "scheduleForm",
              defaultValue: new Time(9, 30),
            }}
          />
        </div>
      ));
      await waitForTimeFieldHydration();

      const input = document.querySelector('input[name="startTime"]') as HTMLInputElement;
      const form = document.getElementById("scheduleForm") as HTMLFormElement;
      expect(input).toHaveAttribute("form", "scheduleForm");
      expect(form).toBeInTheDocument();
      expect(new FormData(form).getAll("startTime").map(String)).toEqual(["09:30:00"]);
    });
  });

  // ============================================
  // SEGMENTS
  // ============================================

  describe("segments", () => {
    it("should render hour segment", async () => {
      render(() => <TestTimeField />);
      await waitForTimeFieldHydration();

      const hourSegment = document.querySelector('[data-type="hour"]');
      expect(hourSegment).toBeInTheDocument();
    });

    it("should render minute segment", async () => {
      render(() => <TestTimeField />);
      await waitForTimeFieldHydration();

      const minuteSegment = document.querySelector('[data-type="minute"]');
      expect(minuteSegment).toBeInTheDocument();
    });

    it("should render spinbutton role on editable segments", async () => {
      render(() => <TestTimeField />);
      await waitForTimeFieldHydration();

      const spinbuttons = screen.getAllByRole("spinbutton");
      expect(spinbuttons.length).toBeGreaterThan(0);
    });

    it("should expose the field wrapper as a group (matches upstream useDateField)", async () => {
      render(() => <TestTimeField />);
      await waitForTimeFieldHydration();

      // Upstream useDateField (shared by TimeField) gives the standalone field
      // grouping element role="group"; the spinbutton segments live inside it.
      const group = screen.getByRole("group", { name: "Test Time" });
      expect(group).toBeInTheDocument();
      expect(group.querySelectorAll('[role="spinbutton"]').length).toBeGreaterThan(0);
    });

    it("should render literal segments as separators", async () => {
      render(() => <TestTimeField />);
      await waitForTimeFieldHydration();

      const literalSegment = document.querySelector('[data-type="literal"]');
      expect(literalSegment).toBeInTheDocument();
    });
  });

  // ============================================
  // VALUE CONTROL
  // ============================================

  describe("value control", () => {
    it("should display defaultValue", async () => {
      render(() => <TestTimeField fieldProps={{ defaultValue: new Time(14, 30) }} />);
      await waitForTimeFieldHydration();

      const hourSegment = document.querySelector('[data-type="hour"]');
      expect(hourSegment).toBeInTheDocument();
    });

    it("should display controlled value", async () => {
      render(() => <TestTimeField fieldProps={{ value: new Time(9, 15) }} />);
      await waitForTimeFieldHydration();

      const hourSegment = document.querySelector('[data-type="hour"]');
      expect(hourSegment).toBeInTheDocument();
    });

    it("should fire onChange when value changes", async () => {
      const onChange = vi.fn();
      render(() => <TestTimeField fieldProps={{ defaultValue: new Time(10, 0), onChange }} />);
      await waitForTimeFieldHydration();

      const spinbuttons = screen.getAllByRole("spinbutton");
      expect(spinbuttons.length).toBeGreaterThan(0);

      const hourSegment = spinbuttons[0];
      hourSegment.focus();
      await user.keyboard("{ArrowUp}");

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });
    });

    it("should show placeholder when empty", async () => {
      render(() => <TestTimeField />);
      await waitForTimeFieldHydration();

      // data-placeholder is an empty string attribute when true (standard data attribute pattern)
      const placeholderSegment = document.querySelector("[data-placeholder]");
      expect(placeholderSegment).toBeInTheDocument();
    });
  });

  // ============================================
  // VALIDATION
  // ============================================

  describe("validation", () => {
    it("should support explicit invalid state without a value", async () => {
      render(() => (
        <TimeField aria-label="Test Time" validationState="invalid" errorMessage="Time is required">
          <DateInput>{(segment) => <DateSegment segment={segment} />}</DateInput>
          <TimeFieldErrorMessage>Time is required</TimeFieldErrorMessage>
        </TimeField>
      ));
      await waitForTimeFieldHydration();

      // data-invalid rides on the roleless field root; the aria-describedby
      // linkage lives on the role="group" (the DateInput), matching upstream
      // useDateField which puts group ARIA on the field grouping element.
      const field = document.querySelector(".solidaria-TimeField") as HTMLElement;
      const group = screen.getByRole("group", { name: "Test Time" });
      const error = screen.getByText("Time is required");

      expect(field).toHaveAttribute("data-invalid");
      expect(error).toHaveAttribute("id");
      expect(group.getAttribute("aria-describedby")).toContain(error.getAttribute("id"));
    });

    it("should mark field as invalid when value is outside min and max values", async () => {
      render(() => (
        <TestTimeField
          fieldProps={{
            defaultValue: new Time(7, 30),
            minValue: new Time(8, 0),
            maxValue: new Time(18, 0),
            validationBehavior: "aria",
          }}
        />
      ));
      await waitForTimeFieldHydration();

      const field = document.querySelector(".solidaria-TimeField");
      expect(field).toHaveAttribute("data-invalid");
    });

    it("should keep native range validation hidden until committed", async () => {
      render(() => (
        <TestTimeField
          fieldProps={{
            name: "startTime",
            defaultValue: new Time(7, 30),
            minValue: new Time(8, 0),
          }}
        />
      ));
      await waitForTimeFieldHydration();

      const field = document.querySelector(".solidaria-TimeField") as HTMLElement;
      const input = document.querySelector('input[name="startTime"]') as HTMLInputElement;

      expect(field).not.toHaveAttribute("data-invalid");
      expect(input).toHaveAttribute("type", "text");
      expect(input).toHaveAttribute("hidden");
      expect(input).not.toHaveAttribute("min");
    });

    it("should support custom validation in aria mode", async () => {
      render(() => (
        <TestTimeField
          fieldProps={{
            defaultValue: new Time(9, 30),
            validationBehavior: "aria",
            validate: () => "Unavailable time",
          }}
        />
      ));
      await waitForTimeFieldHydration();

      const field = document.querySelector(".solidaria-TimeField") as HTMLElement;
      expect(field).toHaveAttribute("data-invalid");
    });
  });

  // ============================================
  // KEYBOARD INTERACTIONS
  // ============================================

  describe("keyboard interactions", () => {
    it("should navigate to next segment with ArrowRight", async () => {
      render(() => <TestTimeField fieldProps={{ defaultValue: new Time(10, 30) }} />);
      await waitForTimeFieldHydration();

      const spinbuttons = screen.getAllByRole("spinbutton");
      expect(spinbuttons.length).toBeGreaterThan(1);

      spinbuttons[0].focus();
      fireEvent.keyDown(spinbuttons[0], { key: "ArrowRight" });
      expect(spinbuttons[1]).toHaveFocus();
    });

    // Skipped: RTL segment navigation resolves the visual-next segment
    // geometrically via getBoundingClientRect (matching upstream
    // useDatePickerGroup), which returns all-zeros in jsdom's layout-less DOM,
    // so no segment is ever found. Certified in the real-browser pair-oracle spec.
    it.skip("should follow RTL segment navigation with ArrowRight", async () => {
      render(() => (
        <I18nProvider locale="he-IL">
          <TestTimeField fieldProps={{ defaultValue: new Time(10, 30) }} />
        </I18nProvider>
      ));
      await waitForTimeFieldHydration();

      const spinbuttons = screen.getAllByRole("spinbutton");
      expect(spinbuttons.length).toBeGreaterThan(1);

      spinbuttons[1].focus();
      fireEvent.keyDown(spinbuttons[1], { key: "ArrowRight" });
      expect(spinbuttons[0]).toHaveFocus();
    });

    it("should increment with ArrowUp", async () => {
      const onChange = vi.fn();
      render(() => <TestTimeField fieldProps={{ defaultValue: new Time(10, 30), onChange }} />);
      await waitForTimeFieldHydration();

      const spinbuttons = screen.getAllByRole("spinbutton");
      expect(spinbuttons.length).toBeGreaterThan(0);

      const hourSegment = spinbuttons[0];
      hourSegment.focus();
      await user.keyboard("{ArrowUp}");

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });
    });

    it("should decrement with ArrowDown", async () => {
      const onChange = vi.fn();
      render(() => <TestTimeField fieldProps={{ defaultValue: new Time(10, 30), onChange }} />);
      await waitForTimeFieldHydration();

      const spinbuttons = screen.getAllByRole("spinbutton");
      expect(spinbuttons.length).toBeGreaterThan(0);

      const hourSegment = spinbuttons[0];
      hourSegment.focus();
      await user.keyboard("{ArrowDown}");

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });
    });

    it("should accept numeric input", async () => {
      const onChange = vi.fn();
      render(() => <TestTimeField fieldProps={{ defaultValue: new Time(10, 30), onChange }} />);
      await waitForTimeFieldHydration();

      const spinbuttons = screen.getAllByRole("spinbutton");
      expect(spinbuttons.length).toBeGreaterThan(0);

      const hourSegment = spinbuttons[0];
      hourSegment.focus();
      await user.keyboard("5");

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });
    });

    // Skipped here: typed digits (including full-width) reach the value model
    // through the contenteditable's onBeforeInput → onInput path (matching
    // upstream useDateSegment), not onKeyDown. jsdom does not synthesize that
    // contenteditable path from a keyDown. The parser branch is held by
    // solidaria's createDateSegment beforeinput regression, while the certified
    // browser pair proves the component's ASCII typed-input wiring. There is no
    // browser-level full-width integration claim yet.
    it.skip("should accept full-width digits in numeric input", async () => {
      const onChange = vi.fn();
      render(() => <TestTimeField fieldProps={{ defaultValue: new Time(10, 30), onChange }} />);
      await waitForTimeFieldHydration();

      const spinbuttons = screen.getAllByRole("spinbutton");
      const hourSegment = spinbuttons[0];
      hourSegment.focus();
      fireEvent.keyDown(hourSegment, { key: "１" });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });
    });
  });

  // ============================================
  // DISABLED STATE
  // ============================================

  describe("disabled state", () => {
    it("should support isDisabled", async () => {
      render(() => <TestTimeField fieldProps={{ isDisabled: true }} />);
      await waitForTimeFieldHydration();

      const field = document.querySelector(".solidaria-TimeField");
      expect(field).toHaveAttribute("data-disabled");
    });

    it("should have aria-disabled on segments when disabled", async () => {
      render(() => (
        <TestTimeField fieldProps={{ isDisabled: true, defaultValue: new Time(10, 30) }} />
      ));
      await waitForTimeFieldHydration();

      const hourSegment = document.querySelector('[data-type="hour"]');
      expect(hourSegment).toHaveAttribute("aria-disabled", "true");
    });

    it("should not respond to keyboard when disabled", async () => {
      const onChange = vi.fn();
      render(() => (
        <TestTimeField
          fieldProps={{ isDisabled: true, defaultValue: new Time(10, 30), onChange }}
        />
      ));
      await waitForTimeFieldHydration();

      const hourSegment = document.querySelector('[data-type="hour"]') as HTMLElement;
      expect(hourSegment).toBeInTheDocument();

      hourSegment.focus();
      await user.keyboard("{ArrowUp}");

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // READ ONLY STATE
  // ============================================

  describe("read only state", () => {
    it("should support isReadOnly", async () => {
      render(() => <TestTimeField fieldProps={{ isReadOnly: true }} />);
      await waitForTimeFieldHydration();

      const field = document.querySelector(".solidaria-TimeField");
      expect(field).toHaveAttribute("data-readonly");
    });

    it("should have aria-readonly on segments when read-only", async () => {
      render(() => (
        <TestTimeField fieldProps={{ isReadOnly: true, defaultValue: new Time(10, 30) }} />
      ));
      await waitForTimeFieldHydration();

      const hourSegment = document.querySelector('[data-type="hour"]');
      expect(hourSegment).toHaveAttribute("aria-readonly", "true");
    });
  });

  // ============================================
  // REQUIRED STATE
  // ============================================

  describe("required state", () => {
    it("should support isRequired", async () => {
      render(() => <TestTimeField fieldProps={{ isRequired: true }} />);
      await waitForTimeFieldHydration();

      const field = document.querySelector(".solidaria-TimeField");
      expect(field).toHaveAttribute("data-required");
    });
  });

  // ============================================
  // ARIA ATTRIBUTES
  // ============================================

  describe("aria attributes", () => {
    it("should have spinbutton role on editable segments", async () => {
      render(() => <TestTimeField fieldProps={{ defaultValue: new Time(10, 30) }} />);
      await waitForTimeFieldHydration();

      const spinbuttons = screen.getAllByRole("spinbutton");
      expect(spinbuttons.length).toBeGreaterThan(0);
    });

    it("should have aria-label on segments", async () => {
      render(() => <TestTimeField fieldProps={{ defaultValue: new Time(10, 30) }} />);
      await waitForTimeFieldHydration();

      // Faithful to the certified DateSegment: each segment self-refs its field
      // label via createLabels — "<lowercase segment name>, <field label>".
      const hourSegment = document.querySelector('[data-type="hour"]');
      expect(hourSegment).toHaveAttribute("aria-label", "hour, Test Time");
    });

    it("should have aria-valuenow on segments", async () => {
      render(() => <TestTimeField fieldProps={{ defaultValue: new Time(10, 30) }} />);
      await waitForTimeFieldHydration();

      const hourSegment = document.querySelector('[data-type="hour"]');
      expect(hourSegment).toHaveAttribute("aria-valuenow");
    });

    it("wires visible label to field aria-labelledby", async () => {
      render(() => (
        <TimeField label="Meeting time">
          <TimeFieldLabel>Meeting time</TimeFieldLabel>
          <DateInput>{(segment) => <DateSegment segment={segment} />}</DateInput>
        </TimeField>
      ));
      await waitForTimeFieldHydration();

      const group = screen.getByRole("group", { name: "Meeting time" });
      const label = screen.getByText("Meeting time");

      expect(label.tagName).toBe("SPAN");
      expect(label).toHaveAttribute("id");
      expect(group).toHaveAttribute("aria-labelledby");
      expect(group.getAttribute("aria-labelledby")).toContain(label.getAttribute("id"));
    });

    it("wires description and error message to aria-describedby", async () => {
      render(() => (
        <TimeField
          aria-label="Time"
          isInvalid
          description="Choose your preferred time"
          errorMessage="Time is required"
        >
          <DateInput>{(segment) => <DateSegment segment={segment} />}</DateInput>
          <TimeFieldDescription>Choose your preferred time</TimeFieldDescription>
          <TimeFieldErrorMessage>Time is required</TimeFieldErrorMessage>
        </TimeField>
      ));
      await waitForTimeFieldHydration();

      const group = screen.getByRole("group", { name: "Time" });
      const description = screen.getByText("Choose your preferred time");
      const error = screen.getByText("Time is required");

      expect(description).toHaveAttribute("id");
      expect(error).toHaveAttribute("id");
      expect(group).toHaveAttribute("aria-describedby");
      expect(group.getAttribute("aria-describedby")).toContain(description.getAttribute("id"));
      expect(group.getAttribute("aria-describedby")).toContain(error.getAttribute("id"));
    });
  });

  // ============================================
  // DATA ATTRIBUTES
  // ============================================

  describe("data attributes", () => {
    it("should have data-type on segments", async () => {
      render(() => <TestTimeField />);
      await waitForTimeFieldHydration();

      const hourSegment = document.querySelector('[data-type="hour"]');
      expect(hourSegment).toBeInTheDocument();

      const minuteSegment = document.querySelector('[data-type="minute"]');
      expect(minuteSegment).toBeInTheDocument();
    });

    it("should expose the segment type via data-type", async () => {
      render(() => <TestTimeField fieldProps={{ defaultValue: new Time(10, 30) }} />);
      await waitForTimeFieldHydration();

      // Segments carry the certified DateSegment attribute `data-type`
      // (hour/minute/…) — not the previously invented `data-editable`, which
      // upstream never emits.
      const segments = document.querySelectorAll('[role="spinbutton"]');
      expect(segments.length).toBeGreaterThan(0);
      segments.forEach((segment) => {
        expect(segment).toHaveAttribute("data-type");
        expect(segment.getAttribute("data-type")).toBeTruthy();
      });
    });

    it("should have data-placeholder on placeholder segments", async () => {
      render(() => <TestTimeField />);
      await waitForTimeFieldHydration();

      // data-placeholder is an empty string attribute when true
      const placeholder = document.querySelector("[data-placeholder]");
      expect(placeholder).toBeInTheDocument();
    });
  });
});
