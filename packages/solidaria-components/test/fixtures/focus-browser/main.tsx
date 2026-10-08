import { render } from "@solidjs/web";
import { DropZone } from "../../../src/DropZone";
import { FileTrigger } from "../../../src/FileTrigger";

function Page() {
  return (
    <div
      id="scroller"
      style={{
        height: "180px",
        overflow: "auto",
        position: "relative",
        border: "1px solid black",
      }}
    >
      <div style={{ height: "600px" }} />
      <div id="pair">
        <DropZone>
          <FileTrigger>
            <button id="upload" type="button">
              Upload
            </button>
          </FileTrigger>
          <p id="hint">Drop files</p>
        </DropZone>
      </div>
    </div>
  );
}

const root = document.getElementById("root");
if (root) {
  render(() => <Page />, root);
}
