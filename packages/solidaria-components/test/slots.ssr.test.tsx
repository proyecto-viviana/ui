import { describe, expect, it } from "vite-plus/test";
import { renderToString } from "@solidjs/web";
import { Button } from "../src/Button";
import { Icon } from "../src/Icon";
import { SlotProvider } from "../src/slots";
import { Text } from "../src/Text";

describe("SlotContext SSR", () => {
  it("stamps slot class and data-rsp-slot during server render", () => {
    const html = renderToString(() => (
      <SlotProvider
        slots={{
          label: { class: "slot-label", "data-rsp-slot": "label" },
          icon: { class: "slot-icon", "data-rsp-slot": "icon" },
          action: { class: "slot-action", "data-rsp-slot": "action" },
        }}
      >
        <Text slot="label">Name</Text>
        <Icon slot="icon">*</Icon>
        <Button slot="action">Go</Button>
      </SlotProvider>
    ));

    expect(html).toContain("slot-label");
    expect(html).toContain('data-rsp-slot="label"');
    expect(html).toContain("slot-icon");
    expect(html).toContain('data-rsp-slot="icon"');
    expect(html).toContain("slot-action");
    expect(html).toContain('data-rsp-slot="action"');
  });
});
