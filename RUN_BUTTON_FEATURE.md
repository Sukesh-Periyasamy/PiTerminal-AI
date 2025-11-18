# 🚀 Pi Terminal AI - Run Button & Terminal Integration

## Overview

**Pi Terminal AI** adds interactive **Run Buttons** to chat messages that contain code blocks or commands. When clicked, these buttons execute commands directly in the integrated terminal, and the AI automatically explains the output.

This feature is built on top of Chatbot UI by McKayWrigley, preserving all original functionality.

## ✨ Features

### 1. **Automatic Command Detection**
The system detects runnable commands in assistant messages:
- Bash/shell code blocks (```bash, ```sh, ```shell, ```zsh)
- PowerShell code blocks (```powershell, ```ps1)
- Single-line commands after phrases like "Run this command:"

### 2. **Interactive Run Buttons**
- Small, pill-shaped buttons appear below messages with commands
- One button per detected command
- Click to execute in the terminal instantly

### 3. **Terminal Execution**
- Commands are sent to the terminal via WebSocket
- Output is streamed in real-time to the terminal panel
- Full support for interactive commands

### 4. **Automatic AI Explanation** ⚡
- After a command finishes (500ms of no output)
- Terminal output is automatically sent to the AI
- AI explains the result in simple terms
- Explanation appears as a new chat message

## 🎯 Usage

### For Users

1. **Ask the AI for help:**
   ```
   User: "How do I install nginx?"
   ```

2. **AI responds with commands:**
   ```
   Assistant: "You can install nginx with:
   
   ```bash
   sudo apt update
   sudo apt install nginx -y
   ```
   
   [Run Button appears below]
   ```

3. **Click the Run Button**
   - Command executes in terminal
   - Output appears in real-time

4. **AI Automatically Explains**
   - After command completes
   - AI explains what happened
   - No need to ask "what does this mean?"

### Example Flow

```
User: "Install Node.js"

AI: "Here's how to install Node.js:
```bash
sudo apt install nodejs npm
```

[Run Button]
```

*[User clicks Run Button]*

Terminal: 
```
Reading package lists... Done
Building dependency tree... Done
nodejs is already the newest version (18.17.0-1)
npm is already the newest version (9.8.1-1)
0 upgraded, 0 newly installed, 0 to remove
```

AI: "Node.js installation succeeded! Both nodejs (v18.17.0) and npm (v9.8.1) are already installed and up to date. You're ready to start developing."
```

## 🏗️ Architecture

### Components Created

1. **`RunButton` Component** (`components/messages/run-button.tsx`)
   - Reusable button for executing commands
   - Props: `command`, `onRun`
   - Styled with Tailwind (pill shape, play icon)

2. **`extractCommands` Utility** (`lib/extract-commands.ts`)
   - Parses markdown content
   - Detects code blocks and inline commands
   - Returns array of runnable commands

3. **Enhanced `TerminalPanel`** (`app/terminal/TerminalPanel.tsx`)
   - Exposes `sendCommand` method via ref
   - Tracks terminal output
   - Triggers `onCommandFinished` callback after 500ms idle
   - Cleans ANSI codes from output

4. **Updated `Message` Component**
   - Imports `extractCommands` and `RunButton`
   - Detects commands in assistant messages
   - Renders Run Buttons below content
   - Passes `onRunCommand` to execute

### Data Flow

```
┌─────────────────┐
│  User asks AI   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ AI responds     │
│ with commands   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ extractCommands │ ◄── Detects bash/shell code blocks
│ finds commands  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ RunButton shown │ ◄── User clicks
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ onRunCommand()  │ ◄── ChatPage handler
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ TerminalPanel   │ ◄── sendCommand(cmd)
│ via ref         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ WebSocket       │ ◄── Send to backend
│ to backend      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ child_process   │ ◄── Execute in shell
│ executes cmd    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Output streams  │ ◄── Real-time streaming
│ to terminal     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ After 500ms     │ ◄── No new output
│ idle detected   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ onCommandFinish │ ◄── Callback triggered
│ called          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ handleSendMsg() │ ◄── Send output to AI
│ with prompt     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ AI explains     │ ◄── Automatic explanation
│ output          │
└─────────────────┘
```

## 🔧 Technical Implementation

### Key Files Modified

1. **`app/[locale]/[workspaceid]/chat/page.tsx`**
   - Added `terminalRef` for accessing terminal
   - Added `handleRunCommand` to send commands
   - Added `handleTerminalOutputComplete` for AI explanation
   - Wired everything together

2. **`components/chat/chat-ui.tsx`**
   - Added `onRunCommand` prop
   - Passed to `ChatMessages`

3. **`components/chat/chat-messages.tsx`**
   - Added `onRunCommand` prop
   - Passed to each `Message`

4. **`components/messages/message.tsx`**
   - Added `onRunCommand` prop
   - Extract commands from assistant messages
   - Render `RunButton` components

### Command Detection Regex

```typescript
// Code blocks
/```(?:bash|sh|shell|zsh|powershell|ps1)\n([\s\S]*?)```/g

