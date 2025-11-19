"use client"

import { useState, useRef, useEffect } from "react"

interface FallbackTerminalProps {
  onCommandFinished?: (output: string) => void
}

export const FallbackTerminal = ({
  onCommandFinished
}: FallbackTerminalProps) => {
  const [output, setOutput] = useState<string[]>([
    "Pi Terminal AI - Fallback Mode",
    "xterm.js failed to load, using basic terminal interface",
    "Type commands below:",
    ""
  ])
  const [currentInput, setCurrentInput] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const outputEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Connect to WebSocket
    const connectWebSocket = () => {
      try {
        const ws = new WebSocket("ws://localhost:3003")
        wsRef.current = ws

        ws.onopen = () => {
          console.log("Fallback Terminal WebSocket connected")
          setIsConnected(true)
          setOutput(prev => [...prev, "✓ Connected to terminal server"])
        }

        ws.onmessage = event => {
          try {
            const data = JSON.parse(event.data)
            if (data.type === "output") {
              const cleanData = data.data
                .replace(/\x1b\[[0-9;]*m/g, "") // Remove ANSI codes
                .replace(/\r\n/g, "\n")
                .replace(/\r/g, "\n")

              setOutput(prev => [...prev, cleanData])

              if (onCommandFinished) {
                onCommandFinished(cleanData)
              }
            }
          } catch (error) {
            console.error("Error parsing WebSocket message:", error)
          }
        }

        ws.onclose = () => {
          console.log("Fallback Terminal WebSocket disconnected")
          setIsConnected(false)
          setOutput(prev => [...prev, "✗ Disconnected from terminal server"])
          // Attempt to reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000)
        }

        ws.onerror = error => {
          console.error("Fallback Terminal WebSocket error:", error)
          setOutput(prev => [...prev, "✗ WebSocket connection error"])
        }
      } catch (error) {
        console.error("Failed to create WebSocket connection:", error)
        setOutput(prev => [...prev, "✗ Failed to connect to terminal server"])
      }
    }

    connectWebSocket()

    return () => {
      wsRef.current?.close()
    }
  }, [onCommandFinished])

  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [output])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentInput.trim()) return

    // Add command to output
    setOutput(prev => [...prev, `$ ${currentInput}`])

    // Send command to WebSocket
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({ type: "input", data: currentInput + "\n" })
      )
    } else {
      setOutput(prev => [...prev, "✗ Not connected to terminal server"])
    }

    setCurrentInput("")
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#0D1117] font-mono text-white">
      <div className="border-b border-gray-700 bg-[#161B22] px-4 py-2">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="size-3 rounded-full bg-red-500"></div>
            <div className="size-3 rounded-full bg-yellow-500"></div>
            <div className="size-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm font-medium text-gray-300">
            Terminal (Fallback Mode)
          </span>
          <span
            className={`rounded px-2 py-1 text-xs ${
              isConnected ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-1">
          {output.map((line, index) => (
            <div key={index} className="whitespace-pre-wrap text-sm">
              {line}
            </div>
          ))}
        </div>
        <div ref={outputEndRef} />
      </div>

      <div className="border-t border-gray-700 p-4">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <span className="text-green-400">$</span>
          <input
            type="text"
            value={currentInput}
            onChange={e => setCurrentInput(e.target.value)}
            className="flex-1 border-none bg-transparent text-white outline-none"
            placeholder="Enter command..."
            disabled={!isConnected}
          />
          <button
            type="submit"
            disabled={!isConnected || !currentInput.trim()}
            className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Run
          </button>
        </form>
      </div>
    </div>
  )
}
