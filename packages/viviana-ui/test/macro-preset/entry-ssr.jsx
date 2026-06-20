import { renderToString } from "solid-js/web";
import { Styled } from "./styled.jsx";

export function renderApp() {
  return renderToString(() => <Styled />);
}
