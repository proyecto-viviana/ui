import { createSignal, createUniqueId, onCleanup } from "solid-js";
import { Button } from "../../src/Button";
import { Tooltip, TooltipTrigger, type TooltipResolvedPlacement } from "../../src/Tooltip";

export const tooltipCases = [
  "controlled-generated",
  "controlled-explicit",
  "default-generated",
  "default-explicit",
  "standalone",
] as const;

interface TooltipProbe {
  kind: (typeof tooltipCases)[number];
  controls?: (setOpen: (open: boolean) => void) => void;
  changed?: (open: boolean) => void;
  created?: (instance: symbol) => void;
  disposed?: (instance: symbol) => void;
  id?: (id: string) => void;
  ref?: (element: HTMLInputElement) => void;
}

function TooltipBody(props: TooltipProbe & { placement: TooltipResolvedPlacement | null }) {
  const instance = Symbol("tooltip body");
  props.created?.(instance);
  onCleanup(() => props.disposed?.(instance));
  return <span data-tooltip-body={props.placement}>Helpful description</span>;
}

function FollowingField(props: TooltipProbe) {
  const id = createUniqueId();
  props.id?.(id);
  return (
    <>
      <label for={id} data-tooltip-label>
        Following field
      </label>
      <input id={id} ref={props.ref} data-tooltip-input />
    </>
  );
}

export function TooltipFixture(props: TooltipProbe) {
  const [open, setOpen] = createSignal(true);
  props.controls?.(setOpen);
  const controlled = props.kind.startsWith("controlled");
  const explicitId = props.kind.endsWith("explicit") ? "explicit-tooltip" : undefined;
  return (
    <section data-tooltip-route={props.kind}>
      {props.kind === "standalone" ? (
        <Tooltip id="standalone-tooltip" isOpen={open()}>
          {(values) => <TooltipBody {...props} placement={values.placement} />}
        </Tooltip>
      ) : (
        <TooltipTrigger
          isOpen={controlled ? open() : undefined}
          defaultOpen={!controlled}
          delay={0}
          closeDelay={0}
          onOpenChange={(value) => {
            props.changed?.(value);
            if (controlled) setOpen(value);
          }}
        >
          <Button data-tooltip-trigger>Helpful action</Button>
          <Tooltip id={explicitId}>
            {(values) => <TooltipBody {...props} placement={values.placement} />}
          </Tooltip>
        </TooltipTrigger>
      )}
      <FollowingField {...props} />
    </section>
  );
}
