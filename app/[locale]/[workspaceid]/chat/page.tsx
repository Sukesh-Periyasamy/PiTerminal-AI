"use client"

import { ChatHelp } from "@/components/chat/chat-help"
import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { ChatInput } from "@/components/chat/chat-input"
import { ChatSettings } from "@/components/chat/chat-settings"
import { ChatUI } from "@/components/chat/chat-ui"
import { QuickSettings } from "@/components/chat/quick-settings"
import { Brand } from "@/components/ui/brand"
import { ChatbotUIContext } from "@/context/context"
import useHotkey from "@/lib/hooks/use-hotkey"
import { useTheme } from "next-themes"
import { useContext, useRef, useCallback } from "react"
import DualPaneLayout from "@/layouts/DualPaneLayout"
import TerminalPanel, { TerminalPanelRef } from "@/app/terminal/TerminalPanel"

export default function ChatPage() {
  useHotkey("o", () => handleNewChat())
  useHotkey("l", () => {
    handleFocusChatInput()
  })

  const {
    chatMessages,
    selectedChat,
    profile,
    chatSettings,
    setChatMessages
  } = useContext(ChatbotUIContext)

  const { handleNewChat, handleFocusChatInput, handleSendMessage } =
    useChatHandler()

  const { theme } = useTheme()

  const terminalRef = useRef<TerminalPanelRef>(null)

  const handleRunCommand = (command: string) => {
    if (terminalRef.current) {
      terminalRef.current.sendCommand(command)
    }
  }

  const handleTerminalOutputComplete = useCallback(
    async (output: string) => {
      // Only explain if we have a chat and the output is meaningful
      if (!selectedChat || !profile || output.length < 10) return

      // Create a prompt asking AI to explain the terminal output
      const explanationPrompt = `I just ran a command in the terminal. Please briefly explain what happened:

\`\`\`
${output.substring(0, 1000)}
\`\`\`

Keep it concise - just the key points about success/failure and what it means.`

      // Send the explanation request to the AI
      try {
        await handleSendMessage(explanationPrompt, chatMessages, false)
      } catch (error) {
        console.error("Failed to get AI explanation:", error)
      }
    },
    [selectedChat, profile, chatMessages, handleSendMessage]
  )

  const chatContent = (
    <>
      {chatMessages.length === 0 ? (
        <div className="relative flex h-full flex-col items-center justify-center">
          <div className="top-50% left-50% -translate-x-50% -translate-y-50% absolute mb-20">
            <Brand theme={theme === "dark" ? "dark" : "light"} />
          </div>

          <div className="absolute left-2 top-2">
            <QuickSettings />
          </div>

          <div className="absolute right-2 top-2">
            <ChatSettings />
          </div>

          <div className="flex grow flex-col items-center justify-center" />

          <div className="w-full min-w-[300px] items-end px-2 pb-3 pt-0 sm:w-[600px] sm:pb-8 sm:pt-5 md:w-[700px] lg:w-[700px] xl:w-[800px]">
            <ChatInput />
          </div>

          <div className="absolute bottom-2 right-2 hidden md:block lg:bottom-4 lg:right-4">
            <ChatHelp />
          </div>
        </div>
      ) : (
        <ChatUI onRunCommand={handleRunCommand} />
      )}
    </>
  )

  return (
    <DualPaneLayout
      leftPane={chatContent}
      rightPane={
        <TerminalPanel
          ref={terminalRef}
          onCommandFinished={handleTerminalOutputComplete}
        />
      }
    />
  )
}
