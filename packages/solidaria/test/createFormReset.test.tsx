/**
 * Tests for createFormReset utility.
 */

import { describe, it, expect, vi, afterEach } from "vite-plus/test";
import { render, cleanup, fireEvent } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { createFormReset } from "../src/form/createFormReset";

afterEach(() => {
  cleanup();
});

describe("createFormReset", () => {
  it("should reset value when form is reset", () => {
    const onReset = vi.fn();
    const defaultValue = "default-value";

    render(() => {
      let inputRef: HTMLInputElement | undefined;

      createFormReset(() => inputRef, defaultValue, onReset);

      return (
        <form data-testid="form">
          <input ref={(el) => (inputRef = el)} type="text" defaultValue="current-value" />
          <button type="reset">Reset</button>
        </form>
      );
    });

    // Dispatch reset event on the form
    const form = document.querySelector('[data-testid="form"]') as HTMLFormElement;
    fireEvent.reset(form);

    expect(onReset).toHaveBeenCalledTimes(1);
    expect(onReset).toHaveBeenCalledWith(defaultValue);
  });

  it("should handle objects as default values", () => {
    const onReset = vi.fn();
    const defaultValue = { id: "default", name: "Default Item" };

    render(() => {
      let inputRef: HTMLInputElement | undefined;

      createFormReset(() => inputRef, defaultValue, onReset);

      return (
        <form data-testid="form">
          <input ref={(el) => (inputRef = el)} type="hidden" />
        </form>
      );
    });

    const form = document.querySelector('[data-testid="form"]') as HTMLFormElement;
    fireEvent.reset(form);

    expect(onReset).toHaveBeenCalledWith(defaultValue);
  });

  it("should not reset when element has no form", () => {
    const onReset = vi.fn();

    render(() => {
      let inputRef: HTMLInputElement | undefined;

      createFormReset(() => inputRef, "default", onReset);

      // Input not wrapped in a form
      return <input ref={(el) => (inputRef = el)} type="text" />;
    });

    // No form to reset
    expect(onReset).not.toHaveBeenCalled();
  });

  it("should clean up event listener on unmount", () => {
    const onReset = vi.fn();
    let formRef: HTMLFormElement | undefined;

    const { unmount } = render(() => {
      let inputRef: HTMLInputElement | undefined;

      createFormReset(() => inputRef, "default", onReset);

      return (
        <form ref={(el) => (formRef = el)}>
          <input ref={(el) => (inputRef = el)} type="text" />
        </form>
      );
    });

    // Unmount the component
    unmount();

    // Reset should not trigger the callback after unmount
    fireEvent.reset(formRef!);
    expect(onReset).not.toHaveBeenCalled();
  });

  it("should work with select elements", () => {
    const onReset = vi.fn();

    render(() => {
      let selectRef: HTMLSelectElement | undefined;

      createFormReset(() => selectRef, "option1", onReset);

      return (
        <form data-testid="form">
          <select ref={(el) => (selectRef = el)}>
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
          </select>
        </form>
      );
    });

    const form = document.querySelector('[data-testid="form"]') as HTMLFormElement;
    fireEvent.reset(form);

    expect(onReset).toHaveBeenCalledWith("option1");
  });

  it("should work with textarea elements", () => {
    const onReset = vi.fn();

    render(() => {
      let textareaRef: HTMLTextAreaElement | undefined;

      createFormReset(() => textareaRef, "default text", onReset);

      return (
        <form data-testid="form">
          <textarea ref={(el) => (textareaRef = el)} />
        </form>
      );
    });

    const form = document.querySelector('[data-testid="form"]') as HTMLFormElement;
    fireEvent.reset(form);

    expect(onReset).toHaveBeenCalledWith("default text");
  });

  it("should handle multiple resets", () => {
    const onReset = vi.fn();

    render(() => {
      let inputRef: HTMLInputElement | undefined;

      createFormReset(() => inputRef, "default", onReset);

      return (
        <form data-testid="form">
          <input ref={(el) => (inputRef = el)} type="text" />
        </form>
      );
    });

    const form = document.querySelector('[data-testid="form"]') as HTMLFormElement;

    fireEvent.reset(form);
    fireEvent.reset(form);
    fireEvent.reset(form);

    expect(onReset).toHaveBeenCalledTimes(3);
  });

  it("should handle null/undefined default values", () => {
    const onReset = vi.fn();

    render(() => {
      let inputRef: HTMLInputElement | undefined;

      createFormReset(() => inputRef, null, onReset);

      return (
        <form data-testid="form">
          <input ref={(el) => (inputRef = el)} type="text" />
        </form>
      );
    });

    const form = document.querySelector('[data-testid="form"]') as HTMLFormElement;
    fireEvent.reset(form);

    expect(onReset).toHaveBeenCalledWith(null);
  });
});
