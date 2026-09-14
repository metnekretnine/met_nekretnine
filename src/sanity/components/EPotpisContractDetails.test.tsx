import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { ContractDetails } from "./EPotpisContractDetails";

const pdf = btoa("%PDF-1.7\noriginal saved bytes");
function payload(joint = true) {
  return JSON.stringify({ id: "contract-123", status: "signed", pdf, final_pdf: pdf, signed_at: "2026-09-10T12:00:00Z",
    snapshot: JSON.stringify({ number: "041/2026", createdAt: "2026-09-09T12:00:00Z", expiresAt: "2026-10-09T12:00:00Z", input: {
      ownerName: "Marko Horvat", oib: "12345678903", ownerAddress: "Zagreb", email: "test@example.com", propertyAddress: "Ilica 10",
      kind: "open", rent: 900, deposit: 900, ...(joint ? { coOwner: { ownerName: "Ana Horvat", oib: "98765432106" } } : {}),
    } }),
  });
}
beforeEach(() => {
  URL.createObjectURL = jest.fn().mockReturnValue("blob:saved-pdf");
  URL.revokeObjectURL = jest.fn();
});
afterEach(cleanup);
test("existing records show both owners and download saved PDF blobs without an API", async () => {
  const { unmount } = render(<ContractDetails payload={payload()} />);
  expect(screen.queryByText(/041\/2026/)).not.toBeInTheDocument();
  expect(screen.getByText("Marko Horvat")).toBeVisible();
  expect(screen.getByText("Ana Horvat")).toBeVisible();
  expect(screen.getByText("Ilica 10")).toBeVisible();
  expect(screen.getByText("Potpisan", { selector: "dd" })).toBeVisible();
  await waitFor(() => expect(screen.getByRole("link", { name: "Preuzmi potpisani PDF" })).toHaveAttribute("download", "MET-ugovor-potpisan.pdf"));
  expect(screen.getByRole("link", { name: "Preuzmi PDF prije potpisa" })).toHaveAttribute("href", "blob:saved-pdf");
  const blob = (URL.createObjectURL as jest.Mock).mock.calls[0][0] as Blob;
  const bytes = await new Promise<string>(resolve => { const reader = new FileReader(); reader.onload = () => resolve(reader.result as string); reader.readAsText(blob); });
  expect(bytes).toBe(atob(pdf));
  unmount();
  expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2);
});
test("single owner has no empty second owner, and missing PDFs are explicit", () => {
  const row = JSON.parse(payload(false)); row.pdf = null; row.final_pdf = null;
  render(<ContractDetails payload={JSON.stringify(row)} />);
  expect(screen.queryByText("Nalogodavac 2")).not.toBeInTheDocument();
  expect(screen.getByText("PDF još nije spremljen za ovaj ugovor.")).toBeVisible();
});
test("malformed records and corrupt PDFs show a readable error", async () => {
  const view = render(<ContractDetails payload="invalid" />);
  expect(screen.getByRole("alert")).toHaveTextContent("nije moguće pročitati");
  const row = JSON.parse(payload()); row.pdf = "invalid"; row.final_pdf = null;
  view.rerender(<ContractDetails payload={JSON.stringify(row)} />);
  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Spremljeni PDF nije moguće pročitati"));
  expect(URL.createObjectURL).not.toHaveBeenCalled();
});
