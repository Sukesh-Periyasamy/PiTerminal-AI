const { spawn } = require("child_process")

/**
 * Creates a terminal session for a WebSocket connection
 * @param {WebSocket} ws - The WebSocket connection
 * @returns {Object} Terminal session object with write, resize, and kill methods
 */
function createTerminalSession(ws) {
  // Determine shell based on OS
  const shell = process.platform === "win32" ? "powershell.exe" : process.env.SHELL || "bash"
  
  const shellArgs = process.platform === "win32" 
    ? ["-NoLogo", "-NoProfile"] 
    : []

  // Spawn shell process
  const shellProcess = spawn(shell, shellArgs, {
    stdio: ["pipe", "pipe", "pipe"],
    env: process.env,
    cwd: process.cwd()
  })

  console.log(`Spawned shell: ${shell} (PID: ${shellProcess.pid})`)

  // Send welcome message
  ws.send(
    JSON.stringify({
      type: "output",
      data: `Welcome to terminal session (${shell})\r\n\r\n`
    })
  )

  // Handle stdout - send output to WebSocket
  shellProcess.stdout.on("data", data => {
    ws.send(
      JSON.stringify({
        type: "output",
        data: data.toString()
      })
    )
  })

  // Handle stderr - send errors to WebSocket
  shellProcess.stderr.on("data", data => {
    ws.send(
      JSON.stringify({
        type: "output",
        data: data.toString()
      })
    )
  })

  // Handle shell process exit
  shellProcess.on("exit", (code, signal) => {
    console.log(`Shell process exited (code: ${code}, signal: ${signal})`)
    ws.send(
      JSON.stringify({
        type: "output",
        data: `\r\nShell exited with code ${code}\r\n`
      })
    )
  })

  // Handle shell process errors
  shellProcess.on("error", error => {
    console.error("Shell process error:", error)
    ws.send(
      JSON.stringify({
        type: "error",
        data: `Shell error: ${error.message}`
      })
    )
  })

  return {
    /**
     * Write data to shell stdin
     * @param {string} data - Data to write to shell
     */
    write(data) {
      if (shellProcess.stdin.writable) {
        shellProcess.stdin.write(data)
      }
    },

    /**
     * Resize terminal (currently not fully supported with spawn)
     * @param {number} cols - Number of columns
     * @param {number} rows - Number of rows
     */
    resize(cols, rows) {
      // Note: spawn doesn't support resize like PTY does
      // This is a placeholder for compatibility
      console.log(`Terminal resize requested: ${cols}x${rows}`)
    },

    /**
     * Kill shell process
     */
    kill() {
      if (!shellProcess.killed) {
        shellProcess.kill()
        console.log("Shell process killed")
      }
    }
  }
}

module.exports = { createTerminalSession }
