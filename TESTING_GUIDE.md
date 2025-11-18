# Testing Guide - Run Button Feature

## Pre-requisites

- ✅ Frontend and backend dependencies installed
- ✅ Supabase credentials configured
- ✅ Backend server running on port 3001
- ✅ Frontend running on port 3000

## Quick Start

### 1. Start Both Servers

**Option A: Using PowerShell Script (Windows)**
```powershell
.\start.ps1
```

**Option B: Manual Start**
```powershell
# Terminal 1 - Backend
cd backend
node server.js

# Terminal 2 - Frontend  
npm run dev
```

## Test Cases

### ✅ Test 1: Basic Command Execution

**Steps:**
1. Open http://localhost:3000
2. Navigate to your workspace chat
3. Type: "How do I list files in the current directory?"
4. Wait for AI response

**Expected Result:**
```
AI: "You can list files using:

```bash
ls -la
```

[Run Button]
```

5. Click the **Run** button
6. Verify terminal shows file listing
7. Wait 1-2 seconds

**Expected Result:**
- Terminal displays directory contents
- AI automatically sends explanation message
- Explanation appears in chat

**Success Criteria:**
- ✅ Run button appears
- ✅ Command executes
- ✅ Output appears in terminal
- ✅ AI explains output automatically

---

### ✅ Test 2: Multiple Commands

**Steps:**
1. Ask: "How do I install nginx?"
2. Wait for AI response

**Expected Result:**
```
AI: "Here's how to install nginx:

```bash
sudo apt update
sudo apt install nginx -y
```

[Run] [Run]
```

3. Click each Run button separately
4. Verify each command executes in sequence

**Success Criteria:**
- ✅ Multiple run buttons appear
- ✅ Each button works independently
- ✅ Commands execute in order clicked

---

### ✅ Test 3: PowerShell Commands (Windows)

**Steps:**
1. Ask: "How do I check running processes?"
2. Wait for AI response

**Expected Result:**
```
AI: "Use this PowerShell command:

```powershell
Get-Process
```

[Run Button]
```

3. Click Run button
4. Verify PowerShell command executes

**Success Criteria:**
- ✅ PowerShell commands detected
- ✅ Execution works on Windows
- ✅ Output streams correctly

---

### ✅ Test 4: Inline Commands

**Steps:**
1. Ask: "How do I check Node version?"
2. AI might respond with inline command:

```
AI: "Run this command: `node --version`"

[Run Button]
```

**Success Criteria:**
- ✅ Inline command detected
- ✅ Run button appears
- ✅ Command executes

---

### ✅ Test 5: No Run Button for User Messages

**Steps:**
1. User types: "```bash\nls\n```"
2. Send message

