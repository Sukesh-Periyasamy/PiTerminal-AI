# Pi Terminal AI - Technical Documentation

This document provides detailed technical information about the Pi Terminal AI system architecture and implementation.

## Core Components

### 1. CommandCard Component (`components/chat/command-card.tsx`)

The CommandCard component renders interactive command cards from LLM responses:

```typescript
interface CommandData {
  command: string;
  description?: string;
  explanation?: string;
}

interface CommandCardProps {
  commandData: CommandData;
  status: 'pending' | 'error' | 'success' | 'suggestion';
  onRun: (command: string) => void;
  output?: string;
}
```

**Features:**
- Status indicators with color-coded badges
- One-click command execution
- Output display with syntax highlighting
- Error handling and retry mechanisms

### 2. LLM Response Parser (`lib/parse-llm-response.ts`)

Parses LLM responses to extract structured command data:

```typescript
export function parseLLMResponse(content: string): {
  hasCommands: boolean;
  commands: CommandData[];
  cleanedContent: string;
}
```

**Detection Patterns:**
- JSON code blocks with command objects
- Markdown code blocks with shell commands
- Inline command references with backticks

### 3. Terminal Panel (`app/terminal/TerminalPanel.tsx`)

Full terminal emulation using xterm.js with WebSocket communication:

**Key Features:**
- Dynamic imports for SSR compatibility
- Fallback terminal for error cases
- Real-time WebSocket communication
- Terminal theming and customization
- Automatic output analysis

**Architecture:**
```typescript
useEffect(() => {
  const initTerminal = async () => {
    const [{ Terminal }, { FitAddon }] = await Promise.all([
      import('xterm'),
      import('xterm-addon-fit')
    ]);
    // Terminal initialization
  };
}, []);
```

### 4. WebSocket Server (`backend/server.js`)

Node.js server handling terminal sessions:

```javascript
const WebSocket = require('ws');
const { createTerminalSession } = require('./terminal');

// WebSocket server for terminal communication
const wss = new WebSocket.Server({ port: 3003 });

wss.on('connection', (ws) => {
  const terminal = createTerminalSession();
  // Handle input/output/resize events
});
```

### 5. Analysis API (`app/api/chat/analyze/route.ts`)

OpenAI-powered analysis of terminal output:

```typescript
export async function POST(request: Request) {
  const { output } = await request.json();
  
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: ANALYSIS_PROMPT },
      { role: "user", content: output }
    ],
    stream: true
  });
  
  return new StreamingTextResponse(OpenAIStream(response));
}
```

## Data Flow

1. **User Input** → Chat interface receives user message
2. **LLM Processing** → Message sent to AI for response generation
3. **Response Parsing** → `parseLLMResponse` extracts command data
4. **Command Cards** → Interactive cards rendered for detected commands
5. **Terminal Execution** → Commands executed via WebSocket to backend
6. **Output Analysis** → Terminal output analyzed for next steps
7. **Continuous Loop** → Process repeats for seamless workflow

## Error Handling

### Terminal Initialization
- 10-second timeout prevents infinite loading
- Fallback terminal provides basic functionality
- Clear error messages guide user recovery

### WebSocket Connection
- Automatic reconnection on disconnect
- Connection status indicators
- Graceful degradation to local mode

### Command Execution
- Output validation and sanitization
- Error detection and reporting
- Retry mechanisms for failed commands

## Performance Optimization

### Dynamic Imports
```typescript
// Prevents SSR issues with browser-only libraries
const { Terminal } = await import('xterm');
```

### Lazy Loading
- Terminal initialization only when needed
- Component-level code splitting
- Efficient WebSocket connection management

### Memory Management
- Proper cleanup of terminal instances
- WebSocket connection disposal
- Timeout clearing and resource cleanup

## Security Considerations

### Command Validation
- Input sanitization for terminal commands
- Whitelist approach for safe commands
- User confirmation for destructive operations

### WebSocket Security
- Local-only connections by default
- Input validation on server side
- Rate limiting for command execution

### Environment Isolation
- Sandboxed terminal sessions
- Limited file system access
- Process isolation for security

## Deployment

### Development
```bash
# Frontend (Next.js)
npm run dev  # Port 3000

# Backend (WebSocket)
node backend/server.js  # Port 3003
```

### Production
```bash
# Build optimized frontend
npm run build
npm start

# Backend with PM2
pm2 start backend/server.js
```

### Environment Variables
```bash
OPENAI_API_KEY=required
NEXT_PUBLIC_SUPABASE_URL=optional
SUPABASE_SERVICE_ROLE_KEY=optional
```

## Testing Strategy

### Unit Tests
- Component testing with Jest/React Testing Library
- Utility function validation
- API endpoint testing

### Integration Tests
- WebSocket communication testing
- Terminal session management
- End-to-end command execution

### Browser Testing
- Cross-browser compatibility
- Terminal rendering validation
- Performance testing

## Monitoring and Debugging

### Logging
```typescript
console.log('Terminal initialization...', { step: 'import' });
console.log('WebSocket connected', { url: wsUrl });
console.error('Command execution failed', { command, error });
```

### Performance Metrics
- Terminal initialization time
- WebSocket latency
- Command execution duration
- Memory usage monitoring

### Debug Mode
Enable detailed logging for development:
```typescript
const DEBUG = process.env.NODE_ENV === 'development';
if (DEBUG) console.log('Debug info...');
```

This technical documentation provides the foundation for understanding and extending the Pi Terminal AI system.