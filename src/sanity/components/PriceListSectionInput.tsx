import type { CSSProperties } from "react";
import { ObjectInputProps, useEditState } from "sanity";

// Explains the "Novi cjenik" workflow in plain words instead of Sanity's
// Published/Draft terminology, which confuses occasional editors.

// Sanity's Published/Draft chips; hidden only while this form is open.
// If Sanity renames the test id, the chips simply show again.
const hidePerspectiveChips = `[data-testid="document-perspective-list"] { display: none !important; }`;

const boxStyle: CSSProperties = {
  marginBottom: "1.5rem",
  padding: "0.9rem 1.1rem",
  border: "1px solid currentColor",
  borderRadius: 6,
  fontSize: 14,
  lineHeight: 1.55,
};

export function PriceListSectionInput(props: ObjectInputProps) {
  const { draft, published, ready } = useEditState(
    "priceListSection",
    "priceListSection",
  );
  const isEditing = Boolean(draft) || !published;

  return (
    <>
      <style>{hidePerspectiveChips}</style>
      {ready && (
        <div role="status" style={boxStyle}>
          {isEditing ? (
            <>
              <strong>Uređujete novi cjenik.</strong> Na webu se prikazuje tek
              kad kliknete „<strong>Objavi novi cjenik</strong>” (dolje desno).
              Ako odustanete, kliknite tri točkice (⋯) desno od tog gumba i
              odaberite „<strong>Odbaci novi cjenik</strong>”. Aktualni cjenik
              tada ostaje nepromijenjen.
            </>
          ) : (
            <>
              <strong>Prikazan je aktualni cjenik i ne može se mijenjati.</strong>{" "}
              Za promjenu cijena kliknite „<strong>Kreiraj novi cjenik</strong>”
              (dolje desno): nastaje kopija koju možete urediti i objaviti.
              Aktualni i prethodni cjenici nalaze se u{" "}
              „<strong>Povijest cjenika</strong>”.
            </>
          )}
        </div>
      )}
      {props.renderDefault(props)}
    </>
  );
}
