import { ChatbotUIContext } from "@/context/context"
import { Tables } from "@/supabase/types"
import { createMessage } from "@/db/messages"
import { v4 as uuidv4 } from "uuid"

/**
 * Send terminal output to AI for explanation
 * Creates a new assistant message in the chat
 */
export const explainTerminalOutput = async (
  output: string,
  context: {
    selectedChat: Tables<"chats"> | null
    profile: Tables<"profiles"> | null
    chatSettings: any
    setChatMessages: any
    chatMessages: any[]
  }
) => {
  const { selectedChat, profile, chatSettings, setChatMessages, chatMessages } =
    context

  if (!selectedChat || !profile) {
    console.error("No chat or profile selected")
    return
  }

  // Create a prompt for the AI
  const prompt = `I just ran a command in the terminal and got this output. Please explain what happened in simple, concise terms:

\`\`\`
${output}
\`\`\`

Keep your explanation brief and focus on:
1. Whether the command succeeded or failed
2. What the output means
3. Any important warnings or errors
4. Next steps if applicable`

  // Create a user message for the terminal output
  const userMessage = await createMessage({
    user_id: profile.user_id,
    chat_id: selectedChat.id,
    content: `[Terminal Output]\n\`\`\`\n${output}\n\`\`\``,
    role: "user",
    model: chatSettings?.model || "gpt-4",
    sequence_number: chatMessages.length,
    image_paths: []
  })

  // Add to chat messages
  setChatMessages((prev: any[]) => [
    ...prev,
    {
      message: userMessage,
      fileItems: []
    }
  ])

  // Create placeholder for assistant response
  const assistantMessageId = uuidv4()
  const tempAssistantMessage = {
    message: {
      id: assistantMessageId,
      chat_id: selectedChat.id,
      content: "",
      role: "assistant",
      model: chatSettings?.model || "gpt-4",
      sequence_number: chatMessages.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: profile.user_id,
      assistant_id: null,
      image_paths: []
    },
    fileItems: []
  }

  setChatMessages((prev: any[]) => [...prev, tempAssistantMessage])

  // Call the appropriate AI API based on the model
  // This is a simplified version - you'd need to call the actual API route
  // For now, return the structure so the chat handler can process it
  return { userMessage, assistantMessageId, prompt }
}
