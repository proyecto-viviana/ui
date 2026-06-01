/**
 * createTextField tests for Solidaria
 *
 * This is a 1:1 port of @react-aria/textfield's useTextField.test.js
 */

import { describe, it, expect, vi } from "vitest";
import { createRoot } from "solid-js";
import { createTextField } from "../src";

describe("createTextField hook", () => {
  let renderTextFieldHook = (props: Parameters<typeof createTextField>[0]) => {
    let inputProps: ReturnType<typeof createTextField>["inputProps"];
    createRoot((dispose) => {
      const result = createTextField(props);
      inputProps = result.inputProps;
      dispose();
    });
    return inputProps!;
  };

  describe("should return textFieldProps", () => {
    it("with default textfield props if no props are provided", () => {
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const props = renderTextFieldHook({});
      expect(props.type).toBe("text");
      expect(props.disabled).toBeFalsy();
      expect(props.readOnly).toBeFalsy();
      expect(props["aria-invalid"]).toBeUndefined();
      expect(props["aria-required"]).toBeUndefined();
      expect(typeof props.onChange).toBe("function");
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "If you do not provide a visible label, you must specify an aria-label or aria-labelledby attribute for accessibility",
      );
      consoleWarnSpy.mockRestore();
    });

    it("with appropriate props if type is defined", () => {
      const type = "search";
      const props = renderTextFieldHook({ type, "aria-label": "mandatory label" });
      expect(props.type).toBe(type);
    });

    it("with appropriate props if isDisabled is defined", () => {
      let props = renderTextFieldHook({ isDisabled: true, "aria-label": "mandatory label" });
      expect(props.disabled).toBeTruthy();

      props = renderTextFieldHook({ isDisabled: false, "aria-label": "mandatory label" });
      expect(props.disabled).toBeFalsy();
    });

    it("with appropriate props if isRequired is defined", () => {
      let props = renderTextFieldHook({ isRequired: true, "aria-label": "mandatory label" });
      expect(props.required).toBeTruthy();
      expect(props["aria-required"]).toBeUndefined();

      props = renderTextFieldHook({ isRequired: false, "aria-label": "mandatory label" });
      expect(props.required).toBeFalsy();
      expect(props["aria-required"]).toBeUndefined();
    });

    it("with aria required props if aria validation behavior is defined", () => {
      const props = renderTextFieldHook({
        isRequired: true,
        validationBehavior: "aria",
        "aria-label": "mandatory label",
      });

      expect(props.required).toBeFalsy();
      expect(props["aria-required"]).toBeTruthy();
    });

    it("with appropriate props if isReadOnly is defined", () => {
      let props = renderTextFieldHook({ isReadOnly: true, "aria-label": "mandatory label" });
      expect(props.readOnly).toBeTruthy();

      props = renderTextFieldHook({ isReadOnly: false, "aria-label": "mandatory label" });
      expect(props.readOnly).toBeFalsy();
    });

    it("with appropriate props if isInvalid is true", () => {
      let props = renderTextFieldHook({ isInvalid: true, "aria-label": "mandatory label" });
      expect(props["aria-invalid"]).toBeTruthy();

      props = renderTextFieldHook({ isInvalid: false, "aria-label": "mandatory label" });
      expect(props["aria-invalid"]).toBeUndefined();
    });

    it("with appropriate props if isInvalid is defined", () => {
      let props = renderTextFieldHook({ isInvalid: true, "aria-label": "mandatory label" });
      expect(props["aria-invalid"]).toBeTruthy();

      props = renderTextFieldHook({ isInvalid: false, "aria-label": "mandatory label" });
      expect(props["aria-invalid"]).toBeUndefined();
    });

    it("with appropriate props if autoCapitalize is defined", () => {
      let props = renderTextFieldHook({ autoCapitalize: "on", "aria-label": "mandatory label" });
      expect(props.autoCapitalize).toBe("on");

      props = renderTextFieldHook({ autoCapitalize: "off", "aria-label": "mandatory label" });
      expect(props.autoCapitalize).toBe("off");
    });

    it("with an onChange that calls user specified onChange with appropriate values", () => {
      const onChange = vi.fn();
      const props = renderTextFieldHook({ onChange, "aria-label": "mandatory label" });
      const mockEvent = {
        target: {
          value: "test value",
        },
      };

      (props.onChange as (e: Event) => void)(mockEvent as unknown as Event);
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(mockEvent.target.value);
      onChange.mockClear();
    });

    it("without type prop if inputElementType is textarea", () => {
      const type = "search";
      const pattern = /pattern/.source;
      const props = renderTextFieldHook({
        type,
        pattern,
        inputElementType: "textarea",
        "aria-label": "Notes",
      });
      expect(props.type).toBeUndefined();
      expect(props.pattern).toBeUndefined();
    });
  });
});
