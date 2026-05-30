// Adds an on-hover anchor link to article headings, mirroring the upstream S2
// docs typography (react-spectrum/packages/dev/s2-docs/src/typography.tsx,
// `AnchorLink`). Implemented as a DOM enhancement rather than in the page markup
// so the per-component `.astro` source keeps the literal `<h2 id="…">` tags the
// parity gate parses, and so every docs page gets anchors uniformly.

// S2 Link glyph (packages/solid-spectrum/.../assets/s2wf-icons/S2_Icon_Link_20_N.svg),
// recolored to currentColor so it inherits the anchor color.
const LINK_ICON_SVG =
  '<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" focusable="false">' +
  '<path fill="currentColor" d="m5.31348,18.74805c-1.04102,0-2.08105-.39648-2.87305-1.18848-1.58398-1.58398-1.58398-4.16211,0-5.74707l3.90527-3.90527c1.58496-1.58398,4.16211-1.58301,5.74707,0,.2168.21777.40723.45703.56641.70996.2207.35059.11523.81348-.23535,1.03418-.35254.22168-.81348.11426-1.03418-.23535-.10059-.16016-.22168-.31152-.35938-.44922-.99902-.99902-2.625-.99805-3.62402.00098l-3.90527,3.90527c-.99902,1-.99902,2.62695,0,3.62598,1.00098,1.00098,2.62695.99707,3.62598,0l1.95215-1.95215c.29297-.29297.76758-.29297,1.06055,0s.29297.76758,0,1.06055l-1.95215,1.95215c-.79199.79199-1.83301,1.1875-2.87402,1.18848Zm8.34082-6.65527l3.90527-3.90527c1.58398-1.58496,1.58398-4.16309,0-5.74707s-4.16309-1.58398-5.74707,0l-1.95215,1.95215c-.29297.29297-.29297.76758,0,1.06055s.76758.29297,1.06055,0l1.95215-1.95215c.99902-.99805,2.625-1,3.62598,0,.99902.99902.99902,2.62598,0,3.62598l-3.90527,3.90527c-.99902.99902-2.625,1-3.62402.00098-.1377-.1377-.25879-.28906-.35938-.44922-.2207-.34961-.68164-.45703-1.03418-.23535-.35059.2207-.45605.68359-.23535,1.03418.15918.25293.34961.49219.56641.70996.79297.79199,1.83301,1.18848,2.87402,1.18848,1.04004,0,2.08105-.39648,2.87305-1.18848Z"/>' +
  "</svg>";

function enhanceHeadingAnchors(): void {
  const article = document.querySelector(".s2-article");
  if (!article) {
    return;
  }
  const headings = article.querySelectorAll<HTMLElement>("h2[id], h3[id], h4[id]");
  for (const heading of headings) {
    if (!heading.id || heading.querySelector(".s2-heading-anchor")) {
      continue;
    }
    const headingText = heading.textContent?.trim() ?? heading.id;
    const anchor = document.createElement("a");
    anchor.className = "s2-heading-anchor";
    anchor.href = `#${heading.id}`;
    anchor.setAttribute("aria-label", `Link to ${headingText}`);
    anchor.innerHTML = LINK_ICON_SVG;
    heading.appendChild(anchor);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", enhanceHeadingAnchors, { once: true });
} else {
  enhanceHeadingAnchors();
}
