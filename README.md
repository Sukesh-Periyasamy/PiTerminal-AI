# 🚀 Pi Terminal AI

**The world's first smart Linux-terminal–aware chat system with JSON command cards, Run buttons, and continuous terminal analysis.**

Pi Terminal AI revolutionizes how you interact with terminals by combining the power of conversational AI with real-time terminal execution and intelligent analysis. Built on top of Chatbot UI, it provides an unprecedented development experience.

![Pi Terminal AI Demo](https://via.placeholder.com/800x400/0D1117/C9D1D9?text=Pi+Terminal+AI+Demo)

## ✨ Key Features

### 🎯 **Smart Terminal Integration**
- **JSON Command Cards** - LLM responses automatically parsed into interactive command cards
- **One-Click Execution** - Run terminal commands directly from chat with dedicated Run buttons
- **Real-time Terminal** - Full xterm.js terminal emulation with WebSocket backend
- **Continuous Analysis** - Automatic output analysis and intelligent next-step suggestions

### 🧠 **AI-Powered Workflow**
- **Command Understanding** - AI recognizes and structures Linux commands in chat responses
- **Output Intelligence** - Analyzes terminal output to suggest follow-up actions
- **Error Resolution** - Provides smart suggestions when commands fail
- **Context Awareness** - Maintains conversation and terminal session context

### 🔧 **Robust Architecture**
- **SSR-Compatible** - Handles browser-only libraries with proper dynamic imports
- **Fallback Systems** - Graceful degradation when xterm.js fails to load
- **Error Boundaries** - Comprehensive error handling and recovery options
- **TypeScript Safety** - Full type safety across the entire application

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Chat UI       │    │  Terminal Panel │    │  Backend Server │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ CommandCard │ │◄──►│ │   xterm.js  │ │◄──►│ │  WebSocket  │ │
│ │   Component │ │    │ │   Terminal  │ │    │ │   Server    │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │  LLM Chat   │ │    │ │  Fallback   │ │    │ │ Child Process│ │
│ │  Analysis   │ │    │ │  Terminal   │ │    │ │   Spawner   │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern web browser

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Sukesh-Periyasamy/PiTerminal-AI.git
cd PiTerminal-AI
```

2. **Install dependencies**
```bash
npm install
```

3. **Install terminal dependencies**
```bash
npm install xterm xterm-addon-fit
cd backend
npm install ws express cors
```

4. **Set up environment**
```bash
cp .env.local.example .env.local
# Edit .env.local with your API keys
```

5. **Start the application**

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
node backend/server.js
```

6. **Open your browser**
Navigate to `http://localhost:3000`

## 📋 Usage Guide

### 💬 **Chat with Terminal Integration**

1. **Start a conversation** - Ask Pi Terminal AI about any Linux/development task
2. **Get command cards** - AI responses containing commands are automatically converted to interactive cards
3. **Execute commands** - Click the "Run" button on any command card to execute in the terminal
4. **Automatic analysis** - Terminal output is automatically analyzed for next steps
5. **Continuous workflow** - Follow suggested commands for seamless development

### 🎯 **Command Card Features**

- **Status Indicators**: Visual status (Ready, Running, Success, Error)
- **One-Click Execution**: Run button for instant terminal execution  
- **Output Display**: Command results shown inline
- **Error Handling**: Clear error messages and retry options

### 🔧 **Terminal Features**

- **Full Terminal Emulation**: Complete xterm.js integration
- **Theme Support**: GitHub Dark theme optimized for development
- **Fallback Mode**: Basic terminal interface when xterm.js fails
- **WebSocket Communication**: Real-time bidirectional communication
- **Command History**: Persistent command history and context

## 🏛️ Project Structure

```
├── app/
│   ├── api/chat/analyze/          # Terminal output analysis endpoint
│   ├── terminal/
│   │   ├── TerminalPanel.tsx      # Main xterm.js terminal component
│   │   └── FallbackTerminal.tsx   # Backup terminal interface
│   └── [locale]/[workspaceid]/chat/page.tsx  # Main chat page
├── components/
│   ├── chat/
│   │   └── command-card.tsx       # Interactive command card component
│   └── messages/
│       └── message.tsx            # Enhanced message with command detection
├── lib/
│   └── parse-llm-response.ts      # JSON command parsing utilities
├── backend/
│   ├── server.js                  # WebSocket terminal server
│   └── terminal.js                # Terminal session management
└── types/                         # TypeScript type definitions
```

## 🔧 Configuration

### Environment Variables

```bash
# Required - OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# Optional - Supabase (for data persistence)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_key

# Optional - Other LLM providers
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_GEMINI_API_KEY=your_gemini_key
```

### Terminal Server Configuration

```javascript
// backend/server.js
const PORT = 3003  // WebSocket server port
```

### Frontend Configuration

```typescript
// app/terminal/TerminalPanel.tsx
const ws = new WebSocket("ws://localhost:3003")  // Backend connection
```

## 🎨 Customization

### Themes

The terminal uses a GitHub Dark theme by default. Customize in `TerminalPanel.tsx`:

```typescript
const term = new Terminal({
  theme: {
    background: "#0D1117",
    foreground: "#C9D1D9",
    cursor: "#C9D1D9",
    // ... customize colors
  }
})
```

### Command Card Styling

Customize command card appearance in `command-card.tsx`:

```typescript
const statusConfig = {
  pending: { color: "bg-blue-500/10 text-blue-600", icon: IconPlayerPlay },
  success: { color: "bg-green-500/10 text-green-600", icon: IconCheck },
  // ... customize status styles
}
```

## 🛠️ Development

### Adding New Features

1. **Command Detection** - Extend `parseLLMResponse.ts` for new command patterns
2. **Terminal Integration** - Modify `TerminalPanel.tsx` for terminal features  
3. **Analysis Logic** - Update `app/api/chat/analyze/route.ts` for analysis rules
4. **UI Components** - Add components in `components/` directory

### Testing

```bash
# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

### Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🚨 Troubleshooting

### Common Issues

**🔄 "Loading terminal..." stuck**
- Check if backend server is running on port 3003
- Verify WebSocket connection in browser dev tools
- Try the fallback terminal option

**❌ xterm.js import errors**
- Ensure `xterm` and `xterm-addon-fit` are installed
- Check for SSR compatibility issues
- Use fallback terminal as backup

**🔗 WebSocket connection failed**
- Verify backend server is running: `node backend/server.js`
- Check for port conflicts (default: 3003)
- Ensure firewall allows WebSocket connections

**🎨 Styling issues**
- Verify Tailwind CSS is properly configured
- Check for conflicting CSS imports
- Ensure component class names are correct

### Debug Mode

Enable debug logging:

```typescript
// Add to TerminalPanel.tsx
console.log('Debug: Terminal initialization...')
```

Check browser developer console for detailed error messages.

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** with proper testing
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Add tests for new features
- Update documentation as needed
- Ensure compatibility with existing features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Chatbot UI** - Base framework for the chat interface
- **xterm.js** - Terminal emulation library
- **OpenAI** - LLM integration and analysis
- **Next.js** - React framework with SSR support
- **Tailwind CSS** - Utility-first CSS framework

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Sukesh-Periyasamy/PiTerminal-AI/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Sukesh-Periyasamy/PiTerminal-AI/discussions)
- **Email**: sukesh.periyasamy@example.com

## 🗺️ Roadmap

- [ ] **Multi-language support** (Python, JavaScript, etc.)
- [ ] **Terminal session persistence** across browser refreshes
- [ ] **Command completion** and syntax highlighting
- [ ] **File system integration** for editing files
- [ ] **Docker container support** for isolated environments
- [ ] **Cloud deployment** options (AWS, Azure, GCP)
- [ ] **Mobile-responsive** terminal interface

---

**Built with ❤️ by [Sukesh Periyasamy](https://github.com/Sukesh-Periyasamy)**

*Pi Terminal AI - Where conversation meets execution.*