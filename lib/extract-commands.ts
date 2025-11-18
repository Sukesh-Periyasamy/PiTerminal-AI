/**
 * Extract runnable commands from markdown content
 * Detects bash/shell code blocks and single-line commands
 */
export const extractCommands = (content: string): string[] => {
  const commands: string[] = []

  // Extract bash/shell code blocks
  const codeBlockRegex = /```(?:bash|sh|shell|zsh|powershell|ps1)\n([\s\S]*?)```/g
  let match

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const codeContent = match[1].trim()
    if (codeContent) {
      // Split multi-line commands but keep them together if they're part of same command
      const lines = codeContent
        .split("\n")
        .map(line => line.trim())
        .filter(line => line && !line.startsWith("#"))

      commands.push(...lines)
    }
  }

  // Extract single-line commands after phrases like "Run this command:"
  const singleLineRegex =
    /(?:run this command|execute|run|type):?\s*\n?\s*`([^`]+)`/gi

  while ((match = singleLineRegex.exec(content)) !== null) {
    const command = match[1].trim()
    if (command && !commands.includes(command)) {
      commands.push(command)
    }
  }

  return commands
}
