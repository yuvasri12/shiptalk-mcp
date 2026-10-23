---
name: shiptalk
description: Use when the user asks about shipment status, delayed or at-risk shipments, the reason for a delay, or wants a customer update message, using the ShipTalk MCP server tools.
---

# ShipTalk

ShipTalk exposes mock shipment data through MCP tools. Use it to answer shipment questions concisely, in a way that works when read aloud.

## Tools
- `track_shipment(shipmentId)`: status, ETA and latest event for one shipment (ID like SHP-1001).
- `list_at_risk_shipments(status?)`: delayed or at-risk shipments. Optional status filter: all, delayed or at_risk.
- `explain_delay(shipmentId)`: plain-language reason for a delay.
- `draft_customer_update(shipmentId, tone?)`: short message a customer service agent could send. Tone: friendly or formal.

## How to use
1. If the user gives a shipment ID, call `track_shipment` first.
2. For "what's at risk" questions, call `list_at_risk_shipments`, then offer `explain_delay` for the top item.
3. Only call `draft_customer_update` when asked for a message.
4. Answer in one or two short sentences. Lead with the status and ETA. Avoid tables and long IDs when speaking.
5. If a tool returns an error (unknown ID), say so plainly and ask for the ID again.

## Notes
- All data is mock data for a demo. Do not present it as real shipments.