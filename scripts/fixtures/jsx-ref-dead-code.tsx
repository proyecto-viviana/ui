import { createEffect } from "solid-js";

export interface OptimizerRefFixtureProps {
  onClose: () => void;
}

export function OptimizerRefFixture(props: OptimizerRefFixtureProps) {
  let element: HTMLButtonElement | undefined;
  const setElement = (node: HTMLButtonElement) => {
    element = node;
  };

  createEffect(() => {
    if (!element) return;

    element.setAttribute("data-ref-read", "true");
    const onClick = () => element?.setAttribute("data-ref-callback", "true");
    element.addEventListener("click", onClick);
    element.focus();
    props.onClose();
    element.setAttribute("data-ref-close", "true");

    return () => element?.removeEventListener("click", onClick);
  });

  return <button ref={setElement}>Optimizer ref fixture</button>;
}
