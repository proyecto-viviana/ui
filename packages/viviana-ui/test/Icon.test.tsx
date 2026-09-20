/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vite-plus/test";
import { render, screen } from "@solidjs/testing-library";
import { createSignal, flush, type Component } from "solid-js";
import { Icon } from "../src/icon";

type ProbeIcon = Component<{ size?: string | number; color?: string }>;

function ProbeA(_props: { size?: string | number; color?: string }) {
  return <span data-testid="icon-a">A</span>;
}

function ProbeB(_props: { size?: string | number; color?: string }) {
  return <span data-testid="icon-b">B</span>;
}

describe("Icon (@proyecto-viviana/ui)", () => {
  it("renders an updated icon after mount", () => {
    let setIcon!: (next: ProbeIcon) => void;

    const { container } = render(() => {
      const [icon, updateIcon] = createSignal<{ current: ProbeIcon }>({ current: ProbeA });
      setIcon = (next) => updateIcon({ current: next });
      return <Icon icon={icon().current} />;
    });

    expect(screen.getByTestId("icon-a")).toBeInTheDocument();
    expect(container.querySelector('[data-testid="icon-b"]')).not.toBeInTheDocument();

    setIcon(ProbeB);
    flush();

    expect(screen.queryByTestId("icon-a")).not.toBeInTheDocument();
    expect(screen.getByTestId("icon-b")).toBeInTheDocument();
  });

  it("updates the shadow copy when icon changes after mount", () => {
    let setIcon!: (next: ProbeIcon) => void;

    const { container } = render(() => {
      const [icon, updateIcon] = createSignal<{ current: ProbeIcon }>({ current: ProbeA });
      setIcon = (next) => updateIcon({ current: next });
      return <Icon icon={icon().current} withShadow />;
    });

    expect(container.querySelectorAll('[data-testid="icon-a"]')).toHaveLength(2);

    setIcon(ProbeB);
    flush();

    expect(container.querySelector('[data-testid="icon-a"]')).not.toBeInTheDocument();
    expect(container.querySelectorAll('[data-testid="icon-b"]')).toHaveLength(2);
    expect(container.querySelector(".vui-icon__shadow [data-testid='icon-b']")).toBeInTheDocument();
    expect(container.querySelector(".vui-icon__main [data-testid='icon-b']")).toBeInTheDocument();
  });
});
