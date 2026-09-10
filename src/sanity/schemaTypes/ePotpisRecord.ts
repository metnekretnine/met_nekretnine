import { EPotpisContractDetails, contractStatusLabels, readContract } from "../components/EPotpisContractDetails";
import { defineField, defineType } from "sanity";

/** Created only by the server with a private, dotted ID. Never through a Studio draft. */
export const ePotpisRecord = defineType({
  name: "ePotpisRecord", title: "ePotpis — privatni zapis", type: "document", liveEdit: true, readOnly: true,
  components: { input: EPotpisContractDetails },
  fields: [
    defineField({ name: "kind", title: "Vrsta zapisa", type: "string", validation: rule => rule.required() }),
    defineField({ name: "label", title: "Naziv", type: "string", validation: rule => rule.required() }),
    defineField({ name: "payload", title: "Zaštićeni sadržaj", type: "text", hidden: true, validation: rule => rule.required() }),
  ],
  preview: {
    select: { title: "label", kind: "kind", payload: "payload" },
    prepare({ title, kind, payload }) {
      if (kind === "contract") {
        try {
          const { row, snapshot } = readContract(payload);
          return { title, subtitle: `${contractStatusLabels[row.status] || row.status} · ${snapshot.input.propertyAddress}` };
        } catch { return { title, subtitle: "Podaci ugovora nisu dostupni" }; }
      }
      return { title, subtitle: kind };
    },
  },
});
