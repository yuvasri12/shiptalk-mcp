const BASE = process.env.BASE_URL ?? "http://127.0.0.1:3000/mcp";
const HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json, text/event-stream",
};
let nextId = 1;
let failures = 0;

async function rpc(method, params, extra = {}) {
  const t = performance.now();
  const res = await fetch(BASE, {
    method: "POST",
    headers: { ...HEADERS, ...extra },
    body: JSON.stringify({ jsonrpc: "2.0", id: nextId++, method, params }),
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { status: res.status, ms: Math.round(performance.now() - t), json, text };
}

function check(name, ok, detail = "") {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name} ${detail}`);
}

const init = await rpc("initialize", {
  protocolVersion: "2025-11-25",
  capabilities: {},
  clientInfo: { name: "smoke", version: "0.0.1" },
});
const negotiated = init.json?.result?.protocolVersion;
check("initialize", init.status === 200 && !!negotiated, `version=${negotiated} ${init.ms}ms`);
check("negotiated 2025-11-25", negotiated === "2025-11-25", "(if FAIL: npm i @modelcontextprotocol/sdk@latest)");

const ver = { "MCP-Protocol-Version": negotiated ?? "2025-11-25" };

const list = await rpc("tools/list", {}, ver);
check("tools/list has track_shipment",
  list.json?.result?.tools?.some((t) => t.name === "track_shipment"), `${list.ms}ms`);

const ok = await rpc("tools/call", { name: "track_shipment", arguments: { shipmentId: "SHP-1002" } }, ver);
check("tools/call SHP-1002", ok.status === 200 && !ok.json?.result?.isError, `${ok.ms}ms`);
console.log("      ", ok.json?.result?.content?.[0]?.text);

const missing = await rpc("tools/call", { name: "track_shipment", arguments: { shipmentId: "SHP-9999" } }, ver);
check("unknown id returns isError", missing.json?.result?.isError === true);

const bad = await rpc("tools/call", { name: "track_shipment", arguments: { shipmentId: "nope" } }, ver);
check("bad input rejected by zod", !!bad.json?.error || bad.json?.result?.isError === true);

const origin = await rpc("tools/list", {}, { ...ver, Origin: "https://evil.example" });
check("bad Origin -> 403", origin.status === 403);

const badVer = await rpc("tools/list", {}, { "MCP-Protocol-Version": "1999-01-01" });
check("bad protocol version -> 400", badVer.status === 400);

const get = await fetch(BASE, { method: "GET", headers: { Accept: "text/event-stream" } });
check("GET -> 405", get.status === 405);

const risk = await rpc("tools/call", { name: "list_at_risk_shipments", arguments: {} }, ver);
check("list_at_risk_shipments", !risk.json?.result?.isError && risk.json?.result?.structuredContent?.shipments?.length === 2, `${risk.ms}ms`);

const why = await rpc("tools/call", { name: "explain_delay", arguments: { shipmentId: "SHP-1003" } }, ver);
check("explain_delay SHP-1003", !why.json?.result?.isError && /customs/i.test(why.json?.result?.content?.[0]?.text ?? ""), `${why.ms}ms`);

const draft = await rpc("tools/call", { name: "draft_customer_update", arguments: { shipmentId: "SHP-1002", tone: "formal" } }, ver);
check("draft_customer_update", !draft.json?.result?.isError && draft.json?.result?.content?.[0]?.text?.includes("SHP-1002"), `${draft.ms}ms`);
console.log(failures ? `\n${failures} check(s) failed` : "\nAll checks passed");
process.exit(failures ? 1 : 0);
