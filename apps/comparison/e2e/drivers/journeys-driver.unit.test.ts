import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { overlayMotionPhase } from "./journeys-observe";
import { serializeStep, type SerializedStep, type Step } from "./journeys-steps";
import { generateJourneySteps, overlayJourneyAlphabet } from "./journeys-fuzz";
import { registerJourneyDriver, type Journey } from "./journeys";
import type { DriverScenario, TargetResolver } from "./scenario";

/**
 * Dummy resolver — serializeStep never calls it. Round-trip tests would miss a
 * dropped field if reconstruct(serialize(step)) serialized differently.
 */
const dummy: TargetResolver = () => {
  throw new Error("serializeStep must not invoke the target resolver");
};

function reconstruct(serialized: SerializedStep): Step {
  const base = { label: serialized.label, targetId: serialized.targetId };
  switch (serialized.type) {
    case "focus":
      return { ...base, type: "focus", target: dummy };
    case "keyDown":
      return { ...base, type: "keyDown", key: serialized.key ?? "", repeat: serialized.repeat };
    case "keyUp":
      return { ...base, type: "keyUp", key: serialized.key ?? "" };
    case "touchDown":
      return { ...base, type: "touchDown", target: dummy };
    case "touchUp":
      return { ...base, type: "touchUp", target: dummy };
    case "tapAt":
      return {
        ...base,
        type: "tapAt",
        target: dummy,
        xFraction: serialized.xFraction ?? 0,
        yFraction: serialized.yFraction ?? 0,
      };
    case "dispatch":
      return { ...base, type: "dispatch", target: dummy, eventType: serialized.eventType ?? "" };
    case "control":
      return { ...base, type: "control", name: serialized.name ?? "", value: serialized.value };
    case "submit":
      return { ...base, type: "submit" };
    case "reset":
      return { ...base, type: "reset" };
    case "selectOption":
      return { ...base, type: "selectOption", name: serialized.name ?? "" };
    default:
      throw new Error(`reconstruct does not cover ${serialized.type}`);
  }
}

const newSteps: Step[] = [
  { type: "focus", target: dummy, label: "focus input", targetId: "input" },
  { type: "keyDown", key: "ArrowDown", label: "keyDown ArrowDown" },
  { type: "keyDown", key: "ArrowDown", repeat: 4, label: "keyDown ArrowDown repeat 4" },
  { type: "keyUp", key: "ArrowDown", label: "keyUp ArrowDown" },
  { type: "touchDown", target: dummy, label: "touchDown trigger", targetId: "trigger" },
  { type: "touchUp", target: dummy, label: "touchUp trigger", targetId: "trigger" },
  {
    type: "tapAt",
    target: dummy,
    xFraction: 0.5,
    yFraction: 0,
    label: "tapAt input centre-top",
    targetId: "input",
  },
  {
    type: "dispatch",
    target: dummy,
    eventType: "scroll",
    label: "dispatch scroll",
    targetId: "scroller",
  },
  { type: "control", name: "isReadOnly", value: true, label: "control isReadOnly" },
  { type: "submit", label: "submit" },
  { type: "reset", label: "reset" },
  { type: "selectOption", name: "Pro", label: "selectOption Pro" },
];

describe("D13 journey driver extensions", () => {
  it("drops a new step's payload from serializeStep so fuzz minimization cannot reconstruct it", () => {
    for (const step of newSteps) {
      const once = serializeStep(step);
      assert.equal(once.type, step.type, step.label);
      assert.deepEqual(serializeStep(reconstruct(once)), once, step.label);
    }
  });

  it("treats data-entering + opacity 0 as settled, so a motion journey would miss the enter phase", () => {
    assert.equal(
      overlayMotionPhase({ dataEntering: true, dataExiting: false, opacity: "0" }),
      "entering",
    );
    assert.equal(
      overlayMotionPhase({ dataEntering: false, dataExiting: false, opacity: "1" }),
      "settled",
    );
    assert.equal(
      overlayMotionPhase({ dataEntering: false, dataExiting: true, opacity: "0.4" }),
      "exiting",
    );
  });

  it("emits control/submit/reset while withFixtureProtocol is false, so generated journeys fail on the missing fixture protocol", () => {
    const alphabet = overlayJourneyAlphabet(
      { trigger: dummy, input: dummy, optionNames: ["Starter", "Pro"] },
      { withFixtureProtocol: false },
    );
    const forbidden = new Set(["control", "submit", "reset"]);
    for (const seed of [1, 7, 99, 12345]) {
      const first = generateJourneySteps(alphabet, seed, 12);
      const second = generateJourneySteps(alphabet, seed, 12);
      assert.deepEqual(second.serialized, first.serialized, `seed ${seed} must be deterministic`);
      for (const step of first.serialized) {
        assert.equal(forbidden.has(step.type), false, `seed ${seed} emitted ${step.type}`);
      }
    }
  });

  it("registers a unit-only journey as a Playwright test, hiding a ledger-only branch", () => {
    const journey: Journey = {
      id: "CB-unit-only-sample",
      label: "ledger only",
      class: "unit-only",
      steps: [],
    };
    assert.throws(
      () => registerJourneyDriver({} as DriverScenario, [journey]),
      /unit-only journeys cannot be registered as Playwright tests \(ledger only\): CB-unit-only-sample/,
    );
  });
});
