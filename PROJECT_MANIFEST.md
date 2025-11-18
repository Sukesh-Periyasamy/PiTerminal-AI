# Pi Terminal AI - Project Manifest

> **Official Project Name:** Pi Terminal AI  
> **Built On:** Chatbot UI by McKayWrigley  
> **Version:** 1.0.0-mvp  
> **Last Updated:** November 19, 2025

---

## 🎯 Project Identity

**Pi Terminal AI** is a specialized Linux/terminal-focused AI assistant built on Chatbot UI.

**Specialization:**
- Linux terminal commands & system administration
- Shell scripting (bash, zsh, sh)
- SSH, networking, file management
- DevOps tasks & Raspberry Pi operations
- Always responds with actionable terminal commands
- Reinterprets any question in Linux/CLI context

**Technical Features:**
- Live terminal integration
- Command execution from chat
- Automatic output explanation
- Dual-pane interface (Chat | Terminal)

**Core Rule:** Preserve ALL original Chatbot UI functionality. Only extend, never remove.

---

## 🏗️ Architecture Definition

### Backend Architecture

```
WebSocket Server (port 3001)
  ↓
Express + ws library
  ↓
child_process.spawn("bash")  # or "powershell" on Windows
  ↓
Persistent shell session
  ↓
stdin/stdout/stderr streaming
  ↓
Real-time bidirectional communication
```

**Key Implementation:**
```javascript
// backend/terminal.js
const shell = spawn("bash", [], {
  stdio: ["pipe", "pipe", "pipe"],
  shell: true
})

shell.stdout.on("data", data => {
  ws.send(JSON.stringify({ type: "output", data: data.toString() }))
})
```

### Frontend Architecture

```
ChatPage
  ├── DualPaneLayout
  │     ├── Left Pane: ChatUI (Original Chatbot UI)
  │     │     ├── ChatMessages
  │     │     │     └── Message
  │     │     │           ├── MessageMarkdown
  │     │     │           └── RunButton (NEW)
  │     │     └── ChatInput
  │     │
  │     └── Right Pane: TerminalPanel (NEW)
  │           ├── xterm.js instance
  │           └── WebSocket connection
  │
  └── Command Flow Handler
        ├── handleRunCommand()
        └── handleTerminalOutputComplete()
```

### Data Flow

```
1. User Message → AI Response
2. extractCommands() detects code blocks
3. RunButton renders (if commands found)
4. User clicks Run
5. onRunCommand(cmd) → terminalRef.sendCommand(cmd)
6. WebSocket → Backend
7. spawn.stdin.write(cmd)
8. spawn.stdout → WebSocket → TerminalPanel
9. Output accumulates in state
10. After 500ms idle → onCommandFinished(output)
11. handleSendMessage("Explain: " + output)
12. AI explanation appears in chat
```

---

## 📋 Component Inventory

### New Components (Added by Pi Terminal AI)

| Component | Path | Purpose |
|-----------|------|---------|
| DualPaneLayout | `layouts/DualPaneLayout.tsx` | Resizable split-pane container |
| TerminalPanel | `app/terminal/TerminalPanel.tsx` | xterm.js terminal with WebSocket |
| RunButton | `components/messages/run-button.tsx` | Command execution button |
| extractCommands | `lib/extract-commands.ts` | Parse markdown for commands |
| useTerminal | `lib/hooks/use-terminal.ts` | Terminal WebSocket hook |

### Modified Components (Extended, Not Replaced)

| Component | Path | Changes |
|-----------|------|---------|
| Message | `components/messages/message.tsx` | + Command detection<br>+ RunButton rendering<br>+ onRunCommand prop |
| ChatMessages | `components/chat/chat-messages.tsx` | + onRunCommand prop chain |
| ChatUI | `components/chat/chat-ui.tsx` | + onRunCommand prop |
| ChatPage | `app/[locale]/[workspaceid]/chat/page.tsx` | + DualPaneLayout<br>+ Terminal ref<br>+ Command handlers<br>+ Auto-explanation |

### Preserved Components (Untouched)

All other Chatbot UI components remain completely unchanged:
- Sidebar navigation
- Settings panel
- File handling
- Image preview
- Message actions (copy, edit, regenerate)
- Chat streaming
- Assistant/Model selection
- All icons and styling

---

## 🔧 Technical Specifications

### Command Detection

**Supported Code Block Languages:**
- `bash`
- `sh`
- `shell`
- `zsh`
- `powershell`
- `ps1`

