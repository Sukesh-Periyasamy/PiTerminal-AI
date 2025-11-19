import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { ChatSettings } from "@/types"
import { OpenAIStream, StreamingTextResponse } from "ai"
import { ServerRuntime } from "next"
import OpenAI from "openai"
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs"

export const runtime: ServerRuntime = "edge"

export async function POST(request: Request) {
  const json = await request.json()
  const { chatSettings, messages } = json as {
    chatSettings: ChatSettings
    messages: any[]
  }

  try {
    const profile = await getServerProfile()

    checkApiKey(profile.openai_api_key, "OpenAI")

    const openai = new OpenAI({
      apiKey: profile.openai_api_key || "",
      organization: profile.openai_organization_id
    })

    // Pi Terminal AI System Prompt
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
  "status": "pending"
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

Your mission: guide the user to the correct output through terminal commands.`

    // Inject system prompt as first message if not already present
    const enhancedMessages = [...messages]
    if (
      enhancedMessages.length === 0 ||
      enhancedMessages[0].role !== "system"
    ) {
      enhancedMessages.unshift({
        role: "system",
        content: PI_TERMINAL_AI_SYSTEM_PROMPT
      })
    }

    const response = await openai.chat.completions.create({
      model: chatSettings.model as ChatCompletionCreateParamsBase["model"],
      messages: enhancedMessages as ChatCompletionCreateParamsBase["messages"],
      temperature: chatSettings.temperature,
      max_tokens:
        chatSettings.model === "gpt-4-vision-preview" ||
        chatSettings.model === "gpt-4o"
          ? 4096
          : null, // TODO: Fix
      stream: true
    })

    const stream = OpenAIStream(response)

    return new StreamingTextResponse(stream)
  } catch (error: any) {
    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500

    if (errorMessage.toLowerCase().includes("api key not found")) {
      errorMessage =
        "OpenAI API Key not found. Please set it in your profile settings."
    } else if (errorMessage.toLowerCase().includes("incorrect api key")) {
      errorMessage =
        "OpenAI API Key is incorrect. Please fix it in your profile settings."
    }

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
