import express, { type Request, type Response, type NextFunction } from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer } from "./server.js";

const PORT = Number(process.env.PORT ?? 3000);
// Localhost-only by default (spec rule). Set HOST=0.0.0.0 when deploying.
const HOST = process.env.HOST ?? "127.0.0.1";
const SUPPORTED_VERSIONS = ["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"];
const EXTRA_ORIGINS = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
// In GitHub Codespaces, allow the forwarded address of this server.
if (process.env.CODESPACE_NAME && process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN) {
  EXTRA_ORIGINS.push(
    `https://${process.env.CODESPACE_NAME}-${PORT}.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`
  );
}

const rpcError = (code: number, message: string) => ({
  jsonrpc: "2.0",
  error: { code, message },
  id: null,
});

function originAllowed(origin: string): boolean {
  try {
    const host = new URL(origin).hostname;
    if (["localhost", "127.0.0.1", "[::1]"].includes(host)) return true;
  } catch {
    return false;
  }
  return EXTRA_ORIGINS.includes(origin);
}

const app = express();

// Security guard on /mcp: Origin (403) then MCP-Protocol-Version (400)
app.use("/mcp", (req: Request, res: Response, next: NextFunction) => {
  const origin = req.header("origin");
  if (origin && !originAllowed(origin)) {
    res.status(403).json(rpcError(-32000, "Forbidden: invalid Origin"));
    return;
  }
  const version = req.header("mcp-protocol-version");
  if (version && !SUPPORTED_VERSIONS.includes(version)) {
    res.status(400).json(rpcError(-32000, `Unsupported MCP-Protocol-Version: ${version}`));
    return;
  }
  next();
});

app.use(express.json({ limit: "1mb" }));
app.use(express.static("public")); // web MCP client page goes here later

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// Stateless Streamable HTTP: fresh server + transport per POST, JSON responses
app.post("/mcp", async (req: Request, res: Response) => {
  const t0 = performance.now();
  const server = createServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  res.on("close", () => {
    console.log(`${req.body?.method ?? "?"} ${Math.round(performance.now() - t0)}ms`);
    transport.close();
    server.close();
  });
  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json(rpcError(-32603, "Internal server error"));
    }
  }
});

// No server-initiated SSE stream and no sessions: 405 is spec-allowed
const methodNotAllowed = (_req: Request, res: Response) => {
  res
    .status(405)
    .set("Allow", "POST")
    .json(rpcError(-32000, "Method not allowed"));
};
app.get("/mcp", methodNotAllowed);
app.delete("/mcp", methodNotAllowed);

app.listen(PORT, HOST, () => {
  console.log(`ShipTalk MCP server: http://${HOST}:${PORT}/mcp`);
});