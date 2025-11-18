# Run Button Flow Diagram

## Component Hierarchy

```
ChatPage
├── DualPaneLayout
│   ├── Left Pane: ChatUI
│   │   └── ChatMessages
│   │       └── Message (multiple)
│   │           ├── MessageMarkdown
│   │           └── RunButton (if commands detected)
│   │               └── onClick → onRunCommand()
│   │
│   └── Right Pane: TerminalPanel (ref)
│       ├── xterm Terminal
│       └── WebSocket Connection
```

## Data Flow

```
┌──────────────────────────────────────────────────────────────┐
│                        ChatPage                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ terminalRef = useRef<TerminalPanelRef>()               │  │
│  │                                                        │  │
│  │ handleRunCommand = (cmd) => {                         │  │
│  │   terminalRef.current.sendCommand(cmd)                │  │
│  │ }                                                      │  │
│  │                                                        │  │
│  │ handleTerminalOutputComplete = (output) => {          │  │
│  │   const prompt = "Explain: " + output                 │  │
│  │   handleSendMessage(prompt)                           │  │
│  │ }                                                      │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─────────────────────┐    ┌──────────────────────────┐   │
│  │   ChatUI            │    │   TerminalPanel         │   │
│  │   ↓                 │    │   ↓                     │   │
│  │   ChatMessages      │    │   xterm.js              │   │
│  │   ↓                 │    │   WebSocket             │   │
│  │   Message           │    │                         │   │
│  │   ↓                 │    │   sendCommand() ←──┐    │   │
│  │   extractCommands() │    │   onCommandFinished ──┐ │   │
│  │   ↓                 │    └──────────────────────│─┘   │
│  │   RunButton         │                           │     │
│  │   ↓                 │                           ↓     │
│  │   onRun(cmd) ───────┼──→ handleRunCommand()         │
│  └─────────────────────┘                                 │
│                            ↑                              │
│                            └─ handleTerminalOutputComplete
└──────────────────────────────────────────────────────────┘
```

## Sequence Diagram

```
User          Message       RunButton      ChatPage       TerminalPanel    WebSocket    Backend
 │               │              │              │                │              │            │
 │ Views msg     │              │              │                │              │            │
 │ with command  │              │              │                │              │            │
 │──────────────>│              │              │                │              │            │
 │               │              │              │                │              │            │
 │               │ Detect cmd   │              │                │              │            │
 │               │─────────────>│              │                │              │            │
 │               │              │              │                │              │            │
 │               │ Render btn   │              │                │              │            │
 │               │<─────────────│              │                │              │            │
 │               │              │              │                │              │            │
 │ Click Run     │              │              │                │              │            │
 │──────────────────────────────>│             │                │              │            │
 │               │              │              │                │              │            │
 │               │              │ onRun(cmd)   │                │              │            │
 │               │              │─────────────>│                │              │            │
 │               │              │              │                │              │            │
 │               │              │              │ sendCommand()  │              │            │
 │               │              │              │───────────────>│              │            │
 │               │              │              │                │              │            │
 │               │              │              │                │ Send msg     │            │
 │               │              │              │                │─────────────>│            │
 │               │              │              │                │              │            │
 │               │              │              │                │              │ Execute    │
 │               │              │              │                │              │───────────>│
 │               │              │              │                │              │            │
 │               │              │              │                │              │ Output     │
 │               │              │              │                │<─────────────┼────────────│
 │               │              │              │                │              │            │
 │               │              │              │  Write output  │              │            │
 │               │              │              │<───────────────│              │            │
 │               │              │              │                │              │            │
 │               │              │              │ [500ms idle]   │              │            │
 │               │              │              │                │              │            │
 │               │              │              │ onCmdFinished  │              │            │
 │               │              │              │<───────────────│              │            │
 │               │              │              │                │              │            │
 │               │              handleSendMsg("Explain...")     │              │            │
 │               │              │              │                │              │            │
 │               │<─────────────────────────────               │              │            │
 │               │              │              │                │              │            │
 │ See AI        │              │              │                │              │            │
 │ explanation   │              │              │                │              │            │
 │<──────────────│              │              │                │              │            │
```

