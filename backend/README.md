# Backend Terminal Execution Engine

This is the local backend for the terminal functionality in the chatbot UI.

## Architecture

```
┌─────────────────┐         WebSocket          ┌─────────────────┐
│   Frontend      │ ◄────────────────────────► │   Backend       │
│   (xterm.js)    │                             │   (Node.js)     │
└─────────────────┘                             └─────────────────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │  Child Process  │
                                                │  (PowerShell/   │
                                                │   Bash)         │
                                                └─────────────────┘
```

## Components

### server.js
- Express HTTP server for REST endpoints
- WebSocket server for terminal connections
- Manages terminal sessions per connection

### terminal.js
- Creates and manages shell processes (`child_process.spawn`)
- Handles bidirectional communication between WebSocket and shell
- Streams stdout/stderr to frontend
- Handles user input from frontend

### llm.js
- LLM integration for AI-powered commands
- Placeholder for OpenAI or other LLM APIs

## Installation

```bash
cd backend
npm install
```

## Usage

Start the backend server:

```bash
npm start
# or
node server.js
```

Server will start on port 3001 with both HTTP and WebSocket support.

## WebSocket Protocol

### Client → Server

**Input Data:**
```json
{
  "type": "input",
  "data": "command or keypress data"
}
```

**Resize Terminal:**
```json
{
  "type": "resize",
  "cols": 80,
  "rows": 24
}
```

### Server → Client

**Output Data:**
```json
{
  "type": "output",
  "data": "terminal output"
}
```

**Error Data:**
```json
{
  "type": "error",
  "data": "error message"
}
```

## Features

- ✅ Real-time terminal execution
- ✅ PowerShell support (Windows)
- ✅ Bash/Zsh support (Linux/Mac)
- ✅ Bidirectional streaming
- ✅ Multiple concurrent sessions
- ✅ Auto-cleanup on disconnect

## Environment Variables

None required for basic operation. For AI features, set:

```bash
OPENAI_API_KEY=your_key_here
```

## Security Notes

⚠️ **This is a local-only backend.** Do not expose to the internet without proper authentication and sandboxing.

- Runs shell commands with current user permissions
- No authentication implemented
- No command filtering or sandboxing
- Intended for local development only

## REST Endpoints

**Health Check:**
```
GET http://localhost:3001/health
```

Response:
```json
{
  "status": "ok",
  "message": "Terminal backend running"
}
```

## Dependencies

- `express` - HTTP server
- `ws` - WebSocket server
- `cors` - Cross-origin support
- `child_process` - Shell execution (built-in)

## Future Enhancements

- [ ] PTY support with `node-pty` for better terminal emulation
- [ ] Command history
- [ ] Session persistence
- [ ] Authentication
- [ ] Command filtering/sandboxing
- [ ] File upload/download
