import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { findShipment, shipments, type Shipment } from "./data.js";

const idSchema = z
  .string()
  .regex(/^SHP-\d{4}$/i, "Shipment ID must look like SHP-1001");

const label = (s: Shipment) => s.status.replace("_", " ");

const notFound = (id: string) => ({
  isError: true,
  content: [
    { type: "text" as const, text: `No shipment found with ID ${id.toUpperCase()}.` },
  ],
});

export function createServer(): McpServer {
  const server = new McpServer({ name: "shiptalk", version: "0.2.0" });

  server.registerTool(
    "track_shipment",
    {
      title: "Track shipment",
      description:
        "Get the current status, ETA and latest event for one shipment by ID (format SHP-1001).",
      inputSchema: { shipmentId: idSchema },
    },
    async ({ shipmentId }) => {
      const s = findShipment(shipmentId);
      if (!s) return notFound(shipmentId);
      const last = s.events[s.events.length - 1];
      const text =
        `${s.id} (${s.customer}) is ${label(s)}. ` +
        `${s.origin} to ${s.destination}, ETA ${s.eta}. ` +
        `Latest: ${last.note} at ${last.location}.`;
      return {
        content: [{ type: "text" as const, text }],
        structuredContent: { shipment: s },
      };
    }
  );

  server.registerTool(
    "list_at_risk_shipments",
    {
      title: "List at-risk shipments",
      description:
        "List shipments that are delayed or at risk of missing their ETA. Optional filter: all, delayed or at_risk.",
      inputSchema: { status: z.enum(["all", "delayed", "at_risk"]).optional() },
    },
    async ({ status }) => {
      const wanted = status ?? "all";
      const list = shipments
        .filter((s) => s.status === "delayed" || s.status === "at_risk")
        .filter((s) => wanted === "all" || s.status === wanted);
      if (list.length === 0) {
        return {
          content: [{ type: "text" as const, text: "No shipments are at risk right now." }],
          structuredContent: { shipments: [] as Shipment[] },
        };
      }
      const lines = list.map(
        (s) => `${s.id} for ${s.customer} is ${label(s)}, ETA ${s.eta}`
      );
      const text =
        `${list.length} shipment${list.length === 1 ? " is" : "s are"} at risk. ` +
        lines.join(". ") +
        ".";
      return {
        content: [{ type: "text" as const, text }],
        structuredContent: { shipments: list },
      };
    }
  );

  server.registerTool(
    "explain_delay",
    {
      title: "Explain delay",
      description: "Explain in plain language why one shipment is delayed or at risk.",
      inputSchema: { shipmentId: idSchema },
    },
    async ({ shipmentId }) => {
      const s = findShipment(shipmentId);
      if (!s) return notFound(shipmentId);
      const text = s.delayReason
        ? `${s.id} is ${label(s)}. ${s.delayReason} Current ETA is ${s.eta}.`
        : `${s.id} has no delay recorded. It is ${label(s)} with ETA ${s.eta}.`;
      return {
        content: [{ type: "text" as const, text }],
        structuredContent: { shipment: s },
      };
    }
  );

  server.registerTool(
    "draft_customer_update",
    {
      title: "Draft customer update",
      description:
        "Draft a short message a customer service agent can send about one shipment. Tone: friendly or formal.",
      inputSchema: {
        shipmentId: idSchema,
        tone: z.enum(["friendly", "formal"]).optional(),
      },
    },
    async ({ shipmentId, tone }) => {
      const s = findShipment(shipmentId);
      if (!s) return notFound(shipmentId);
      const route = `${s.origin} to ${s.destination}`;
      const situation =
        s.status === "delivered"
          ? "It has been delivered."
          : s.delayReason
          ? `It is currently ${label(s)}: ${s.delayReason}`
          : "It is on schedule.";
      const message =
        (tone ?? "friendly") === "formal"
          ? `Dear ${s.customer}, we are writing about shipment ${s.id} (${route}). ${situation} The current estimated arrival is ${s.eta}. We will notify you of any change. Kind regards, Customer Service.`
          : `Hi ${s.customer} team, a quick update on shipment ${s.id} (${route}). ${situation} The current ETA is ${s.eta}. We will keep you posted. Thank you for your patience!`;
      return {
        content: [{ type: "text" as const, text: message }],
        structuredContent: { shipment: s, message },
      };
    }
  );

  return server;
}