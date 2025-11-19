import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { ChatSettings } from "@/types"
import { OpenAIStream, StreamingTextResponse } from "ai"
import { ServerRuntime } from "next"
import OpenAI from "openai"

export const runtime: ServerRuntime = "edge"

export async function POST(request: Request) {
  const json = await request.json()
  const { originalRequest, executedCommand, terminalOutput, chatSettings } =
    json as {
      originalRequest: string
      executedCommand: string
      terminalOutput: string
      chatSettings: ChatSettings
    }

  try {
    const profile = await getServerProfile()
    checkApiKey(profile.openai_api_key, "OpenAI")

    const openai = new OpenAI({
      apiKey: profile.openai_api_key || "",
      organization: profile.openai_organization_id
    })

    const ANALYSIS_SYSTEM_PROMPT = `You are Pi Terminal AI analyzing terminal command output. Your job is to determine the next step based on the results.

Rules:
1. Respond ONLY in JSON format
2. Analyze if the command succeeded, failed, or needs follow-up
3. Suggest corrective commands for errors
4. Mark successful tasks as complete

JSON Format:
{
  "title": "<short status description>",
  "explanation": "<brief analysis>", 
  "command": "<next command or empty if complete>",
  "follow_up": "<instruction for user>",
  "status": "success | error | suggestion"
}

Analysis Guidelines:
- If output shows errors: status="error", provide fixing command
- If output is successful: status="success", command="", follow_up="Task complete"
- If output needs more info: status="suggestion", provide diagnostic command
- Keep explanations brief and terminal-focused`

    const analysisPrompt = `Original user request: "${originalRequest}"
Command executed: "${executedCommand}"
Terminal output:
\`\`\`
${terminalOutput}
\`\`\`

Analyze this output and provide the next step as JSON only.`

    const messages = [
      { role: "system" as const, content: ANALYSIS_SYSTEM_PROMPT },
      { role: "user" as const, content: analysisPrompt }
    ]

    const response = await openai.chat.completions.create({
      model: chatSettings.model,
      messages: messages,
      temperature: 0.3, // Lower temperature for more consistent JSON
      max_tokens: 500,
      stream: true
    })

    const stream = OpenAIStream(response)
    return new StreamingTextResponse(stream)
  } catch (error: any) {
    console.error("Error in terminal analysis:", error)

    return new Response(
      JSON.stringify({
        title: "Analysis Error",
        explanation: "Could not analyze terminal output",
        command: "",
        follow_up: "Please try again",
        status: "error"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    )
  }
}
