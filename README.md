# ShipTalk

Voice-first shipment concierge built as a self-hosted **MCP server** (Streamable HTTP, protocol 2025-11-25) plus a small **web MCP client** that simulates an Alexa+-style assistant. Built for the Amazon Developer Hackathon, Alexa+ track. All data is invented mock data.

## What it does
Ask in plain language: "Where is SHP-1002?", "Which shipments are at risk?", "Why is SHP-1003 at risk?", "Draft an update for SHP-1002". Type a question or click an example. The web page sends real MCP requests (`initialize`, `tools/list`, `tools/call`) to the server and shows the answer, a shipment timeline, and the raw JSON-RPC traffic.

The page also has a **Speak** button (browser speech recognition) and a **Read answers aloud** option (browser speech synthesis). Both depend on the browser. Chrome's speech recognition uses a cloud service that was blocked on the restricted network this project was built on, so typing is the reliable way to use the page.

## Why
Customers and small importers wait on hold for shipment status. A voice assistant that can call a shipment tool gives them an answer in seconds, and the same MCP server can be reused by any MCP-capable assistant.

## Tools
| Tool | Purpose |
|---|---|
| `track_shipment` | Status, ETA and latest event for one shipment |
| `list_at_risk_shipments` | Delayed or at-risk shipments (optional filter) |
| `explain_delay` | Plain-language reason for a delay |
| `draft_customer_update` | Friendly or formal message for a customer |

Answers are written to sound natural when read aloud.

## Try it
**Locally (recommended):** see "Run it" below, then open http://127.0.0.1:3000.

**Hosted demo:** [add your Render address here, or delete this line]. The free host sleeps when idle, so the first visit can take about a minute.

Mock shipments you can ask about:
| ID | Customer | Status |
|---|---|---|
| SHP-1001 | Acme Home Goods | in transit |
| SHP-1002 | Blue Fern Cafe | delayed (port congestion) |
| SHP-1003 | Northwind Bikes | at risk (customs documents) |
| SHP-1004 | Lumen Books | delivered |

Suggested questions: "Where is SHP-1002?", "Which shipments are at risk?", "Why is SHP-1003 at risk?", "Draft an update for SHP-1002". An unknown ID such as SHP-9999 returns a clear error message.

## Architecture
```
Web MCP client (public/index.html)  --POST /mcp (Streamable HTTP)-->  Express server (src/index.ts)
                                                                        |- security guard: Origin, MCP-Protocol-Version
                                                                        |- MCP server + zod-validated tools (src/server.ts)
                                                                        '- mock data (src/data.ts)
```
Stateless JSON mode: each POST creates a fresh server and transport. `GET /mcp` returns 405, which the spec allows for servers that do not offer a server-initiated stream.

## Project structure
```
src/index.ts      Express app, security checks, /mcp endpoint
src/server.ts     MCP server and the four tools (zod-validated)
src/data.ts       Invented shipment data
public/index.html Web MCP client (simulated Alexa+ experience)
scripts/smoke.mjs 13 protocol and tool checks
skills/shiptalk/  Agent Skill describing how to use the tools
FRICTION_LOG.md   Developer-experience notes from building this
```

## Run it
Requires Node 20+ (built and tested on Node 24 in GitHub Codespaces).

```bash
npm install
npm run dev          # http://127.0.0.1:3000  (page at /, MCP endpoint at /mcp)
npm run smoke        # in a second terminal: expect 13 PASS lines
```

Environment variables: `PORT` (default 3000), `HOST` (default 127.0.0.1; set `0.0.0.0` when deploying), `ALLOWED_ORIGINS` (comma-separated extra allowed origins, needed for a hosted address). In GitHub Codespaces the forwarded address is allowed automatically.

## Standards followed
- MCP spec 2025-11-25, Streamable HTTP, single `/mcp` endpoint
- `Origin` validated on every request (403 if invalid)
- `MCP-Protocol-Version` validated (400 if unsupported)
- Binds to localhost by default
- Tool inputs validated with zod
- 13 automated smoke checks (`npm run smoke`)

## Measured latency
Measured in GitHub Codespaces: tool calls took 4-19 ms server-side (smoke test), and `initialize` 63-151 ms. From the browser through the Codespaces forwarding address, calls took about 135-166 ms. All are well under the 500 ms round-trip guideline in Amazon's Alexa+ MCP docs.

## Built with
Node.js, TypeScript (run with tsx), the MCP TypeScript SDK v1.x, Express 5 and zod 4, developed in GitHub Codespaces. AI assistance from Claude was used for planning and code drafts; the code was run, tested and reviewed by the author.

## Agent Skill
`skills/shiptalk/SKILL.md` teaches an agent when and how to call these tools.

## Limitations
- Mock data only, no real carrier integration
- No authentication in this version, which is acceptable only because all data is invented. A real deployment needs OAuth as described in Amazon's Alexa+ MCP docs
- Real Alexa+ add-on tooling is limited to select partners, so this project is demonstrated through its own web MCP client and has not been run on real Alexa+
- MCP Apps is not used; the shipment timeline is drawn by the web client page
- Stateless server, no server-initiated notifications

## New during the hackathon
The entire project was created during the submission period.

## License
MIT