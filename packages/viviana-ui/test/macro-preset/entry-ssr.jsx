import { renderToString } from "solid-js/web";
import rawStyledSource from "./styled.jsx?raw";
import { Styled } from "./styled.jsx?tsr-split=component";

export function renderApp() {
  if (!rawStyledSource.includes("export function Styled")) {
    throw new Error("Vite ?raw import was processed as a macro source module");
  }
  return renderToString(() => <Styled />);
}
