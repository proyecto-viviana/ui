import { css } from "../style/style-macro" with { type: "macro" };

export const hideWebkitSearchCancelButton = css(
  "&::-webkit-search-cancel-button { display: none }",
);
