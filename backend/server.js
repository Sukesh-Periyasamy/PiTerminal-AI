const express = require("express")
const cors = require("cors")
const WebSocket = require("ws")
const { createTerminalSession } = require("./terminal")

const app = express()
const PORT = 3003

app.use(cors())
app.use(express.json())

// REST endpoint for health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Terminal backend running" })
})

// Create HTTP server
const server = app.listen(PORT, () => {
  console.log(`HTTP server started on port ${PORT}`)
})

// Create WebSocket server
const wss = new WebSocket.Server({ server })

console.log(`WebSocket server started on port ${PORT}`)

wss.on("connection", ws => {
  console.log("Client connected")

  // Create terminal session for this connection
  const terminalSession = createTerminalSession(ws)

  ws.on("message", message => {
    try {
      const data = JSON.parse(message)

      if (data.type === "input") {
        // Send user input to terminal
        terminalSession.write(data.data)
      } else if (data.type === "resize") {
        // Handle terminal resize
        terminalSession.resize(data.cols, data.rows)
      }
    } catch (error) {
      console.error("Error handling message:", error)
      ws.send(
        JSON.stringify({
          type: "error",
          data: `Error: ${error.message}`
        })
      )
    }
  })

  ws.on("close", () => {
    console.log("Client disconnected")
    terminalSession.kill()
  })

  ws.on("error", error => {
    console.error("WebSocket error:", error)
  })
})

process.on("SIGINT", () => {
  console.log("\nShutting down server...")
  wss.close(() => {
    server.close(() => {
      console.log("Server closed")
      process.exit(0)
    })
  })
})

