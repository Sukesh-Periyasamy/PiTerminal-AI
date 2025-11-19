"use client"

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from "react"
import { FallbackTerminal } from "./FallbackTerminal"

// Import xterm CSS
import "xterm/css/xterm.css"

export interface TerminalPanelRef {
  sendCommand: (command: string) => void
}

interface TerminalPanelProps {
  onCommandFinished?: (output: string) => void
}

const TerminalPanel = forwardRef<TerminalPanelRef, TerminalPanelProps>(
  ({ onCommandFinished }, ref) => {
    const terminalContainerRef = useRef<HTMLDivElement>(null)
    const xtermRef = useRef<any | null>(null)
    const wsRef = useRef<WebSocket | null>(null)
    const fitAddonRef = useRef<any | null>(null)
    const terminalOutputRef = useRef<string>("")
    const outputTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const initTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const [isInitialized, setIsInitialized] = useState(false)
    const [initError, setInitError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true) // Initialize xterm when component mounts
    useEffect(() => {
      // Set timeout to prevent infinite loading
      initTimeoutRef.current = setTimeout(() => {
        if (!isInitialized) {
          console.error("Terminal initialization timeout")
          setInitError("Terminal initialization timed out")
          setIsLoading(false)
        }
      }, 10000) // 10 second timeout

      const initTerminal = async () => {
        try {
          if (typeof window === "undefined") {
            console.log(
              "Server side rendering - skipping terminal initialization"
            )
            return
          }

          if (!terminalContainerRef.current) {
            console.log("Terminal container not ready, retrying...")
            setTimeout(initTerminal, 100)
            return
          }

          console.log("Starting terminal initialization...")
          setIsLoading(true)

          // Dynamic imports for xterm
          console.log("Importing xterm modules...")
          const [{ Terminal }, { FitAddon }] = await Promise.all([
            import("xterm"),
            import("xterm-addon-fit")
          ])
          console.log("Xterm modules imported successfully")

          // Import CSS dynamically (handled by bundler)
          // CSS is imported automatically with xterm

          const term = new Terminal({
            rows: 24,
            cols: 80,
            theme: {
              background: "#0D1117",
              foreground: "#C9D1D9",
              cursor: "#C9D1D9",
              black: "#484F58",
              red: "#FF7B72",
              green: "#7CE38B",
              yellow: "#FFA657",
              blue: "#79C0FF",
              magenta: "#D2A8FF",
              cyan: "#A5F3FC",
              white: "#F0F6FC",
              brightBlack: "#6E7681",
              brightRed: "#FFA198",
              brightGreen: "#56D364",
              brightYellow: "#FFDF5D",
              brightBlue: "#79C0FF",
              brightMagenta: "#D2A8FF",
              brightCyan: "#56D4DD",
              brightWhite: "#F0F6FC"
            },
            fontFamily: '"Cascadia Code", Consolas, "Courier New", monospace',
            fontSize: 14,
            lineHeight: 1.2,
            letterSpacing: 0
          })

          const fitAddon = new FitAddon()
          term.loadAddon(fitAddon)

          term.open(terminalContainerRef.current)

          // Delay fit to ensure DOM is ready
          setTimeout(() => {
            try {
              fitAddon.fit()
            } catch (error) {
              console.warn("Failed to fit terminal:", error)
            }
          }, 100)

          xtermRef.current = term
          fitAddonRef.current = fitAddon

          // Connect to WebSocket
          const connectWebSocket = () => {
            const ws = new WebSocket("ws://localhost:3003")
            wsRef.current = ws

            ws.onopen = () => {
              console.log("Terminal WebSocket connected")
            }

            ws.onmessage = event => {
              try {
                const data = JSON.parse(event.data)
                if (data.type === "output") {
                  term.write(data.data)

                  // Accumulate output for analysis
                  terminalOutputRef.current += data.data

                  // Reset timeout for command completion detection
                  if (outputTimeoutRef.current) {
                    clearTimeout(outputTimeoutRef.current)
                  }

                  // Detect command completion after 500ms of no output
                  outputTimeoutRef.current = setTimeout(() => {
                    if (
                      onCommandFinished &&
                      terminalOutputRef.current.length > 0
                    ) {
                      // Clean the output (remove ANSI codes, etc.)
                      const cleanOutput = terminalOutputRef.current
                        .replace(/\x1b\[[0-9;]*m/g, "") // Remove ANSI color codes
                        .replace(/\r\n/g, "\n") // Normalize line endings
                        .replace(/\r/g, "\n") // Convert remaining \r to \n
                        .trim()

                      onCommandFinished(cleanOutput)
                      terminalOutputRef.current = "" // Reset for next command
                    }
                  }, 500)
                }
              } catch (error) {
                console.error("Error parsing WebSocket message:", error)
              }
            }

            ws.onclose = () => {
              console.log("Terminal WebSocket disconnected")
              // Attempt to reconnect after 3 seconds
              setTimeout(connectWebSocket, 3000)
            }

            ws.onerror = error => {
              console.error("Terminal WebSocket error:", error)
            }
          }

          connectWebSocket()

          // Handle input
          term.onData((data: string) => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({ type: "input", data }))
            }
          })

          // Handle window resize
          const handleResize = () => {
            try {
              fitAddon.fit()
              if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(
                  JSON.stringify({
                    type: "resize",
                    cols: term.cols,
                    rows: term.rows
                  })
                )
              }
            } catch (error) {
              console.warn("Error during terminal resize:", error)
            }
          }

          window.addEventListener("resize", handleResize)

          console.log("Terminal initialization complete")

          // Clear timeout and set states
          if (initTimeoutRef.current) {
            clearTimeout(initTimeoutRef.current)
            initTimeoutRef.current = null
          }

          setIsInitialized(true)
          setIsLoading(false)
          setInitError(null)

          // Cleanup function
          return () => {
            window.removeEventListener("resize", handleResize)
            if (outputTimeoutRef.current) {
              clearTimeout(outputTimeoutRef.current)
            }
            if (initTimeoutRef.current) {
              clearTimeout(initTimeoutRef.current)
            }
            wsRef.current?.close()
            term.dispose()
          }
        } catch (error) {
          console.error("Failed to initialize terminal:", error)

          // Clear timeout
          if (initTimeoutRef.current) {
            clearTimeout(initTimeoutRef.current)
            initTimeoutRef.current = null
          }

          setInitError(error instanceof Error ? error.message : "Unknown error")
          setIsInitialized(false)
          setIsLoading(false)
        }
      }

      initTerminal()

      // Cleanup timeout on unmount
      return () => {
        if (initTimeoutRef.current) {
          clearTimeout(initTimeoutRef.current)
        }
      }
    }, [onCommandFinished])

    // Expose sendCommand method to parent
    useImperativeHandle(ref, () => ({
      sendCommand: (command: string) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          // Clear any previous output accumulation
          terminalOutputRef.current = ""

          // Send the command
          wsRef.current.send(
            JSON.stringify({ type: "input", data: command + "\n" })
          )
        } else {
          console.warn("WebSocket is not connected")
        }
      }
    }))

    if (isLoading) {
      return (
        <div className="flex h-full items-center justify-center bg-[#0D1117] text-white">
          <div className="text-center">
            <div className="mb-2 size-8 animate-spin rounded-full border-2 border-blue-400 border-t-transparent"></div>
            <div>Loading terminal...</div>
            <div className="mt-2 text-xs text-gray-400">
              Initializing xterm.js...
            </div>
          </div>
        </div>
      )
    }

    if (initError) {
      return (
        <div className="flex h-full items-center justify-center bg-[#0D1117] text-white">
          <div className="text-center">
            <div className="mb-2 text-2xl text-red-400">⚠️</div>
            <div className="mb-2 text-lg">Terminal initialization failed</div>
            <div className="mb-4 max-w-md text-sm text-gray-400">
              {initError}
            </div>
            <div className="space-x-2">
              <button
                className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                onClick={() => {
                  setInitError(null)
                  setIsLoading(true)
                  setIsInitialized(false)
                  window.location.reload()
                }}
              >
                Retry
              </button>
              <button
                className="rounded bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
                onClick={() => {
                  setInitError(null)
                  setIsInitialized(true)
                  setIsLoading(false)
                }}
              >
                Use Fallback
              </button>
              <button
                className="rounded bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    if (!isInitialized) {
      return (
        <div className="flex h-full items-center justify-center bg-[#0D1117] text-white">
          <div className="text-center">
            <div className="mb-2 text-2xl text-yellow-400">🔧</div>
            <div>Terminal not ready</div>
            <div className="mt-2 text-xs text-gray-400">
              Please wait or refresh the page
            </div>
          </div>
        </div>
      )
    }

    // If there was an error but user chose to continue, use fallback
    if (initError && isInitialized) {
      return <FallbackTerminal onCommandFinished={onCommandFinished} />
    }

    return (
      <div className="flex h-full min-h-0 flex-col bg-[#0D1117]">
        <div className="border-b border-gray-700 bg-[#161B22] px-4 py-2">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="size-3 rounded-full bg-red-500"></div>
              <div className="size-3 rounded-full bg-yellow-500"></div>
              <div className="size-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-sm font-medium text-gray-300">Terminal</span>
          </div>
        </div>
        <div className="flex-1 overflow-hidden p-2">
          <div
            ref={terminalContainerRef}
            className="size-full rounded border border-gray-700"
          />
        </div>
      </div>
    )
  }
)

TerminalPanel.displayName = "TerminalPanel"

export default TerminalPanel
