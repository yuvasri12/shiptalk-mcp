# Alexa+ MCP Requirements Checklist

Source: Amazon Developer docs, "Alexa+ MCP Toolkit" quickstart and "Choose the Proper Alexa+ Integration Approach". Re-check the docs before submitting, as they may change.

## Integration path
- We use the **MCP Toolkit** path (for services outside a supported Alexa+ category). Alexa+ acts as the MCP client and consumes our tools and resources.
- TODO: check whether shipment tracking fits a Category SDK category.
- Alexa+ supports the MCP Apps extension for interactive visuals on screen-based devices.

## Server requirements
Note: items marked (production) are Alexa+ partner requirements. Hackathon participants cannot deploy to real Alexa+ (see below), so treat them as nice-to-have polish. Spec-compliant Streamable HTTP is the must-have.

- [ ] Streamable HTTP transport (not legacy SSE)
- [ ] Reachable via a remote URL
- [ ] (production) Returns **401 Unauthorized without a WWW-Authenticate header** for unauthenticated requests
- [ ] (production) Auth server metadata at `/.well-known/oauth-authorization-server`
- [ ] (production) `resource` parameter set to the server's canonical URI
- [ ] Round-trip response latency under **500 ms** (measure and record the number in README)

## MCP spec 2025-11-25 transport rules
- [ ] One MCP endpoint (e.g. `/mcp`) supporting POST and GET
- [ ] Client Accept header handled (application/json and text/event-stream)
- [ ] Validate `Origin` on all connections; return 403 if invalid
- [ ] Bind to localhost when running locally
- [ ] Validate `MCP-Protocol-Version`; 400 for unsupported versions
- [ ] If sessions are used: `MCP-Session-Id` handling (400 if missing when required, 404 after termination)

## Real Alexa+ access (answered by the hackathon FAQ)
- The Alexa+ add-on tools (Category SDK, MCP Toolkit, Alexa AI CLI, Web Simulator) are in preview for select partners only. Participants cannot apply for or get access. Do NOT plan any `alexa-ai` CLI steps.
- Official demo path: a web page that acts as a real MCP client (initialize, tools/list, tools/call over Streamable HTTP). The simulator source must be in the repo.
- Showing an existing AI assistant calling the same server is a bonus, not required.
- Do not claim the project runs on real Alexa+. Say it is built to the open MCP standard that powers Alexa+ integrations.

## Hackathon rule reminders (Alexa+)
- Repo must actually call the MCP tech in code (import, entry point, loaded config), not just mention it in README.
- Demo must show the MCP server or Agent Skill working.
