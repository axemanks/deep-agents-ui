# Plan: Enhance Deep Agents UI for Sub-Agent Debugging

## Current Implementation
- `ChatInterface` processes messages and renders `ChatMessage` components.
- `ChatMessage` displays message text and tool calls through `ToolCallBox`; sub-agent creation tool calls (`name === "task"`) are hidden from the tool call list and instead summarized with `SubAgentIndicator`.
- `ToolCallBox` collapses tool call details and only shows tool name and status icon in the header.
- Stakeholders currently must expand each tool call or sub-agent card to see arguments and results.

## Goals
- Make tool calls visually distinct so their purpose is clear without expansion.
- Surface details about sub-agent creation and outputs directly in the chat stream.
- Provide richer debugging information for stakeholders without cluttering the interface.

## Proposed Improvements
1. **Tool Call Metadata & Icons**
   - Create a utility mapping tool names to icons and badge colors (e.g., search, file, sub-agent).
   - Update `ToolCallBox` header to render the mapped icon and apply color styling based on tool type.
2. **Preview Arguments/Results in Header**
   - Add truncated snippets of key arguments or the first line of results directly in the collapsed header of `ToolCallBox`.
   - Display timestamps or duration if available in tool call metadata.
3. **Specialized Sub-Agent Call Rendering**
   - For `toolCall.name === "task"`, replace the generic `ToolCallBox` with a `SubAgentToolCallBox`:
     - Show sub-agent name, description, and status icon in the collapsed view.
     - Include a one-line summary of the sub-agent's output.
     - Allow expansion to reveal full input/output similar to `SubAgentPanel`.
   - Visually nest subsequent tool calls executed by the sub-agent beneath its parent indicator.
4. **Group and Filter Tool Calls**
   - Provide controls to expand/collapse all tool calls or filter by tool name or sub-agent within the chat view.
   - Consider a side panel summarizing all sub-agents and their tool calls for quick navigation.
5. **Styling & UX Enhancements**
   - Update SCSS modules for `ToolCallBox`, `SubAgentIndicator`, and related components to support new icons, colors, and nested layout.
   - Ensure keyboard accessibility for new interactive elements.
6. **Documentation**
   - Document new debugging features and usage in `README.md` once implemented.

## Testing
- After implementation, run `npm run lint` and `npm test` to verify code quality and future tests.

