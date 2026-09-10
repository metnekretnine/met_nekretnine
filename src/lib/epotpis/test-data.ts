import type { ContractInput } from "./types";

// Supplies form examples in every environment; never sends or stores anything.
export function testContractInput(joint: boolean): ContractInput {
  const date = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Zagreb" }).format(new Date());
  return {
    contractNumber: `TEST-${joint ? "002" : "001"}/${date.slice(0, 4)}`,
    kind: "open", consumer: true,
    ownerName: "Marko Horvat", oib: "12345678903", ownerAddress: "Testna ulica 12, Zagreb",
    phone: "+385 99 000 0001", email: "filipivanovic7@gmail.com", signerName: "Marko Horvat",
    ...(joint ? { coOwner: {
      ownerName: "Ana Horvat", oib: "98765432106", ownerAddress: "Primjer ulica 8, Zagreb",
      phone: "+385 99 000 0002", signerName: "Ana Horvat",
    } } : {}),
    propertyAddress: "Testna ulica 20, Zagreb", descriptionField: "Dvosobni stan, 64 m², balkon i spremište.",
    landRegistry: "k.o. Zagreb, zk. ul. 1234, k.č. 567/8", rent: 950, deposit: 1900, duration: "12 mjeseci", place: "Zagreb", date,
  };
}
