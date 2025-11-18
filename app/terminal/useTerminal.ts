"use client"

import { useState, useEffect, useCallback } from "react"

export function useTerminal() {
  const [output, setOutput] = useState<string[]>([
    "Terminal initialized...",
    "Type 'help' for available commands."
  ])
  const [isConnected, setIsConnected] = useState(false)
  const [socket, setSocket] = useState<WebSocket | null>(null)

  useEffect(() => {
    // Connect to WebSocket server
    const ws = new WebSocket("ws://localhost:3001")

    ws.onopen = () => {
      setIsConnected(true)
      setOutput(prev => [...prev, "Connected to terminal server."])
    }

    ws.onmessage = event => {
      const data = JSON.parse(event.data)
      if (data.type === "output") {
        setOutput(prev => [...prev, data.data])
      }
    }

    ws.onerror = error => {
      setOutput(prev => [...prev, `Error: ${error}`])
    }

    ws.onclose = () => {
      setIsConnected(false)
      setOutput(prev => [...prev, "Disconnected from terminal server."])
    }

    setSocket(ws)

    return () => {
      ws.close()
    }
  }, [])

  const sendCommand = useCallback(
    (command: string) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        setOutput(prev => [...prev, `$ ${command}`])
        socket.send(JSON.stringify({ type: "command", data: command }))
      }
    },
    [socket]
  )

  return {
    output,
    isConnected,
    sendCommand
  }
}
