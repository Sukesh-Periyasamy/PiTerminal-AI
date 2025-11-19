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
import dynamic from "next/dynamic"
import { TerminalPanelRef } from "@/app/terminal/TerminalPanel"

// Dynamic import to prevent SSR issues with xterm.js
const TerminalPanel = dynamic(() => import("@/app/terminal/TerminalPanel"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      Loading terminal...
    </div>
  )
})

export default function ChatPage() {
  useHotkey("o", () => handleNewChat())
  useHotkey("l", () => {
    handleFocusChatInput()
  })

  const { chatMessages, selectedChat, profile, chatSettings, setChatMessages } =
    useContext(ChatbotUIContext)

  const { handleNewChat, handleFocusChatInput, handleSendMessage } =
    useChatHandler()

  const { theme } = useTheme()

  const terminalRef = useRef<TerminalPanelRef>(null)

  // Track the last command and request for analysis
  const lastCommandRef = useRef<{
    originalRequest: string
    executedCommand: string
  } | null>(null)

  const handleRunCommand = (command: string) => {
    if (terminalRef.current) {
      // Store command for later analysis
      const lastUserMessage = chatMessages
        .filter(msg => msg.message.role === "user")
        .pop()

      lastCommandRef.current = {
        originalRequest: lastUserMessage?.message.content || "",
        executedCommand: command
      }

      terminalRef.current.sendCommand(command)
    }
  }

  const handleTerminalOutputComplete = useCallback(
    async (output: string) => {
      // Only analyze if we have the necessary context
      if (!selectedChat || !profile || !lastCommandRef.current || !chatSettings)
        return

      const { originalRequest, executedCommand } = lastCommandRef.current

      try {
        // Call the analysis API endpoint
        const response = await fetch("/api/chat/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            originalRequest,
            executedCommand,
            terminalOutput: output,
            chatSettings
          })
        })

        if (!response.ok) {
          throw new Error("Failed to analyze terminal output")
        }

        // Stream the response like a normal chat message
        const reader = response.body?.getReader()
        if (!reader) return

        let analysisResult = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = new TextDecoder().decode(value)
          analysisResult += chunk
        }

        // Add the analysis result as an assistant message
        const newMessage = {
          message: {
            chat_id: selectedChat.id,
            assistant_id: null,
            content: analysisResult,
            created_at: new Date().toISOString(),
            id: `analysis_${Date.now()}`,
            image_paths: [],
            model: chatSettings.model,
            role: "assistant" as const,
            sequence_number: chatMessages.length,
            updated_at: new Date().toISOString(),
            user_id: profile.user_id
          },
          fileItems: []
        }

        setChatMessages(prev => [...prev, newMessage])
      } catch (error) {
        console.error("Failed to analyze terminal output:", error)

        // Add a simple error message
        const errorMessage = {
          message: {
            chat_id: selectedChat.id,
            assistant_id: null,
            content: JSON.stringify({
              title: "Analysis Failed",
              explanation: "Could not analyze the terminal output",
              command: "",
              follow_up: "Please try running another command",
              status: "error"
            }),
            created_at: new Date().toISOString(),
            id: `error_${Date.now()}`,
            image_paths: [],
            model: chatSettings.model,
            role: "assistant" as const,
            sequence_number: chatMessages.length,
            updated_at: new Date().toISOString(),
            user_id: profile.user_id
          },
          fileItems: []
        }

        setChatMessages(prev => [...prev, errorMessage])
      }
    },
    [selectedChat, profile, chatMessages, chatSettings, setChatMessages]
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
