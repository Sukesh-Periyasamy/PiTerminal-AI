# Contributing to Pi Terminal AI

Thank you for your interest in contributing to Pi Terminal AI! This document provides guidelines and information for contributors.

## 🚀 Quick Start for Contributors

### Development Setup

1. **Fork and Clone**
```bash
git clone https://github.com/YOUR_USERNAME/PiTerminal-AI.git
cd PiTerminal-AI
```

2. **Install Dependencies**
```bash
npm install
npm install xterm xterm-addon-fit
cd backend && npm install
```

3. **Start Development Environment**
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend  
node backend/server.js
```

4. **Create Feature Branch**
```bash
git checkout -b feature/your-feature-name
```

## 📋 Contribution Guidelines

### Code Standards

**TypeScript**
- Use strict TypeScript configuration
- Provide proper type definitions
- Avoid `any` types when possible
- Use interfaces for component props

**React/Next.js**
- Use functional components with hooks
- Implement proper error boundaries
- Follow Next.js SSR best practices
- Use dynamic imports for client-only code

**Styling**
- Use Tailwind CSS classes
- Follow the existing design system
- Maintain responsive design
- Use consistent color scheme

### File Structure

```
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   └── [locale]/          # Internationalized pages
├── components/            # Reusable React components
│   ├── chat/             # Chat-related components
│   ├── terminal/         # Terminal components
│   └── ui/               # Base UI components
├── lib/                   # Utility functions
├── types/                 # TypeScript type definitions
└── backend/              # WebSocket server
```

### Naming Conventions

- **Files**: kebab-case (`command-card.tsx`)
- **Components**: PascalCase (`CommandCard`)
- **Variables**: camelCase (`isInitialized`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`)
- **Types**: PascalCase (`CommandData`)

## 🎯 Areas for Contribution

### 🔧 Core Features

**Terminal Enhancements**
- Multi-tab terminal support
- Session persistence
- Command history and autocomplete
- File system integration

**AI Integration**
- Multi-language support (Python, JavaScript, etc.)
- Better error analysis
- Context-aware suggestions
- Custom AI model integration

**UI/UX Improvements**
- Mobile responsiveness
- Accessibility features
- Theme customization
- Performance optimizations

### 🐛 Bug Fixes

**High Priority**
- Terminal initialization issues
- WebSocket connection stability
- Memory leaks in terminal sessions
- SSR compatibility problems

**Medium Priority**
- UI responsive design issues
- Command parsing edge cases
- Error handling improvements
- Cross-browser compatibility

### 📝 Documentation

- API documentation
- Component usage examples
- Architecture diagrams
- Video tutorials

### 🧪 Testing

- Unit tests for components
- Integration tests for API
- End-to-end tests for workflows
- Performance testing

## 🔄 Development Workflow

### Before Starting

1. **Check existing issues** - Look for related work
2. **Create/comment on issue** - Discuss your planned changes
3. **Fork repository** - Work on your own copy
4. **Create feature branch** - Keep changes organized

### Development Process

1. **Write code** following our standards
2. **Add tests** for new functionality
3. **Update documentation** as needed
4. **Test locally** ensure everything works
5. **Commit changes** with clear messages

### Pull Request Process

1. **Create PR** with clear title and description
2. **Link related issues** using keywords
3. **Request review** from maintainers
4. **Address feedback** promptly
5. **Merge** once approved

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting changes
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(terminal): add session persistence
fix(websocket): handle connection timeout
docs(readme): update installation guide
```

## 🧪 Testing Requirements

### Required Tests

**New Features**
- Unit tests for all new functions
- Component tests for UI changes
- Integration tests for API changes
- Manual testing documentation

**Bug Fixes**
- Regression tests
- Edge case validation
- Cross-browser testing

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix
```

## 📖 Documentation Standards

### Code Documentation

```typescript
/**
 * Parses LLM response to extract command data
 * @param content - Raw LLM response content
 * @returns Object containing commands and cleaned content
 */
export function parseLLMResponse(content: string): ParsedResponse {
  // Implementation
}
```

### Component Documentation

```typescript
interface CommandCardProps {
  /** Command data to display */
  commandData: CommandData;
  /** Current execution status */
  status: 'pending' | 'error' | 'success';
  /** Callback when run button is clicked */
  onRun: (command: string) => void;
}
```

### README Updates

- Update feature list for new capabilities
- Add configuration options
- Include troubleshooting for new issues
- Update architecture diagrams

## 🎨 Design Guidelines

### Visual Design

- **Colors**: Use GitHub Dark theme palette
- **Typography**: Consistent font families and sizes  
- **Spacing**: Follow 4px grid system
- **Icons**: Use Tabler Icons consistently

### Interaction Design

- **Feedback**: Immediate visual feedback for actions
- **States**: Clear loading, success, and error states
- **Accessibility**: Keyboard navigation and screen readers
- **Performance**: Smooth animations and transitions

## 🚨 Security Considerations

### Terminal Security
- Validate all user inputs
- Sanitize command parameters
- Implement command whitelisting
- Prevent code injection attacks

### WebSocket Security
- Authenticate connections
- Rate limit requests
- Validate message format
- Handle malicious input

### Data Privacy
- No sensitive data logging
- Secure API key handling
- Local-only processing when possible
- Clear data retention policies

## 📞 Getting Help

### Communication Channels

- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - General questions and ideas
- **Pull Request Comments** - Code review discussions
- **Email** - sukesh.periyasamy@example.com for urgent issues

### Resources

- **Technical Documentation** - See TECHNICAL.md
- **API Reference** - See /docs/api
- **Component Library** - See /docs/components
- **Architecture Guide** - See /docs/architecture

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for their contributions
- Special mentions for significant features
- Invitation to maintainer team for sustained contributors

## ❓ FAQ

**Q: How do I test terminal functionality locally?**
A: Start both frontend (`npm run dev`) and backend (`node backend/server.js`) servers, then test in browser.

**Q: Can I add support for other LLM providers?**
A: Yes! Follow the existing pattern in `/app/api/chat/` directory for new providers.

**Q: How do I handle SSR issues with browser-only libraries?**
A: Use dynamic imports with `ssr: false` option, see TerminalPanel.tsx for examples.

**Q: What's the best way to debug WebSocket issues?**
A: Enable console logging in both frontend and backend, check browser dev tools network tab.

Thank you for contributing to Pi Terminal AI! 🚀