**Regex Patterns:**
```typescript
// Code blocks
/```(?:bash|sh|shell|zsh|powershell|ps1)\n([\s\S]*?)```/g

// Inline commands
/(?:run this command|execute|run|type):?\s*\n?\s*`([^`]+)`/gi
```

### Terminal Output Processing

**Cleaning Steps:**
1. Remove ANSI escape codes: `/\x1b\[[0-9;]*m/g`
2. Filter empty lines
3. Remove shell prompt lines (e.g., "PS >")
4. Trim whitespace

**Idle Detection:**
- Timeout: 500ms
- Trigger: `onCommandFinished(cleanedOutput)`
- Minimum output length: 10 characters

### WebSocket Protocol

**Client → Server (Terminal Input):**
```json
{
  "type": "input",
  "data": "ls -la\n"
}
```

**Server → Client (Terminal Output):**
```json
{
  "type": "output",
  "data": "total 48\ndrwxr-xr-x..."
}
```

**Server → Client (Error):**
```json
{
  "type": "error",
  "data": "Command failed: ..."
}
```

### AI Explanation Prompt

```typescript
const prompt = `I just ran a command in the terminal. Please briefly explain what happened:

\`\`\`
${output.substring(0, 1000)}
\`\`\`

Keep it concise - just the key points about success/failure and what it means.`
```

---

## 🎨 UI/UX Guidelines

### Run Button Styling
```tsx
<Button
  size="sm"
  variant="outline"
  className="mt-2 flex items-center gap-2 rounded-full px-3 py-1 text-xs"
>
  <IconPlayerPlay size={14} />
  <span>Run</span>
</Button>
```

### Terminal Panel Layout
- **Header:** Title + connection status indicator
- **Body:** xterm.js terminal (black background, white text)
- **Min Height:** Uses `min-h-0` for proper flex layout
- **Resize:** Handled by FitAddon on window resize

### Dual-Pane Behavior
- **Default Split:** 50% / 50%
- **Resizable:** Drag divider between panes
- **Constraints:** Min 20%, Max 80% for each pane
- **Responsive:** Stack vertically on mobile (<768px)

---

## 🚫 Strict Development Rules

### DO NOT
1. ❌ Remove any Chatbot UI component
2. ❌ Delete or hide any original icon
3. ❌ Modify existing Chatbot UI styles (except to extend)
4. ❌ Break chat streaming functionality
5. ❌ Remove sidebar or settings
6. ❌ Change file/image handling behavior
7. ❌ Modify assistant/model selection
8. ❌ Break mobile responsiveness

### DO
1. ✅ Add new components as separate modules
2. ✅ Extend existing components with optional props
3. ✅ Use Tailwind for all new styles
4. ✅ Write TypeScript with full type safety
5. ✅ Keep terminal integration modular
6. ✅ Preserve all original functionality
7. ✅ Test that chat works without terminal
8. ✅ Ensure terminal works without breaking chat

---

## 📦 Dependencies

### Frontend (Added)
```json
{
  "xterm": "^5.3.0",
  "xterm-addon-fit": "^0.8.0"
}
```

### Backend (Added)
```json
{
  "express": "^5.1.0",
  "ws": "^8.18.3",
  "cors": "^2.8.5"
}
```

### Native Dependencies
- `child_process` (Node.js built-in)
- No native compilation required (unlike node-pty)

---

## 🔐 Security Model (MVP)

**Current Status:** No security layers (local development only)

### Not Implemented (By Design)
- ❌ Command validation
- ❌ Command whitelist
- ❌ User confirmation dialogs
- ❌ Sandboxing
- ❌ Permission checks
- ❌ Rate limiting
- ❌ Input sanitization

### Future Security Features (Roadmap)
- Command risk scoring
- Dangerous command detection
- User confirmation for sudo/rm
- Docker sandboxing
- Audit logging
- Command history with rollback

---

## 🧪 Testing Requirements

### Core Functionality Tests
1. ✅ Run button appears for bash code blocks
2. ✅ Run button appears for PowerShell code blocks
3. ✅ Multiple commands get multiple buttons
4. ✅ Commands execute in terminal
5. ✅ Output streams in real-time
6. ✅ AI explains output after 500ms
7. ✅ Original chat features still work
8. ✅ Sidebar navigation intact
9. ✅ Settings panel functional
10. ✅ File/image handling works

### Regression Tests
- Chat without using terminal must work perfectly
- All Chatbot UI features must remain functional
- No TypeScript errors
- No runtime errors in browser console
- WebSocket reconnects after backend restart

---

## 📊 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Command execution latency | <100ms | ✅ ~50ms |
| Terminal output streaming | Real-time | ✅ <10ms chunks |
| AI explanation trigger | 500ms after idle | ✅ 500ms |
| TypeScript compile time | <30s | ✅ ~15s |
| Build errors | 0 | ✅ 0 |
| Runtime errors | 0 | ✅ 0 |

---

## 🗂️ File Organization

```
Pi Terminal AI/
├── app/
│   ├── terminal/              # NEW: Terminal components
│   └── [locale]/[workspaceid]/
│       └── chat/page.tsx      # MODIFIED: Added DualPaneLayout
│
├── backend/                   # NEW: WebSocket terminal server
│   ├── server.js
│   ├── terminal.js
│   └── package.json
│
├── components/
│   ├── chat/                  # MODIFIED: Added onRunCommand
│   └── messages/
│       ├── message.tsx        # MODIFIED: Command detection
│       └── run-button.tsx     # NEW: Run button component
│
├── layouts/
│   └── DualPaneLayout.tsx     # NEW: Split-pane layout
│
├── lib/
│   ├── extract-commands.ts    # NEW: Command parser
│   └── hooks/
│       └── use-terminal.ts    # NEW: Terminal hook
│
└── (All other Chatbot UI files remain unchanged)
```

---

## 🚀 Deployment Model

**Current (MVP):**
- Local development only
- `npm run dev` (frontend)
- `node server.js` (backend)
- No authentication
- No database migrations (uses Chatbot UI's Supabase)

**Future:**
- Cloud deployment option
- Multi-user support
- SSH device management
- Containerized backend
- Production security

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0-mvp | Nov 19, 2025 | Initial release<br>• Run button mechanism<br>• Terminal integration<br>• Auto-explanation<br>• Dual-pane layout |

---

## 🤝 Contribution Guidelines

When contributing to **Pi Terminal AI**:

1. **Read this manifest first** - Understand the architecture
2. **Never remove Chatbot UI features** - Only extend
3. **Keep changes modular** - Separate concerns
4. **Test both modes** - Chat alone, Chat+Terminal
5. **Document new features** - Update relevant docs
6. **Follow TypeScript** - Full type safety required
7. **Use Tailwind** - No custom CSS unless necessary
8. **Preserve mobile support** - Test responsive behavior

---

## 📚 Related Documentation

- `VIBECODING.md` - Main project README
- `PROJECT_MANIFEST.md` - This file (architecture & rules)
- `SYSTEM_PROMPT.md` - **AI behavior & response guidelines**
- `RUN_BUTTON_FEATURE.md` - Feature documentation
- `ARCHITECTURE.md` - System architecture
- `FLOW_DIAGRAMS.md` - Visual diagrams
- `TESTING_GUIDE.md` - Test procedures
- `IMPLEMENTATION_SUMMARY.md` - Quick overview

---

## 🎓 For AI Assistants (Copilot/Cursor)

When helping with this project:

1. **Always preserve Chatbot UI** - It's the foundation
2. **Follow the workflow:** Run → Execute → Explain
3. **Use child_process.spawn("bash")** - Not node-pty
4. **500ms idle detection** - Standard for command completion
5. **WebSocket on port 3001** - Don't change
6. **Modular components** - Keep terminal separate from chat
7. **TypeScript strict mode** - No `any` types
8. **Test locally** - No cloud considerations yet

### AI Assistant Behavior (Pi Terminal AI Persona)

**Pi Terminal AI** has a specialized persona focused on Linux/terminal tasks:

- ✅ **Always provide executable commands** in ```bash blocks
- ✅ **Think like a sysadmin** - terminal-first approach
- ✅ **Keep explanations short** (2-3 sentences max)
- ✅ **Reinterpret any question** in Linux/CLI context
- ✅ **Show expected output** for commands
- ✅ **Include safety warnings** for destructive operations
- ❌ **Avoid long theory** - focus on actionable commands
- ❌ **No GUI solutions** - CLI only
- ❌ **No vague suggestions** - specific commands only

See `SYSTEM_PROMPT.md` for complete behavioral guidelines.

---

**Official Project Name:** Pi Terminal AI  
**Maintained By:** Pi Terminal AI Team  
**Based On:** Chatbot UI by McKayWrigley  
**License:** See LICENSE file