**Expected Result:**
- ❌ No Run button appears (user messages shouldn't have run buttons)

**Success Criteria:**
- ✅ Run buttons only on assistant messages

---

### ✅ Test 6: Terminal Disconnected

**Steps:**
1. Stop backend server (Ctrl+C in backend terminal)
2. Try clicking Run button

**Expected Result:**
- Terminal status shows "Disconnected" (red indicator)
- Command doesn't execute

**Success Criteria:**
- ✅ Connection status accurate
- ✅ No crash when disconnected

---

### ✅ Test 7: Complex Multi-line Commands

**Steps:**
1. Ask: "How do I create a Docker container?"
2. AI responds with multi-line command:

```bash
docker run -d \
  --name nginx \
  -p 80:80 \
  nginx:latest
```

**Success Criteria:**
- ✅ Entire multi-line command detected
- ✅ All lines execute together
- ✅ Output displays correctly

---

### ✅ Test 8: Auto-Explanation

**Steps:**
1. Click any Run button
2. Wait for command to complete
3. Don't type anything

**Expected Result:**
- After ~500ms, AI automatically sends message
- Message explains command output
- No user action required

**Success Criteria:**
- ✅ Explanation triggered automatically
- ✅ Explanation is relevant
- ✅ Appears as assistant message

---

### ✅ Test 9: Error Commands

**Steps:**
1. Ask: "How do I remove a non-existent file?"
2. AI suggests: `rm nonexistent.txt`
3. Click Run button

**Expected Result:**
- Command executes
- Error appears in terminal
- AI explains the error

**Success Criteria:**
- ✅ Error output captured
- ✅ AI explains what went wrong
- ✅ No application crash

---

### ✅ Test 10: Rapid Clicks

**Steps:**
1. Get message with multiple commands
2. Click all Run buttons rapidly

**Expected Result:**
- All commands queue and execute
- Terminal shows all outputs
- AI explains each (or combined)

**Success Criteria:**
- ✅ No crashes
- ✅ All commands execute
- ✅ Output remains readable

---

## Visual Checks

### UI Integrity Checklist

After implementing, verify:

- ✅ Chat layout unchanged
- ✅ Message spacing looks good
- ✅ Run button doesn't overlap message
- ✅ Icons (user/assistant) still visible
- ✅ Message actions (copy, edit) still work
- ✅ Sidebar still functional
- ✅ Settings still accessible
- ✅ File display still works
- ✅ Image preview still works

### Terminal Panel Checklist

- ✅ Terminal resizes properly
- ✅ Scrolling works
- ✅ Colors render correctly
- ✅ Input/output not mixed up
- ✅ Connection indicator accurate

## Performance Tests

### Load Test
1. Send 10 commands quickly
2. Verify no lag or freezing
3. Check memory usage stays stable

### Long Output Test
1. Run command with lots of output: `ls -R /`
2. Verify terminal handles large output
3. Check AI explanation still works

### Idle Test
1. Leave app open for 5 minutes
2. Click Run button
3. Verify still works after idle

## Debugging

### Run Button Not Appearing

**Check:**
```typescript
// Open browser console
console.log(extractCommands(message.content))
```

**Expected:** Array of commands
**If empty:** Check message format, code block syntax

### Commands Not Executing

**Check:**
1. WebSocket status (green dot in terminal header)
2. Backend logs: `node server.js`
3. Browser Network tab: WebSocket connection

**Fix:**
- Restart backend: `Ctrl+C`, then `node server.js`
- Check port 3001 not in use

### No AI Explanation

**Check:**
1. `onCommandFinished` callback passed to TerminalPanel
2. Output length > 10 characters
3. Chat session exists

**Debug:**
```typescript
// Add to ChatPage
console.log("Terminal output:", output)
```

### TypeScript Errors

**Run:**
```powershell
npm run build
```

**Expected:** No errors (currently 0 errors)

## Edge Cases

### Empty Code Blocks
```markdown
```bash
```
```
**Expected:** No Run button (no command detected)

### Comments Only
```markdown
```bash
# This is just a comment
```
```
**Expected:** No Run button (comments filtered out)

### Invalid Syntax
```markdown
```bash
sudo apt install nginx && && echo "done"
```
```
**Expected:** Run button appears, command fails, AI explains error

### Very Long Commands
```markdown
```bash
find / -type f -name "*.log" -exec grep -l "error" {} \; | xargs -I {} sh -c 'echo {}; tail -n 20 {}'
```
```
**Expected:** Run button appears, entire command executes

## Success Metrics

After all tests:

- ✅ 10/10 test cases pass
- ✅ 0 TypeScript errors
- ✅ 0 runtime errors
- ✅ UI looks clean
- ✅ Performance is smooth
- ✅ Auto-explanation works reliably

## Report Issues

If tests fail, provide:

1. Test case number
2. Browser console errors
3. Backend terminal output
4. Screenshot of issue
5. Steps to reproduce

## Next Steps After Testing

1. ✅ All tests pass → Ready for production
2. ❌ Some tests fail → Debug and retest
3. Performance issues → Optimize (debouncing, caching)
4. Security concerns → Add command validation

---

**Test Version:** 1.0  
**Last Updated:** November 2025  
**Estimated Testing Time:** 15-20 minutes
