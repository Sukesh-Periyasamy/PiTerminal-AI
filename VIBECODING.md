# Pi Terminal AI

> **Built on top of [Chatbot UI by McKayWrigley](https://github.com/mckaywrigley/chatbot-ui)**  
> All original UI components, icons, styles, and features are preserved.

**Pi Terminal AI** extends Chatbot UI with:
- ✅ Live Terminal Panel (xterm.js)
- ✅ Backend WebSocket Terminal Engine
- ✅ Run Button for AI-suggested commands
- ✅ Automatic Terminal Output Explanation
- ✅ Dual-pane layout (Chat + Terminal)
- ✅ 100% local execution

---

## 📌 High-Level Behavior

### 1. User chats normally with the AI
- The AI works exactly like ChatGPT
- When AI suggests a command (code block or bash syntax), a **Run button** appears

### 2. When user clicks RUN
- Command is sent to backend via WebSocket
- Backend runs it through a persistent shell (`child_process.spawn`)
- Terminal output streams live in the TerminalPanel

### 3. When terminal output stops
After 500ms of "no new output," the system triggers:
```
Explain this terminal output:
<output>
```
- AI generates a short explanation
- Explanation appears as an assistant message in Chat Panel

### 4. User can request deeper explanation
Typing: "Explain more", "What happened?", "Why this error?" will trigger additional LLM processing.

### 5. Settings Panel
- Local API key storage
- Option to switch between OpenAI / Anthropic / Local Ollama
- No authentication, no security layers (MVP)

### 6. UI Layout
- **Left:** Chat UI (existing Chatbot UI components)
- **Right:** Terminal (xterm.js)
- **Responsive:** On mobile, stacks vertically

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account (for Chatbot UI backend)

### Installation

```bash
# 1. Install dependencies
npm install
cd backend && npm install && cd ..

# 2. Configure environment
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Run migrations in Supabase
# Upload combined-migrations.sql to Supabase SQL editor

# 4. Start both servers
# Option A: Use start script (Windows)
.\start.ps1

# Option B: Manual start
# Terminal 1 - Backend
cd backend && node server.js

# Terminal 2 - Frontend
npm run dev
```

Visit: http://localhost:3000

---

## 🔄 Complete Workflow

```
User: "How do I install nginx?"
   ↓
AI: "You can install nginx with:
     ```bash
     sudo apt update
     sudo apt install nginx
     ```
     [Run] [Run]"
   ↓
User clicks [Run]
   ↓
Terminal executes: sudo apt update
   ↓
Output streams: "Hit:1 http://archive.ubuntu.com..."
   ↓
After 500ms idle
   ↓
AI explains: "The system package list was updated successfully..."
```

---

## 🧩 Architecture

### Frontend Components Added

| Component | Purpose |
|-----------|---------|
| `DualPaneLayout.tsx` | Resizable split-pane (Chat \| Terminal) |
| `TerminalPanel.tsx` | xterm.js terminal with WebSocket |
| `RunButton.tsx` | Interactive command execution button |
| `extractCommands.ts` | Parse markdown for runnable commands |
| `useTerminal.ts` | Terminal WebSocket hook |

### Frontend Components Modified

| Component | Changes |
|-----------|---------|
| `message.tsx` | Added command detection + RunButton rendering |
| `chat-messages.tsx` | Added `onRunCommand` prop chain |
| `chat-ui.tsx` | Added `onRunCommand` prop |
| `chat/page.tsx` | Wired terminal + auto-explanation logic |

### Backend Structure

```
backend/
├── server.js          # Express + WebSocket server (port 3001)
├── terminal.js        # Shell process management (child_process.spawn)
└── package.json
```

**Key Features:**
- Persistent shell session using `child_process.spawn("bash")` (or PowerShell on Windows)
- Real-time stdin/stdout streaming
- Multiple simultaneous connections supported

---

## 📂 Project Structure

```
chatbot-ui-main/
├── app/
│   ├── [locale]/[workspaceid]/chat/
│   │   └── page.tsx                  # Main chat with DualPaneLayout
│   └── terminal/
│       └── TerminalPanel.tsx         # xterm.js terminal
├── backend/
│   ├── server.js                     # WebSocket server
│   └── terminal.js                   # Shell management
├── components/
│   ├── chat/
│   │   ├── chat-ui.tsx              # Enhanced with onRunCommand
│   │   └── chat-messages.tsx        # Passes command handler
│   ├── messages/
│   │   ├── message.tsx              # Command detection + RunButton
│   │   └── run-button.tsx           # NEW: Execute button
│   └── ... (original Chatbot UI components preserved)
├── layouts/
│   └── DualPaneLayout.tsx           # NEW: Split-pane layout
├── lib/
│   ├── extract-commands.ts          # NEW: Command parser
│   └── hooks/
│       └── use-terminal.ts          # NEW: Terminal hook
├── .env.local                       # Supabase + API keys
└── README.md                        # Original Chatbot UI readme
```

---

## 📌 Development Guidelines

### ✅ DO
- Only **ADD** new components/features
- Use TailwindCSS for styling
- Write TypeScript-friendly code
- Keep backend modular
- Preserve Chatbot UI functionality

### ❌ DO NOT
- Remove existing Chatbot UI components
- Delete icons or styles
- Break original functionality
- Modify core Chatbot UI files unless necessary

---

## 🎯 MVP Goals (Current)

- ✅ Chat + Terminal integration
- ✅ Command detection and execution
- ✅ Auto-explanation of output
- ✅ Local-only execution
- ✅ No security layers (rapid iteration)
- ✅ Preserve all Chatbot UI features

---

## 🔮 Future Roadmap

Planned features (not yet implemented):

- 🔐 SSH device management
- ⚠️ Command risk scoring
- 📝 Log storage
- 🖥️ Multi-device switching
- 👤 User accounts
- ☁️ Cloud deployment
- 🛡️ Safety layer & hallucination detection

**Note:** All future features must follow the same rule: **extend, never remove** existing Chatbot UI functionality.

---

## 🐛 Troubleshooting

### Terminal not connecting
```bash
# Check backend is running
cd backend && node server.js
# Should see: "WebSocket server started on port 3001"
```

### Run button not appearing
- Ensure message is from **assistant** (not user)
- Check code block uses supported language: bash, sh, shell, zsh, powershell, ps1
- Open browser console to check `extractCommands()` output

### Commands not executing
- Verify WebSocket status (green dot in terminal header)
- Check backend logs for errors
- Ensure port 3001 is not blocked

### AI not explaining output
- Verify `onCommandFinished` is passed to TerminalPanel
- Check output length > 10 characters
- Ensure active chat session exists

---

## 📚 Documentation

Complete documentation available:

| File | Description |
|------|-------------|
| `RUN_BUTTON_FEATURE.md` | Complete feature guide + architecture |
| `IMPLEMENTATION_SUMMARY.md` | Quick overview of changes |
| `FLOW_DIAGRAMS.md` | Visual component + data flow |
| `TESTING_GUIDE.md` | 10 test cases with success criteria |
| `TERMINAL_README.md` | Terminal integration details |
| `ARCHITECTURE.md` | System architecture |
| `QUICKSTART.md` | Quick start guide |

---

## 💡 Key Technical Details

### Command Detection

Uses regex to find executable commands:

```typescript
// Code blocks
/```(?:bash|sh|shell|zsh|powershell|ps1)\n([\s\S]*?)```/g

// Inline
/(?:run this command|execute|run):?\s*`([^`]+)`/gi
```

### Terminal Output Processing

Cleans output before sending to AI:

```typescript
output
  .replace(/\x1b\[[0-9;]*m/g, "")  // Remove ANSI
  .split("\n")
  .filter(line => line.trim())     // Remove empty
  .join("\n")
```

### Auto-Explanation

Triggered after 500ms of terminal silence:

```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    if (output) onCommandFinished(output)
  }, 500)
  return () => clearTimeout(timer)
}, [output])
```

---

## 🔧 Tech Stack

**Frontend:**
- Next.js 14
- React 18
- TypeScript
- TailwindCSS
- xterm.js 5.3.0
- Chatbot UI (base)

**Backend:**
- Node.js
- Express 5.1.0
- WebSocket (ws 8.18.3)
- child_process (built-in)

**Database:**
- Supabase (PostgreSQL)

---

## 🤝 Credits

**Pi Terminal AI** is built on top of:
- [Chatbot UI](https://github.com/mckaywrigley/chatbot-ui) by McKayWrigley
- [xterm.js](https://xtermjs.org/) for terminal emulation
- [Express](https://expressjs.com/) for backend server
- [WebSocket](https://github.com/websockets/ws) for real-time communication

All original Chatbot UI functionality is preserved and respected.

---

## 📄 License

Based on [Chatbot UI](https://github.com/mckaywrigley/chatbot-ui) by McKayWrigley.  
Terminal integration and Run Button features © 2025 Pi Terminal AI.

---

## 🎯 Core Principles

**Pi Terminal AI** follows these strict rules:

1. ✅ **Preserve all Chatbot UI components** - Nothing is removed
2. ✅ **Only extend functionality** - Never break existing features
3. ✅ **Modular architecture** - All new features are separate modules
4. ✅ **Local-first development** - No security layers, no production infrastructure
5. ✅ **Dual-pane layout** - Chat (left) | Terminal (right)
6. ✅ **Run → Execute → Explain workflow** - Core interaction pattern
7. ✅ **500ms idle detection** - Triggers automatic explanation
8. ✅ **child_process.spawn("bash")** - Persistent shell session

---

**Made with ❤️ for developers who want AI + Terminal in one place**
