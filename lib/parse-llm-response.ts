interface CommandData {
  title: string
  explanation: string
  command: string
  follow_up: string
  status: "pending" | "error" | "success" | "suggestion"
}

interface ParsedResponse {
  isCommand: boolean
  commandData?: CommandData
  plainText: string
}

export function parseLLMResponse(content: string): ParsedResponse {
  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(content.trim())

    // Validate required fields
    if (
      typeof parsed.title === "string" &&
      typeof parsed.explanation === "string" &&
      typeof parsed.command === "string" &&
      typeof parsed.follow_up === "string" &&
      ["pending", "error", "success", "suggestion"].includes(parsed.status)
    ) {
      return {
        isCommand: true,
        commandData: parsed as CommandData,
        plainText: content
      }
    }
  } catch (error) {
    // Not valid JSON or missing required fields
  }

  // Check for JSON-like structure in text
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try {
      const extracted = JSON.parse(jsonMatch[0])
      if (
        typeof extracted.title === "string" &&
        typeof extracted.explanation === "string" &&
        typeof extracted.command === "string" &&
        typeof extracted.follow_up === "string" &&
        ["pending", "error", "success", "suggestion"].includes(extracted.status)
      ) {
        return {
          isCommand: true,
          commandData: extracted as CommandData,
          plainText: content
        }
      }
    } catch (error) {
      // Continue to plain text fallback
    }
  }

  return {
    isCommand: false,
    plainText: content
  }
}

export function isValidCommandJSON(obj: any): obj is CommandData {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.title === "string" &&
    typeof obj.explanation === "string" &&
    typeof obj.command === "string" &&
    typeof obj.follow_up === "string" &&
    ["pending", "error", "success", "suggestion"].includes(obj.status)
  )
}
