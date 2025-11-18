import { useEffect, useRef, useState } from "react"

interface UseTerminalProps {
  onCommandFinished?: (output: string) => void
}

export const useTerminal = ({ onCommandFinished }: UseTerminalProps = {}) => {
  const socketRef = useRef<WebSocket | null>(null)
  const [lastOutput, setLastOutput] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const terminalTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Connect to WebSocket server
    const socket = new WebSocket("ws://localhost:3001")
    socketRef.current = socket

    socket.onopen = () => {
      setIsConnected(true)
    }

    socket.onmessage = event => {
      const data = JSON.parse(event.data)
      if (data.type === "output") {
        setLastOutput(prev => prev + data.data)
      }
    }

    socket.onclose = () => {
      setIsConnected(false)
    }

    return () => {
      if (terminalTimeoutRef.current) {
        clearTimeout(terminalTimeoutRef.current)
      }
      socket.close()
    }
  }, [])

  // Detect command finished after 500ms of no output
  useEffect(() => {
    if (!lastOutput || !onCommandFinished) return

    if (terminalTimeoutRef.current) {
      clearTimeout(terminalTimeoutRef.current)
    }

    terminalTimeoutRef.current = setTimeout(() => {
      onCommandFinished(lastOutput)
      setLastOutput("")
    }, 500)
  }, [lastOutput, onCommandFinished])

  const sendToTerminal = (command: string) => {
    if (
      socketRef.current &&
      socketRef.current.readyState === WebSocket.OPEN
    ) {
      // Send command with newline
      socketRef.current.send(
        JSON.stringify({ type: "input", data: command + "\n" })
      )
    }
  }

  return {
    sendToTerminal,
    isConnected,
    lastOutput
  }
}
