# Chatbot UI with Integrated Terminal

A Next.js chatbot interface with an integrated terminal emulator running side-by-side.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Browser (localhost:3000)              │
│  ┌──────────────────────┬──────────────────────────┐   │
│  │   Chat Panel         │   Terminal Panel         │   │
│  │   (ChatUI)           │   (xterm.js)            │   │
│  │                      │   WebSocket ↕            │   │
│  └──────────────────────┴──────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                            │
                            │ WebSocket (ws://localhost:3001)
                            ↓
┌─────────────────────────────────────────────────────────┐
│            Backend Server (localhost:3001)              │
│  ┌──────────────────┐  ┌──────────────────┐           │
│  │   WebSocket      │  │   HTTP/REST      │           │
│  │   Server         │  │   Server         │           │
│  └────────┬─────────┘  └──────────────────┘           │
│           │                                             │
│  ┌────────▼────────────────────────────┐               │
│  │   Terminal Manager (terminal.js)    │               │
│  │   - Shell Process (PowerShell/Bash) │               │
│  │   - stdin/stdout/stderr streaming   │               │
│  └─────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
/chatbot-ui-main/
├── app/
│   ├── [locale]/
│   │   ├── [workspaceid]/
│   │   │   └── chat/
│   │   │       └── page.tsx          # Main chat page with dual-pane layout
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── terminal/
│       ├── TerminalPanel.tsx         # xterm.js terminal component
│       └── useTerminal.ts            # WebSocket hook (legacy)
├── layouts/
│   └── DualPaneLayout.tsx            # Resizable split pane layout
├── backend/
│   ├── server.js                     # Express + WebSocket server
│   ├── terminal.js                   # Shell process management
│   ├── llm.js                        # LLM integration
│   ├── package.json
│   └── README.md
├── components/                        # Existing chatbot UI components
├── context/                          # React context providers
├── db/                               # Database operations
├── lib/                              # Utility functions
├── supabase/                         # Supabase config & migrations
├── .env.local                        # Environment variables
└── package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Supabase account (for chat functionality)
- API keys for LLM providers (optional)

### 1. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd backend
npm install
cd ..
```

### 2. Configure Environment

Copy and configure your environment variables:
```bash
# Already done if you followed setup
# .env.local should contain:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
```

### 3. Start Backend Server

In one terminal:
```bash
node backend/server.js
```

Output:
```
WebSocket server started on port 3001
HTTP server started on port 3001
```

### 4. Start Frontend

In another terminal:
```bash
npm run dev
```

Output:
```
▲ Next.js 14.1.0
- Local:        http://localhost:3000
```

### 5. Access the Application

1. Open browser: `http://localhost:3000`
2. Login/signup
3. Navigate to chat: `http://localhost:3000/{workspace-id}/chat`
4. You'll see the dual-pane layout:
   - **Left:** Chat interface
   - **Right:** Terminal

## ✨ Features

### Dual-Pane Layout
- ✅ Resizable panels (drag the divider)
- ✅ Chat and terminal side-by-side
- ✅ Responsive design
- ✅ Maintains state during resize

### Terminal Features
- ✅ Full xterm.js terminal emulator
- ✅ Real-time command execution
- ✅ PowerShell (Windows) / Bash (Linux/Mac)
- ✅ Streaming stdin/stdout/stderr
- ✅ Connection status indicator
- ✅ Auto-reconnect on disconnect
- ✅ Multiple concurrent sessions

### Chat Features
- ✅ Full chatbot UI functionality
- ✅ Multiple LLM providers (OpenAI, Anthropic, Google, etc.)
- ✅ File attachments
- ✅ Assistants
- ✅ Workspaces
- ✅ Chat history

## 🔧 Configuration

### Backend Port
Default: `3001`

Change in `backend/server.js`:
```javascript
const PORT = 3001
```

And in `app/terminal/TerminalPanel.tsx`:
```typescript
const socket = new WebSocket("ws://localhost:3001")
```

### Terminal Shell
Automatically detects:
- **Windows:** PowerShell
- **Linux/Mac:** Bash or `$SHELL`

Override in `backend/terminal.js`:
```javascript
const shell = process.platform === "win32" ? "cmd.exe" : "bash"
```

### LLM Integration
Configure API keys in `.env.local`:
```bash
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
GOOGLE_GEMINI_API_KEY=your_key_here
```

## 📝 Usage

### Terminal Commands
Type any shell command in the terminal:
```bash
# List files
ls

# Check current directory
pwd

# Run Node.js
node --version

# Execute scripts
python script.py
```

### Chat Interface
- Send messages to the AI
- Upload files
- Create assistants
- Manage workspaces

### Resizing Panels
- Click and drag the vertical divider between panels
- Minimum: 20% / Maximum: 80%

## 🛠️ Development

### Start Development Mode
```bash
# Terminal 1: Backend
node backend/server.js

# Terminal 2: Frontend
npm run dev
```

### Hot Reload
- Frontend: Automatic with Next.js
- Backend: Restart `node backend/server.js` after changes

### Debug Backend
```bash
node --inspect backend/server.js
```

Then connect with Chrome DevTools or VS Code debugger.

## 🔒 Security Notes

⚠️ **This is a local development setup. Do NOT expose to the internet without:**
- Authentication/authorization
- Command filtering/sandboxing
- Rate limiting
- Input validation
- HTTPS/WSS

## 🐛 Troubleshooting

### Terminal not connecting
1. Check backend is running: `http://localhost:3001/health`
2. Check browser console for WebSocket errors
3. Ensure port 3001 is not blocked by firewall

### Chat not working
1. Verify Supabase credentials in `.env.local`
2. Check database migrations ran successfully
3. Ensure user profile and workspace exist

### Commands not executing
1. Check backend terminal for errors
2. Verify shell process spawned correctly
3. Check user has permission to execute commands

## 📚 API Documentation

### WebSocket Protocol

**Client → Server:**
```json
{
  "type": "input",
  "data": "command or keypress"
}
```

**Server → Client:**
```json
{
  "type": "output",
  "data": "terminal output"
}
```

### REST Endpoints

**Health Check:**
```
GET http://localhost:3001/health

Response: {"status": "ok", "message": "Terminal backend running"}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

See LICENSE file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [xterm.js](https://xtermjs.org/) - Terminal emulator
- [Supabase](https://supabase.com/) - Backend as a service
- Original [Chatbot UI](https://github.com/mckaywrigley/chatbot-ui) by McKay Wrigley
