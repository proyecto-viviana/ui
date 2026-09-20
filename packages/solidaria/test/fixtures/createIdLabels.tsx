/**
 * Fixture for the `createId` hydration regression (#555 item 9).
 *
 * `createLabel` hands back `labelProps` / `fieldProps` as lazy getters, so the
 * ids they carry are resolved while the JSX spread runs — during the hydration
 * walk, not in the hook body. Two fields in a row make the ordering observable:
 * if the client consumes a different number of hydration context ids than the
 * server did, the second field's input no longer matches its server node.
 */
import { createLabel } from "../../src/label/createLabel";

function Field(props: { label: string }) {
  const labelAria = createLabel(() => ({ label: props.label }));
  return (
    <p>
      <label {...labelAria.labelProps}>{props.label}</label>
      <input type="text" {...labelAria.fieldProps} />
    </p>
  );
}

export function CreateIdLabelsFixture() {
  return (
    <div data-create-id-fixture>
      <Field label="Correo" />
      <Field label="Contraseña" />
    </div>
  );
}
