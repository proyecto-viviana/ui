import { css } from "../s2-style/style-macro";

export const searchFieldPillPadding = css(`
  padding-inline-start: calc(var(--F, var(--M)) / 2);
  padding-inline-end: 0px;
`);

export const hideWebkitSearchCancelButton = css(
  "&::-webkit-search-cancel-button { display: none }",
);
