---
name: shiptalk
description: Use when the user asks about shipment status, delayed or at-risk shipments, the reason for a delay, or wants a customer update message, using the ShipTalk MCP server tools.
---

# ShipTalk

ShipTalk exposes mock shipment data through MCP tools. Use it to answer shipment questions concisely, in a way that works when read aloud.

## Tools
- `track_shipment(shipment_id)`: current status, location, ETA.
- `list_at_risk_shipments(days)`: shipments likely to miss their ETA in the next N days.
- `explain_delay(shipment_id)`: plain-language reason for a delay.
- `draft_customer_update(shipment_id, tone)`: short message a customer service agent could send.

## How to use
1. If the user gives a shipment ID, call `track_shipment` first.
2. For "what's at risk" questions, call `list_at_risk_shipments`, then offer `explain_delay` for the top item.
3. Only call `draft_customer_update` when asked for a message.
4. Answer in one or two short sentences. Lead with the status and ETA. Avoid tables and long IDs when speaking.
5. If a tool returns an error (unknown ID), say so plainly and ask for the ID again.

## Notes
- All data is mock data for a demo. Do not present it as real shipments.
