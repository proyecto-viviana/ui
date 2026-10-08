import { describe, expect, it, vi } from "vite-plus/test";
import { callEventHandler } from "../src/utils/callEventHandler";

describe("callEventHandler", () => {
  it("calls a canonical bound tuple once with data then the same event", () => {
    const data = { id: "bound" };
    const event = new Event("keydown");
    const handler = vi.fn();
    callEventHandler({ 0: handler, 1: data }, event);
    callEventHandler([handler, data], event);
    expect(handler).toHaveBeenCalledTimes(2);
    expect(handler.mock.calls[0]).toEqual([data, event]);
    expect(handler.mock.calls[1]).toEqual([data, event]);
    expect(handler.mock.instances[0]).not.toBe(data);
  });

  it("passes undefined data through and calls a function with the event once", () => {
    const event = new Event("click");
    const bound = vi.fn();
    const plain = vi.fn();
    callEventHandler([bound, undefined], event);
    callEventHandler(plain, event);
    expect(bound.mock.calls).toEqual([[undefined, event]]);
    expect(plain.mock.calls).toEqual([[event]]);
  });

  it("ignores absent and non-callable handlers", () => {
    const event = new Event("focus");
    expect(() => {
      callEventHandler(undefined, event);
      callEventHandler(null, event);
      callEventHandler(1, event);
      callEventHandler("nope", event);
      callEventHandler({ 0: "nope", 1: event }, event);
      callEventHandler([], event);
      callEventHandler([undefined, "data"], event);
    }).not.toThrow();
  });
});