// Inline commands
/(?:run this command|execute|run|type):?\s*\n?\s*`([^`]+)`/gi
```

### Terminal Output Processing

```typescript
// Clean ANSI codes
output.replace(/\x1b\[[0-9;]*m/g, "")

// Filter empty lines and prompts
.split("\n")
.filter(line => line.trim() && !line.includes("PS "))
.join("\n")
```

## 🎨 Styling

### RunButton Component
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

- Small size (`text-xs`)
- Pill shape (`rounded-full`)
- Play icon from `@tabler/icons-react`
- Outline variant (subtle appearance)
- 2px margin top to separate from message

## 🔐 Security Considerations

### Current Implementation
- Commands execute with the same permissions as the backend server
- No sandboxing or command filtering
- Direct execution in PowerShell/Bash

### Recommendations for Production

1. **Command Whitelist**
   ```typescript
   const SAFE_COMMANDS = ['ls', 'pwd', 'echo', 'cat']
   const isCommandSafe = (cmd) => 
     SAFE_COMMANDS.some(safe => cmd.startsWith(safe))
   ```

2. **User Confirmation**
   ```typescript
   const handleRunCommand = (command) => {
     if (confirm(`Run: ${command}?`)) {
       terminalRef.current.sendCommand(command)
     }
   }
   ```

3. **Sandboxing**
   - Use Docker containers
   - Run in restricted user account
   - Limit resource usage

4. **Command Analysis**
   - Check for dangerous patterns (rm -rf, sudo, etc.)
   - Warn user before execution
   - Log all executions

## 🐛 Troubleshooting

### Run Button Not Appearing
- Check that message is from assistant (role === "assistant")
- Verify code block uses supported language (bash, sh, shell, zsh, powershell, ps1)
- Check browser console for errors in `extractCommands`

### Commands Not Executing
- Verify WebSocket connection (green indicator in terminal header)
- Check backend server is running on port 3001
- Look for errors in backend logs

### No AI Explanation
- Ensure `onCommandFinished` callback is passed to TerminalPanel
- Check that output length > 10 characters
- Verify chat session exists (selectedChat)
- Check AI API key configuration

### Terminal Output Garbled
- ANSI codes should be cleaned automatically
- Check `handleTerminalOutputComplete` filter logic
- Verify 500ms timeout is sufficient for your commands

## 🚀 Future Enhancements

### Planned Features

1. **Command History**
   - Track executed commands
   - Quick re-run previous commands
   - Show success/failure status

2. **Command Validation**
   - Syntax checking before execution
   - Suggest corrections for typos
   - Preview what command will do

3. **Interactive Prompts**
   - Handle commands that require user input
   - Show confirmation dialogs
   - Support for sudo password entry

4. **Output Formatting**
   - Syntax highlighting in explanations
   - Diff views for file changes
   - Structured output parsing

5. **Multi-Step Workflows**
   - Chain commands together
   - Conditional execution
   - Rollback on failure

6. **Context Awareness**
   - Remember working directory
   - Track environment state
   - Suggest related commands

## 📝 Notes

- Run buttons only appear for **assistant messages** (not user messages)
- Multiple commands in one message get separate buttons
- Terminal output auto-explanation can be disabled by not passing `onCommandFinished`
- Commands execute in the current working directory of the backend process
- All original chat UI styling and icons are preserved

## 🤝 Contributing

When modifying this feature:

1. Keep UI changes minimal
2. Don't remove existing styling
3. Test with various command types
4. Verify AI explanations are accurate
5. Check WebSocket connection handling

## 📚 Related Files

- `components/messages/run-button.tsx` - Button component
- `lib/extract-commands.ts` - Command detection logic
- `app/terminal/TerminalPanel.tsx` - Terminal with command execution
- `app/[locale]/[workspaceid]/chat/page.tsx` - Integration point
- `backend/server.js` - WebSocket server
- `backend/terminal.js` - Shell process management

---

**Created:** November 2025  
**Status:** ✅ Fully Implemented  
**Version:** 1.0.0
