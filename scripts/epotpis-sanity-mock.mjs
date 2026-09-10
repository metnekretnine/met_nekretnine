// Test-only HTTP fixture exercising @sanity/client requests and revision conflicts.
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { evaluate, parse } from "groq-js";

export async function startSanityMock() {
  let documents = new Map();
  const emails = new Map(), failedOnce = new Set();
  const server = createServer(async (request, response) => {
    const url = new URL(request.url, "http://127.0.0.1");
    const send = (status, value) => { response.writeHead(status, { "Content-Type": "application/json" }); response.end(JSON.stringify(value)); };
    const authenticated = request.headers.authorization === "Bearer local-test-token";
    try {
      if (url.pathname === "/__emails") {
        if (request.method === "GET") return send(200, [...emails.values()]);
        if (request.method !== "POST" || request.headers.authorization !== "Bearer local-test-resend-key") return send(401, { error: "Invalid mock request" });
        let body = ""; for await (const chunk of request) body += chunk;
        const message = JSON.parse(body), key = request.headers["idempotency-key"];
        if (!key || !message.from || !message.to?.length || !message.subject || !message.text) return send(422, { error: "Incomplete email" });
        if (message.to.includes("retry-once@example.test") && !failedOnce.has(key)) {
          failedOnce.add(key);
          return send(503, { error: "Temporary test failure" });
        }
        if (!emails.has(key)) emails.set(key, { id: randomUUID(), key, ...message });
        return send(200, { id: emails.get(key).id });
      }
      if (url.pathname.includes("/data/doc/test/")) {
        const ids = decodeURIComponent(url.pathname.split("/data/doc/test/")[1]).split(",");
        return send(200, { documents: ids.map(id => documents.get(id)).filter(doc => doc && (authenticated || !doc._id.includes("."))) });
      }
      if (url.pathname.includes("/data/query/test")) {
        const query = url.searchParams.get("query"), params = {};
        for (const [key, value] of url.searchParams) if (key.startsWith("$")) params[key.slice(1)] = JSON.parse(value);
        const dataset = [...documents.values()].filter(doc => authenticated || !doc._id.includes("."));
        const result = await (await evaluate(parse(query, { params }), { dataset, params })).get();
        return send(200, { result, ms: 1, query });
      }
      if (url.pathname.includes("/data/mutate/test")) {
        if (!authenticated) return send(401, { error: { type: "unauthorized", description: "Authentication required" } });
        let body = ""; for await (const chunk of request) body += chunk;
        const { mutations } = JSON.parse(body);
        const next = new Map([...documents].map(([id,doc]) => [id,structuredClone(doc)]));
        const results = [];
        for (const mutation of mutations) {
          const create = mutation.create || mutation.createIfNotExists;
          if (create) {
            if (next.has(create._id)) {
              if (mutation.create) return send(409, { error: { type: "mutationError", description: "Document already exists" } });
              continue;
            }
            if (!create._id.startsWith("epotpisDemo.")) return send(400, { error: { description: "Non-private test record" } });
            const now = new Date().toISOString();
            next.set(create._id, { ...create, _rev: randomUUID(), _createdAt: now, _updatedAt: now });
            results.push({ id: create._id, operation: "create" });
          } else if (mutation.patch) {
            const patch = mutation.patch, current = next.get(patch.id);
            if (!current || current._rev !== patch.ifRevisionID) return send(409, { error: { type: "mutationError", description: "Revision mismatch" } });
            next.set(patch.id, { ...current, ...patch.set, _rev: randomUUID(), _updatedAt: new Date().toISOString() });
            results.push({ id: patch.id, operation: "update" });
          } else if (mutation.delete) {
            next.delete(mutation.delete.id);
            results.push({ id: mutation.delete.id, operation: "delete" });
          } else return send(400, { error: { description: "Unsupported mutation" } });
        }
        documents = next;
        return send(200, { transactionId: randomUUID(), results });
      }
      send(404, { error: { description: "Not found" } });
    } catch (error) { send(500, { error: { description: String(error) } }); }
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  return { url: `http://127.0.0.1:${server.address().port}`, close: () => server.close() };
}
