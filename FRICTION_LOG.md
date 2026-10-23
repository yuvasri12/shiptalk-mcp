# Friction Log

Developer-experience notes from building ShipTalk for the Alexa+ track.

## Entries

### Alexa+ MCP Toolkit: tooling is partner-only
- **Task attempted:** Test the MCP server on real Alexa+ using the MCP Toolkit, CLI and Web Simulator.
- **Steps taken:** Read the Alexa+ MCP Toolkit quickstart, then the hackathon FAQ.
- **Expected:** Participants could install the toolkit and run the server through an Alexa+ simulator.
- **Actual:** The add-on tools are in preview for select partners only, so participants cannot get access.
- **Severity:** major
- **Workaround:** Built a web page that acts as a real MCP client (initialize, tools/list, tools/call over Streamable HTTP).
- **Suggestion:** Say on the quickstart page that the tools are partner-only, so hackathon participants find out before planning around them.

### Browser speech recognition: network error
- **Task attempted:** Let the user speak a question to the web client with the browser's speech recognition.
- **Steps taken:** Clicked Speak in Chrome on the restricted network used for development.
- **Expected:** The browser transcribes the speech and the page asks the server.
- **Actual:** Speech recognition fails with a "network" error because Chrome's cloud speech service is unreachable.
- **Severity:** minor
- **Workaround:** Typing questions and example chips are the reliable input; the page shows a clear error message.
- **Suggestion:** Document that browser speech recognition needs internet access to Google's service, and offer an offline option for demos.