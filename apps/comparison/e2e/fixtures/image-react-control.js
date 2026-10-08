import { createElement as h, useState } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { Image, ImageContext, ImageCoordinator } from "@react-spectrum/s2";

export function mountReactImage(container, initial) {
  const root = createRoot(container);
  let update;
  function Control() {
    const [state, setState] = useState(initial);
    update = setState;
    return h(
      ImageCoordinator,
      { timeout: 120000 },
      state.rows.map((id) =>
        h(
          "section",
          { key: id, "data-row": id },
          h(
            ImageContext.Provider,
            { value: { hidden: id === state.target && state.hidden } },
            h(Image, {
              src: `${state.prefix}/${id}-${id === state.target ? state.source : "A"}.png`,
              alt: id,
              width: 80,
              height: 60,
            }),
          ),
        ),
      ),
    );
  }
  flushSync(() => root.render(h(Control)));
  return {
    update: (state) => flushSync(() => update(state)),
    dispose: () => flushSync(() => root.unmount()),
  };
}
