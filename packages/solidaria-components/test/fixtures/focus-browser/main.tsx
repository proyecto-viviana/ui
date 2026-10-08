import { render } from "@solidjs/web";
import { createFocusWithin } from "../../../../solidaria/src/interactions/createFocusWithin";
import { DropZone } from "../../../src/DropZone";
import { FileTrigger } from "../../../src/FileTrigger";

function Page() {
  return (
    <>
      <div
        id="scroller"
        style={{
          height: "180px",
          overflow: "auto",
          position: "relative",
          border: "1px solid black",
        }}
      >
        <div style={{ height: "600px" }} />
        <div id="pair">
          <DropZone>
            <FileTrigger>
              <button id="upload" type="button">
                Upload
              </button>
            </FileTrigger>
            <p id="hint">Drop files</p>
          </DropZone>
        </div>
      </div>
      <div id="focus-mount" />
      <button id="outside" type="button">
        Outside
      </button>
      <button id="outside-next" type="button">
        Next outside
      </button>
    </>
  );
}

type FocusRecord =
  | {
      type: string;
      target: string | null;
      currentTarget: string | null;
      relatedTarget: string | null;
      path: string[];
    }
  | { type: "change"; value: boolean };

const focusEvents: FocusRecord[] = [];
function recordFocus(event: FocusEvent) {
  // Read during native dispatch: currentTarget and composedPath expire afterward.
  focusEvents.push({
    type: event.type,
    target: event.target instanceof Element ? event.target.id : null,
    currentTarget: event.currentTarget instanceof Element ? event.currentTarget.id : null,
    relatedTarget: event.relatedTarget instanceof Element ? event.relatedTarget.id : null,
    path: event
      .composedPath()
      .filter((node): node is Element => node instanceof Element)
      .map((node) => node.id),
  });
}

function FocusOwner(props: { disabled?: boolean; id: string }) {
  const { focusWithinProps } = createFocusWithin({
    isDisabled: props.disabled,
    onFocusWithin: recordFocus,
    onBlurWithin: recordFocus,
    onFocusWithinChange: (value) => focusEvents.push({ type: "change", value }),
  });
  return (
    <div id={props.id} tabindex={-1} {...focusWithinProps}>
      <button id={`${props.id}-a`} type="button">
        A
      </button>
      <button id={`${props.id}-b`} type="button">
        B
      </button>
    </div>
  );
}

const root = document.getElementById("root");
if (root) {
  render(() => <Page />, root);
}

const focusMount = document.getElementById("focus-mount");
if (!focusMount) throw new Error("missing focus mount");
const disposeFocus = render(
  () => (
    <>
      <FocusOwner id="owner" />
      <FocusOwner id="disabled-owner" disabled />
    </>
  ),
  focusMount,
);
(
  window as unknown as { __focusFixture: { events: FocusRecord[]; dispose: () => void } }
).__focusFixture = {
  events: focusEvents,
  dispose: disposeFocus,
};
