/** @jest-environment node */
import { digest, rateLimit } from "./store";
const mockDocs = new Map<string, Record<string, unknown>>();
jest.mock("@sanity/client", () => ({ createClient: () => ({
  getDocument: async (id: string) => mockDocs.get(id),
  transaction: () => ({
    create: (doc: { _id: string }) => mockDocs.set(doc._id, { ...doc, _rev: "fixture" }),
    patch: (id: string, update: (patch: unknown) => unknown) => {
      const patch = { ifRevisionId: () => patch, set: (fields: object) => mockDocs.set(id, { ...mockDocs.get(id), ...fields }) };
      update(patch);
    },
    commit: async () => {},
  }),
}) }));
const original = process.env;
beforeEach(() => { process.env = { ...original, SANITY_API_WRITE_TOKEN: "fixture" }; mockDocs.clear(); });
afterEach(() => { process.env = original; });
test("a busy create bucket cannot block a signing policy with the same hash bucket", async () => {
  const bucket = (key: string) => Number.parseInt(digest(key).slice(0, 4), 16) % 128;
  let token = 0;
  while (bucket(`sign:${token}`) !== bucket("create")) token++;
  for (let i = 0; i < 20; i++) await rateLimit("create", 30, 60000);
  for (let i = 0; i < 12; i++) await rateLimit(`sign:${token}`, 12, 600000);
  await expect(rateLimit(`sign:${token}`, 12, 600000)).rejects.toMatchObject({ status: 429 });
  await expect(rateLimit("create", 30, 60000)).resolves.toBeUndefined();
});
