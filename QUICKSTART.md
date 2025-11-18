# 🚀 Quick Start Guide

## Start the Application

### Option 1: Automated Script (Recommended)

**Windows (PowerShell):**
```powershell
.\start.ps1
```

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
node backend/server.js
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## Access the Application

1. **Open browser:** http://localhost:3000
2. **Login/Signup** with your credentials
3. **Navigate to chat:** Click on any workspace or create a new one
4. **Enjoy the dual-pane interface!**

## 📋 Folder Structure

```
✅ COMPLETE - All files in place

/chatbot-ui-main/
├── app/
│   ├── [locale]/[workspaceid]/chat/
│   │   └── page.tsx                  ✅ Dual-pane layout integrated
│   └── terminal/
│       └── TerminalPanel.tsx         ✅ xterm.js terminal
├── layouts/
│   └── DualPaneLayout.tsx            ✅ Resizable split view
└── backend/
    ├── server.js                     ✅ Express + WebSocket server
    ├── terminal.js                   ✅ Shell process manager
    └── llm.js                        ✅ LLM integration
```

## ✨ Key Features

### Dual-Pane Layout
- ✅ Chat on left, terminal on right
- ✅ Drag divider to resize (20-80%)
- ✅ Both panels fully functional

### Terminal
- ✅ Full xterm.js emulator
- ✅ Real command execution
- ✅ PowerShell (Windows) / Bash (Unix)
- ✅ Streaming I/O
- ✅ Connection status indicator

### Chat
- ✅ Full chatbot functionality
- ✅ Multiple LLM providers
- ✅ File uploads
- ✅ Assistants & workspaces

## 🎯 Data Flow

```
User → xterm.js → WebSocket → Backend
                                  ↓
                           Shell Process
                                  ↓
                    stdout → WebSocket → xterm.js
```

## 🔧 Configuration

### Ports
- **Frontend:** 3000 (Next.js)
- **Backend:** 3001 (WebSocket + REST)

### Environment Variables (.env.local)
```bash
# Required for chat
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key

# Optional for AI features
OPENAI_API_KEY=your_key
ANTHROPIC_API_KEY=your_key
```

## 🐛 Troubleshooting

### Backend not starting?
```bash
# Check port 3001 is free
netstat -ano | findstr :3001  # Windows
lsof -i :3001                 # Unix/Mac

# Test health endpoint
curl http://localhost:3001/health
```

### Terminal not connecting?
1. Check backend is running
2. Open browser DevTools → Console
3. Look for WebSocket errors
4. Verify `ws://localhost:3001` is accessible

### Chat not working?
1. Verify `.env.local` has Supabase credentials
2. Check Supabase dashboard for database tables
3. Ensure user profile and workspace exist

## 📚 Learn More

- Full documentation: `TERMINAL_README.md`
- Backend details: `backend/README.md`
- Original Chatbot UI: https://github.com/mckaywrigley/chatbot-ui

## 🎉 You're Ready!

The application is fully configured with:
✅ Dual-pane layout
✅ Working terminal
✅ Chat functionality
✅ Backend integration

Happy coding! 🚀
