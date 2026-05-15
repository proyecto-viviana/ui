# Source Index

Use this index when a playbook task needs outside authority. Keep the scope to
the target component and direct subpatterns; do not turn one component pass into
a general standards review.

## Authority Order

When sources disagree, use this order:

1. Installed upstream source for the exact version in this repo.
2. React Aria and S2 docs, testing docs, blog posts, release notes, and examples.
3. W3C and WHATWG technical specifications.
4. APG patterns and examples.
5. ARIA-AT, WCAG, evaluation guidance, and testing-tool docs.
6. Chrome, web.dev, MDN, browser-vendor docs, and platform explainers.
7. Independent or famous blog posts and articles.

Record the disagreement and chosen authority in the research notes or runtime
evidence. APG, ARIA-AT, WCAG, platform explainers, and blog posts can identify
risks, test obligations, and browser behavior to verify. They do not override
installed upstream behavior or formal specifications unless we explicitly
choose and document a deviation.

Documentation validation is required, but documentation authority is layered:

- official Adobe docs define the public examples, viewer controls, caveats, and
  testing expectations users see;
- installed upstream source defines the exact behavior we are porting when docs
  and source disagree;
- formal specs define the platform and accessibility floor;
- APG, ARIA-AT, WCAG, Chrome/web.dev, MDN, and respected articles help discover
  risk, but each discovered obligation must map back to source, specs, current
  React behavior, or a reproducible browser assertion before it blocks parity.

## Installed Source

These are the first source of truth for parity:

| Need                          | Source path                                              |
| ----------------------------- | -------------------------------------------------------- |
| Styled S2 implementation      | `apps/comparison/node_modules/@react-spectrum/s2/src`    |
| Headless RAC implementation   | `apps/comparison/node_modules/react-aria-components/src` |
| React Aria hook behavior      | `apps/comparison/node_modules/@react-aria`               |
| React Stately behavior        | `apps/comparison/node_modules/@react-stately`            |
| Solid state port              | `packages/solid-stately/src`                             |
| Solid ARIA hook port          | `packages/solidaria/src`                                 |
| Solid headless component port | `packages/solidaria-components/src`                      |
| Solid styled S2 port          | `packages/solid-spectrum/src`                            |

## Adobe Docs

Use these for intended public API, examples, interaction notes, release context,
and testing guidance:

| Need                         | Source                                                                 |
| ---------------------------- | ---------------------------------------------------------------------- |
| React Aria component docs    | <https://react-spectrum.adobe.com/react-aria/>                         |
| React Aria blog/release docs | `list_react_aria_pages`, then matching blog or release pages           |
| React Aria testing guidance  | `list_react_aria_pages`, then matching `Testing <Component>` page      |
| React Aria interaction hooks | `usePress`, `useHover`, `useFocusVisible`, `useKeyboard`, `useMove`    |
| React Aria utilities         | `mergeProps`, `useId`, `SSRProvider`, `PortalProvider`, `I18nProvider` |
| Spectrum S2 component docs   | <https://react-spectrum.adobe.com/s2/>                                 |
| Spectrum S2 testing/docs     | S2 guides and examples returned by `list_s2_pages`                     |
| S2 style/token authority     | S2 style macro docs and `get_style_macro_property_values`              |

## Standards

Use standards for exact browser, ARIA, accessible-name, event, and CSS behavior
when upstream source depends on platform semantics.

| Need                                  | Source                                         |
| ------------------------------------- | ---------------------------------------------- |
| Roles, states, properties             | <https://www.w3.org/TR/wai-aria-1.2/>          |
| ARIA allowed on HTML elements         | <https://www.w3.org/TR/html-aria/>             |
| Accessible name and description       | <https://www.w3.org/TR/accname-1.2/>           |
| Accessibility API mappings            | <https://www.w3.org/TR/core-aam-1.2/>          |
| HTML accessibility mappings           | <https://www.w3.org/TR/html-aam-1.0/>          |
| Native HTML behavior                  | <https://html.spec.whatwg.org/multipage/>      |
| DOM events, propagation, cancellation | <https://dom.spec.whatwg.org/>                 |
| Keyboard and UI event ordering        | <https://w3c.github.io/uievents/>              |
| Pointer behavior                      | <https://www.w3.org/TR/pointerevents3/>        |
| Hover, pointer, reduced motion        | <https://drafts.csswg.org/mediaqueries-5/>     |
| Forced colors and color adjustment    | <https://drafts.csswg.org/css-color-adjust-1/> |
| Geometry and measurement APIs         | <https://drafts.csswg.org/cssom-view/>         |
| Text selection behavior               | <https://w3c.github.io/selection-api/>         |

## Pattern And Interop Guidance

Use these to identify component-specific accessibility risks and assistive
technology expectations:

| Need                          | Source                                           |
| ----------------------------- | ------------------------------------------------ |
| APG patterns                  | <https://www.w3.org/WAI/ARIA/apg/patterns/>      |
| APG examples by role/property | <https://www.w3.org/WAI/ARIA/apg/example-index/> |
| Assistive technology support  | <https://w3c.github.io/aria-at/>                 |
| WCAG success criteria context | <https://www.w3.org/TR/WCAG22/>                  |
| WAI evaluation guidance       | <https://www.w3.org/WAI/test-evaluate/>          |

## Platform Guidance And Risk Discovery

Use these sources to understand browser behavior, explain test failures, and
find risks. They are not parity authority by themselves.

| Need                                      | Source                                                                |
| ----------------------------------------- | --------------------------------------------------------------------- |
| Practical accessibility behavior          | <https://web.dev/learn/accessibility/>                                |
| ARIA and HTML authoring cautions          | <https://web.dev/learn/accessibility/aria-html>                       |
| Chrome platform accessibility/devtools    | <https://developer.chrome.com/docs/devtools/accessibility/reference/> |
| Browser API and CSS reference             | <https://developer.mozilla.org/>                                      |
| Independent articles and famous blogposts | Record title, URL, claim, and the normative/source-backed follow-up.  |

## Testing References

Use testing references to choose validation technique. They do not define the
component contract by themselves.

| Need                             | Source                                                            |
| -------------------------------- | ----------------------------------------------------------------- |
| User-like unit interactions      | <https://testing-library.com/docs/user-event/intro/>              |
| Browser accessibility scans      | <https://playwright.dev/docs/accessibility-testing>               |
| Automated a11y scan API          | <https://www.deque.com/axe/core-documentation/api-documentation/> |
| Platform behavior regression set | <https://github.com/web-platform-tests/wpt>                       |

## Use Rules

- Source expansion is allowed only when it answers a current task question.
- Prefer exact component pages over general guides.
- Prefer installed source over remembered behavior.
- Record `none found` when no related blog, release note, testing page, APG
  example, or ARIA-AT report exists.
- Use independent blog posts as prompts for source/spec/browser checks, not as
  standalone acceptance criteria.
- Use Chrome/web.dev/MDN to choose assertions and understand browser behavior;
  resolve conflicts against installed source, specs, or current React behavior.
- Do not block a component on manual assistive-technology testing unless the
  pass explicitly calls for it; record it as a risk or follow-up.
