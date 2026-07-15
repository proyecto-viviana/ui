import { render } from "solid-js/web";
import rawStyledSource from "./styled.jsx?raw";
import { Styled } from "./styled.jsx?tsr-split=component";

if (!rawStyledSource.includes("export function Styled")) {
  throw new Error("Vite ?raw import was processed as a macro source module");
}

render(() => <Styled />, document.getElementById("root"));