## State Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Initial State                            │
│  • Chat loaded                                              │
│  • Terminal connected                                       │
│  • WebSocket established                                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              AI Sends Message with Command                  │
│  • Message role: "assistant"                                │
│  • Content contains: ```bash ... ```                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                extractCommands() Called                     │
│  • Regex match for code blocks                              │
│  • Extract command text                                     │
│  • Return: ["sudo apt update", "sudo apt install nginx"]    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  RunButton Rendered                         │
│  • One button per command                                   │
│  • Display: "▶️ Run"                                        │
│  • State: Ready                                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 User Clicks RunButton                       │
│  • Call: onRun(command)                                     │
│  • Propagate: Message → ChatMessages → ChatUI → ChatPage    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              handleRunCommand() Executes                    │
│  • Get terminal ref                                         │
│  • Call: terminalRef.current.sendCommand(cmd)               │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              TerminalPanel.sendCommand()                    │
│  • Format: JSON.stringify({ type: "input", data: cmd })     │
│  • Send via WebSocket                                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend Receives                           │
│  • Parse WebSocket message                                  │
│  • Write to child_process stdin                             │
│  • Execute in PowerShell/Bash                               │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                Output Streams Back                          │
│  • stdout → WebSocket → Terminal                            │
│  • Display in xterm.js                                      │
│  • Accumulate in lastOutput state                           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│               Output Accumulation                           │
│  • State: lastOutput += data                                │
│  • Timer: Reset 500ms timeout                               │
│  • Wait for command to finish                               │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│            500ms Idle - Command Complete                    │
│  • Clean ANSI codes                                         │
│  • Filter empty lines                                       │
│  • Call: onCommandFinished(cleanOutput)                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│        handleTerminalOutputComplete() Called                │
│  • Create explanation prompt                                │
│  • Call: handleSendMessage(prompt)                          │
│  • Add as new user message                                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              AI Processes & Responds                        │
│  • Analyze terminal output                                  │
│  • Generate explanation                                     │
│  • Add as assistant message                                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 User Sees Explanation                       │
│  • New message in chat                                      │
│  • Explains success/failure                                 │
│  • Suggests next steps                                      │
└─────────────────────────────────────────────────────────────┘
```

## WebSocket Message Format

### Frontend → Backend
```json
{
  "type": "input",
  "data": "ls -la\n"
}
```

### Backend → Frontend
```json
{
  "type": "output",
  "data": "total 48\ndrwxr-xr-x 12 user user 4096 Nov 19 10:30 .\n..."
}
```

## Command Detection Examples

### Bash Code Block
```markdown
```bash
sudo apt update
sudo apt install nginx
```
```
**Detected:** `["sudo apt update", "sudo apt install nginx"]`

### PowerShell Code Block
```markdown
```powershell
Get-Process | Where-Object {$_.CPU -gt 100}
```
```
**Detected:** `["Get-Process | Where-Object {$_.CPU -gt 100}"]`

### Inline Command
```markdown
Run this command: `npm install`
```
**Detected:** `["npm install"]`

## Error Handling

```
User clicks Run
    ↓
handleRunCommand
    ↓
Check terminalRef exists? ─── No ──> Log error, return
    │ Yes
    ↓
Check WebSocket open? ───────── No ──> Show "Disconnected" error
    │ Yes
    ↓
Send command
    ↓
Wait for output
    ↓
Command fails? ────────────────── Yes ─> Show error output
    │ No                                  AI explains error
    ↓
Show success output
AI explains success
```

## Performance Optimizations

1. **Memoization:** `extractCommands` only runs when message content changes
2. **Debouncing:** 500ms wait before triggering AI explanation
3. **WebSocket:** Single connection, no HTTP polling
4. **Selective Rendering:** RunButton only for assistant messages
5. **Output Limiting:** Only send first 1000 chars to AI for explanation

---

**Diagram Version:** 1.0  
**Last Updated:** November 2025
