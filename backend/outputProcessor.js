/**
 * Output processor for analyzing terminal command results
 * and sending them back to the LLM for analysis and next command suggestions
 */

const PI_TERMINAL_AI_SYSTEM_PROMPT = `You are Pi Terminal AI — a Linux-focused AI assistant designed to work with an integrated terminal. You NEVER give general chatbot answers.

Your ONLY job is:
1. Understand the user's natural-language request as a terminal task.
2. Determine the correct Linux command(s).
3. Respond ONLY in the following structured JSON format:

{
  "title": "<short task name>",
  "explanation": "<brief terminal-focused explanation>",
  "command": "<a single safe, minimal command>",
  "follow_up": "<when to run this command>",
  "status": "pending | error | success | suggestion"
}

Rules:
- Always produce exactly ONE main command.
- Format the final response as JSON only.
- The UI will render a Command Card, and a Run button below it.
- The user must explicitly click RUN to execute, so keep commands safe.
- NEVER talk outside of JSON.
- No markdown formatting; JSON only.

COMMAND GENERATION RULES:
- Prefer commands that work on Raspberry Pi OS / Debian-based systems.
- Commands MUST be minimal and safe (no destructive commands).
- If the user asks something unclear → ask a terminal-based clarifying question.
- If the user asks something non-terminal → reinterpret the request as a terminal task.

ERROR HANDLING LOGIC:
After the user clicks Run, the terminal will return output.
You will receive the terminal output separately.
When handling terminal output:

1. If the output shows an error or failure:
   - Explain the error briefly.
   - Suggest EXACT next command to fix it.
   - Your JSON "command" must contain that exact next step.
   - Set status to "error".

2. If the output is unexpected or incomplete:
   - Suggest corrective or diagnostic commands.
   - Set status to "suggestion".

3. If the output is successful and expected:
   - Set the JSON "follow_up" to "Task complete."
   - Set status to "success".
   - Set command to "".

Your mission: guide the user to the correct output through terminal commands.`

/**
 * Analyzes terminal output and generates next command suggestion
 * @param {string} originalRequest - The original user request
 * @param {string} executedCommand - The command that was executed
 * @param {string} terminalOutput - The output from the terminal
 * @returns {Promise<object>} JSON response with next command or completion status
 */
async function analyzeTerminalOutput(originalRequest, executedCommand, terminalOutput) {
  // This is a placeholder - in a real implementation, you would:
  // 1. Send the data to your preferred LLM API (OpenAI, Anthropic, etc.)
  // 2. Include the system prompt and context
  // 3. Return the parsed JSON response

  const analysisPrompt = `
Original user request: "${originalRequest}"
Command executed: "${executedCommand}"
Terminal output:
\`\`\`
${terminalOutput}
\`\`\`

Analyze this output and provide the next step as JSON only.`

  try {
    // Placeholder for LLM API call
    // const response = await callLLMAPI(PI_TERMINAL_AI_SYSTEM_PROMPT, analysisPrompt)
    
    // For now, return a simple success response
    if (terminalOutput.includes("command not found") || terminalOutput.includes("error") || terminalOutput.includes("Error")) {
      return {
        title: "Command Error Detected",
        explanation: "The command encountered an error. Let me suggest a fix.",
        command: "which " + executedCommand.split(" ")[0],
        follow_up: "Click Run to check if the command exists",
        status: "error"
      }
    } else if (terminalOutput.trim().length > 0) {
      return {
        title: "Command Successful", 
        explanation: "Command executed successfully with output.",
        command: "",
        follow_up: "Task complete.",
        status: "success"
      }
    } else {
      return {
        title: "Command Executed",
        explanation: "Command ran but produced no output.",
        command: "",
        follow_up: "Task complete.",
        status: "success"
      }
    }
  } catch (error) {
    console.error("Error analyzing terminal output:", error)
    return {
      title: "Analysis Error",
      explanation: "Could not analyze terminal output.",
      command: "",
      follow_up: "Please try again.",
      status: "error"
    }
  }
}

/**
 * Clean terminal output by removing ANSI codes and extra formatting
 * @param {string} output - Raw terminal output
 * @returns {string} Cleaned output
 */
function cleanTerminalOutput(output) {
  return output
    .replace(/\x1b\[[0-9;]*m/g, '') // Remove ANSI color codes
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\r/g, '\n') // Convert remaining \r to \n
    .trim()
}

module.exports = {
  analyzeTerminalOutput,
  cleanTerminalOutput,
  PI_TERMINAL_AI_SYSTEM_PROMPT
}