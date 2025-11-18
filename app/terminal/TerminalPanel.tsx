"use client"

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from "react"
import { Terminal } from "xterm"
import { FitAddon } from "xterm-addon-fit"
import "xterm/css/xterm.css"

export interface TerminalPanelRef {
  sendCommand: (command: string) => void
}

interface TerminalPanelProps {
  onCommandFinished?: (output: string) => void
}

const TerminalPanel = forwardRef<TerminalPanelRef, TerminalPanelProps>(
  ({ onCommandFinished }, ref) => {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<Terminal | null>(null)
  const socketRef = useRef<WebSocket | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastOutput, setLastOutput] = useState("")
  const outputTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (!terminalRef.current || isInitialized) return

    // Initialize xterm
    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      rows: 24,
      cols: 80,
      theme: {
        background: "#000000",
        foreground: "#ffffff",
        cursor: "#ffffff",
        black: "#000000",
        red: "#cd0000",
        green: "#00cd00",
        yellow: "#cdcd00",
        blue: "#0000ee",
        magenta: "#cd00cd",
        cyan: "#00cdcd",
        white: "#e5e5e5",
        brightBlack: "#7f7f7f",
        brightRed: "#ff0000",
        brightGreen: "#00ff00",
        brightYellow: "#ffff00",
        brightBlue: "#5c5cff",
        brightMagenta: "#ff00ff",
        brightCyan: "#00ffff",
        brightWhite: "#ffffff"
      }
    })

    // Initialize fit addon
    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)

    // Open terminal in container
    term.open(terminalRef.current)
    
    xtermRef.current = term
    fitAddonRef.current = fitAddon
    
    // Wait for DOM to be ready, then fit
    const fitTimer = setTimeout(() => {
      try {
        if (fitAddon && term && terminalRef.current) {
          fitAddon.fit()
        }
      } catch (error) {
        console.error("Error fitting terminal:", error)
      }
    }, 100)

    setIsInitialized(true)

    // Connect to WebSocket server
    const socket = new WebSocket("ws://localhost:3001")
    socketRef.current = socket

    socket.onopen = () => {
      setIsConnected(true)
      term.writeln("Connected to terminal server...")
      term.writeln("Type 'help' for available commands.\r\n")
    }

    socket.onmessage = event => {
      const data = JSON.parse(event.data)
      if (data.type === "output") {
        term.write(data.data)
        // Accumulate output for auto-explanation
        setLastOutput(prev => prev + data.data)
      } else if (data.type === "error") {
        term.write(`\r\n\x1b[31mError: ${data.data}\x1b[0m\r\n`)
      }
    }

    socket.onerror = error => {
      term.writeln(`\r\nWebSocket error: ${error}`)
    }

    socket.onclose = () => {
      setIsConnected(false)
      term.writeln("\r\nDisconnected from terminal server.")
    }

    // Handle user input
    term.onData(data => {
      if (socket.readyState === WebSocket.OPEN) {
        // Send raw input to backend
        socket.send(JSON.stringify({ type: "input", data: data }))
      }
    })

    // Handle window resize
    const handleResize = () => {
      if (fitAddon && term) {
        try {
          fitAddon.fit()
        } catch (error) {
          console.error("Error resizing terminal:", error)
        }
      }
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (outputTimeoutRef.current) {
        clearTimeout(outputTimeoutRef.current)
      }
      if (fitTimer) {
        clearTimeout(fitTimer)
      }
      socket.close()
      term.dispose()
    }
  }, [])

  // Detect command finished after 500ms of no output
  useEffect(() => {
    if (!lastOutput || !onCommandFinished) return

    if (outputTimeoutRef.current) {
      clearTimeout(outputTimeoutRef.current)
    }

    outputTimeoutRef.current = setTimeout(() => {
      // Clean ANSI codes and filter out empty/prompt lines
      const cleanOutput = lastOutput
        .replace(/\x1b\[[0-9;]*m/g, "") // Remove ANSI codes
        .split("\n")
        .filter(line => line.trim() && !line.includes("PS ")) // Filter empty and prompt lines
        .join("\n")
        .trim()

      if (cleanOutput) {
        onCommandFinished(cleanOutput)
      }
      setLastOutput("")
    }, 500)
  }, [lastOutput, onCommandFinished])

  // Expose sendCommand method via ref
  useImperativeHandle(ref, () => ({
    sendCommand: (command: string) => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: "input", data: command + "\n" }))
      }
    }
  }))

  return (
    <div className="flex h-full flex-col bg-black">
      <div className="border-b border-gray-700 px-4 py-2 bg-gray-900">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Terminal</h2>
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
            />
            <span className="text-xs text-gray-400">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>
      </div>

      <div ref={terminalRef} className="flex-1 p-2 min-h-0" />
    </div>
  )
})

TerminalPanel.displayName = "TerminalPanel"

export default TerminalPanel
