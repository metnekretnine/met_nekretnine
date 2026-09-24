import { definePlugin } from "sanity";
import { priceListSectionActions } from "./priceListSectionActions";
import { withPriceListSnapshotDeleteGuard } from "./priceListSnapshotDeleteAction";

// Singletons and generated versions must not be created from the "+" menu.
const priceListTypes = ["priceListSection", "priceListSettings", "priceListSnapshot"];

export const priceListPlugin = definePlugin({
  name: "price-list",
  document: {
    actions: (previousActions, { schemaType }) => {
      if (schemaType === "priceListSnapshot") {
        return previousActions
          .filter((action) => action.action === "delete")
          .map(withPriceListSnapshotDeleteGuard);
      }

      if (schemaType === "priceListSection") {
        return priceListSectionActions(previousActions);
      }

      return previousActions;
    },
    newDocumentOptions: (previousOptions) =>
      previousOptions.filter(
        (option) => !priceListTypes.includes(option.templateId),
      ),
  },
});
