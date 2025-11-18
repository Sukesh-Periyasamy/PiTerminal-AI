#!/bin/bash
# Startup script for Chatbot UI with Terminal (Unix/Linux/Mac)

echo "🚀 Starting Chatbot UI with Integrated Terminal..."
echo ""

# Check if backend dependencies are installed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend
    npm install
    cd ..
fi

# Check if frontend dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

echo ""
echo "✅ Starting services..."
echo ""

# Start backend in background
echo "🔧 Starting backend server (port 3001)..."
node backend/server.js &
BACKEND_PID=$!

sleep 2

# Check if backend started
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Backend server is running (PID: $BACKEND_PID)"
else
    echo "⚠️  Backend may still be starting..."
fi

echo ""
echo "🌐 Starting frontend server (port 3000)..."
echo ""

# Trap Ctrl+C to cleanup
trap "echo ''; echo '🛑 Shutting down...'; kill $BACKEND_PID 2>/dev/null; exit" INT TERM

# Start frontend (foreground)
npm run dev

# Cleanup
kill $BACKEND_PID 2>/dev/null
