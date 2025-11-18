# System Architecture

## Complete Application Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BROWSER (Port 3000)                          │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│  ┃              DualPaneLayout Component                        ┃  │
│  ┃  ┌─────────────────────────┬────────────────────────────┐   ┃  │
│  ┃  │   LEFT PANE             │   RIGHT PANE               │   ┃  │
│  ┃  │                         │                            │   ┃  │
│  ┃  │   ChatUI Component      │   TerminalPanel Component  │   ┃  │
│  ┃  │   ─────────────────     │   ───────────────────────  │   ┃  │
│  ┃  │   • Chat messages       │   • xterm.js instance      │   ┃  │
│  ┃  │   • Input field         │   • WebSocket client       │   ┃  │
│  ┃  │   • File uploads        │   • Connection status      │   ┃  │
│  ┃  │   • Assistants          │   • Real-time I/O          │   ┃  │
│  ┃  │   • Settings            │                            │   ┃  │
│  ┃  │                         │                            │   ┃  │
│  ┃  │   HTTP/REST calls       │   WebSocket               │   ┃  │
│  ┃  │         ↓               │       ↕                    │   ┃  │
│  ┃  └─────────┼───────────────┴───────┼────────────────────┘   ┃  │
│  ┗━━━━━━━━━━━━┼━━━━━━━━━━━━━━━━━━━━━━━┼━━━━━━━━━━━━━━━━━━━━━━┛  │
└───────────────┼───────────────────────┼─────────────────────────┘
                │                       │
                │ Supabase APIs         │ ws://localhost:3001
                │                       │
┌───────────────┼───────────────────────┼─────────────────────────┐
│               ↓                       ↓                         │
│  ┌──────────────────────┐   ┌──────────────────────────────┐   │
│  │   Supabase Cloud     │   │   BACKEND (Port 3001)        │   │
│  │   ──────────────     │   │   ────────────────────       │   │
│  │   • Auth             │   │   server.js                  │   │
│  │   • Database         │   │   ├─ Express HTTP           │   │
│  │   • Storage          │   │   ├─ WebSocket Server       │   │
│  │   • Edge Functions   │   │   └─ Session Management     │   │
│  └──────────────────────┘   │                              │   │
│                              │   terminal.js                │   │
│                              │   ├─ Shell Process Manager   │   │
│                              │   ├─ stdin/stdout/stderr     │   │
│                              │   └─ Process Lifecycle       │   │
│                              │            ↕                 │   │
│                              │   ┌──────────────────────┐   │   │
│                              │   │   Shell Process      │   │   │
│                              │   │   PowerShell / Bash  │   │   │
│                              │   └──────────────────────┘   │   │
│                              │                              │   │
│                              │   llm.js (Optional)          │   │
│                              │   └─ LLM API Integration     │   │
│                              └──────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Component Relationships

### 1. Frontend Components

```
app/[locale]/[workspaceid]/chat/page.tsx
            │
            ├─► DualPaneLayout.tsx
            │       │
            │       ├─► leftPane: ChatUI (existing)
            │       │       │
            │       │       └─► Connects to Supabase
            │       │
            │       └─► rightPane: TerminalPanel.tsx
            │               │
            │               └─► Connects to Backend WebSocket
            │
            └─► Uses existing chat context and components
```

### 2. Backend Components

```
backend/server.js (Main Entry)
        │
        ├─► Express Server (REST)
        │   └─► GET /health
        │
        ├─► WebSocket Server
        │   ├─► Connection Handler
        │   ├─► Message Router
        │   └─► Session Manager
        │
        └─► terminal.js
            └─► createTerminalSession()
                ├─► spawn shell process
                ├─► pipe stdin ←→ WebSocket
                ├─► pipe stdout ←→ WebSocket
                └─► pipe stderr ←→ WebSocket
```

## Data Flow Diagrams

### Terminal Command Execution

```
1. User types command
      ↓
2. xterm.js captures input
      ↓
3. Send via WebSocket: {"type":"input", "data":"ls\r"}
      ↓
4. Backend receives message
      ↓
5. Write to shell.stdin
      ↓
6. Shell executes command
      ↓
7. Shell outputs to stdout
      ↓
8. Backend reads stdout
      ↓
9. Send via WebSocket: {"type":"output", "data":"file1\nfile2\n"}
      ↓
10. xterm.js displays output
```

### Chat Message Flow

```
1. User types message
      ↓
2. ChatInput component
      ↓
3. useChatHandler hook
      ↓
4. API call to /api/chat
      ↓
5. Next.js API route
      ↓
6. LLM Provider (OpenAI/Anthropic/etc)
      ↓
7. Stream response back
      ↓
8. Update chat messages
      ↓
9. Store in Supabase
```

## File Organization

```
/chatbot-ui-main/
│
├── Frontend (Next.js)
│   ├── app/
│   │   ├── [locale]/[workspaceid]/chat/page.tsx  ← Dual-pane integration
│   │   ├── terminal/
│   │   │   ├── TerminalPanel.tsx                 ← xterm.js component
│   │   │   └── useTerminal.ts                    ← Legacy hook
│   │   └── api/                                  ← Chat API routes
│   ├── layouts/
│   │   └── DualPaneLayout.tsx                    ← Split view layout
│   └── components/                               ← Existing chat components
│
├── Backend (Node.js)
│   └── backend/
│       ├── server.js                             ← Main server
│       ├── terminal.js                           ← Shell manager
│       ├── llm.js                                ← LLM integration
│       └── package.json                          ← Dependencies
│
└── Configuration
    ├── .env.local                                ← Environment vars
    ├── TERMINAL_README.md                        ← Full docs
    ├── QUICKSTART.md                             ← Quick guide
    └── start.ps1 / start.sh                      ← Startup scripts
```

## Key Technologies

```
Frontend:
├── Next.js 14              (React framework)
├── xterm.js                (Terminal emulator)
├── WebSocket API           (Real-time communication)
├── Tailwind CSS            (Styling)
└── TypeScript              (Type safety)

Backend:
├── Node.js                 (Runtime)
├── Express                 (HTTP server)
├── ws                      (WebSocket server)
├── child_process           (Shell execution)
└── JavaScript              (CommonJS)

Infrastructure:
├── Supabase                (Auth, DB, Storage)
├── PostgreSQL              (Database)
└── Local Shell             (PowerShell/Bash)
```

## Network Ports

```
Port 3000: Next.js Frontend (HTTP)
Port 3001: Backend Server (HTTP + WebSocket)
Port 5432: PostgreSQL (if local Supabase)
```

## Security Boundaries

```
┌─────────────────────────────────────┐
│  Public Internet                    │
└─────────────────────────────────────┘
                 ↕
┌─────────────────────────────────────┐
│  Localhost Only (Development)       │
│  ┌───────────────────────────────┐  │
│  │  Frontend (localhost:3000)    │  │
│  └───────────────────────────────┘  │
│              ↕                      │
│  ┌───────────────────────────────┐  │
│  │  Backend (localhost:3001)     │  │
│  │  ⚠️  Full shell access         │  │
│  │  ⚠️  No authentication         │  │
│  │  ⚠️  No sandboxing             │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

⚠️ **Security Warning:**
This setup provides full shell access without restrictions.
**DO NOT** expose to the internet without proper security measures.
