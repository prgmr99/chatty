# 💬 Chatty

Real-time WebSocket-based Chat Application

## Overview

Chatty is a lightweight real-time chat platform built with Express and WebSocket (ws). It implements real-time bidirectional communication with minimal dependencies and provides an extensible architecture for future enterprise-grade collaboration tools.

### Core Values

- **Real-time**: Low-latency messaging with WebSocket
- **Scalability**: Modular structure for easy feature additions
- **Simplicity**: Minimal external framework dependencies
- **Productivity**: Fast prototyping and deployment

## Installation & Setup

### Requirements

- Node.js 14.x or higher
- pnpm 6.x or higher

### Installation

```bash
# Install pnpm if not already installed
npm install -g pnpm

# Install project dependencies
pnpm install
```

### Running Development Server

```bash
pnpm start
```

The server runs on `http://localhost:3001` by default. You can change the port using the `PORT` environment variable.

```bash
PORT=3000 pnpm start
```

## Architecture

### Directory Structure

```
simple-chat/
├── server/
│   ├── index.js          # Express + WebSocket server
│   └── roomManager.js    # Room management logic
├── public/
│   ├── index.html        # Client UI
│   ├── styles.css        # Stylesheets
│   └── app.js            # Client logic
├── .github/
│   └── ISSUE_TEMPLATE/   # Issue templates
├── .agent/
│   └── rules/
│       └── code-style-guide.md
├── LICENSE               # MIT License
└── package.json
```

### Tech Stack

**Backend**
- Express 5.2.1 - HTTP server
- ws 8.18.3 - WebSocket server
- Node.js - Runtime environment

**Frontend**
- Vanilla JavaScript
- CSS3 - Modern styling (Grid, Flexbox, Animations)
- WebSocket API - Real-time communication

**Development Tools**
- pnpm - Fast and efficient package manager

## Features

### Current Implementation (v1.1)

1. **Multi-Room Chat System** 🆕
   - Create custom chat rooms
   - Join and switch between rooms
   - Room list with user counts
   - General room auto-created on server start
   - Room-based message isolation

2. **User Management**
   - Nickname-based authentication
   - Duplicate nickname prevention
   - Real-time user list per room

3. **Messaging**
   - Real-time message send/receive
   - Room-based broadcasting
   - Timestamp display
   - XSS prevention (HTML escaping)

4. **User Experience**
   - Responsive design (Mobile/Desktop)
   - Room creation modal
   - Active room highlighting
   - Enter key support
   - Auto-scroll
   - Join/Leave notifications
   - Error handling and user feedback

## Deployment

### Render

This application is optimized for deployment on [Render](https://render.com).

1. Push your code to GitHub
2. Connect your repository to Render
3. Configure:
   - Build Command: `pnpm install`
   - Start Command: `pnpm start`
4. Deploy

For detailed deployment instructions, see [Render Deployment Guide](/.gemini/antigravity/brain/82dc2ef5-5e5b-4444-bbc8-eb707f1e87ce/render-deployment-guide.md).

## Development

### Code Style

See [Code Style Guide](.agent/rules/code-style-guide.md) for detailed coding conventions.

**Key Rules**
- Package manager: `pnpm` required
- Indentation: 2 spaces
- Variables: `const` preferred, `let` when needed
- Naming: camelCase (functions/variables), PascalCase (classes)
- Error handling: Explicit try-catch

### Testing

```bash
# Start development server
pnpm start

# Test with multiple browser tabs
# http://localhost:3001
```

## License

MIT License - see [LICENSE](LICENSE) file for details

## Contributing

Issues and PRs are welcome. Please check the [Code Style Guide](.agent/rules/code-style-guide.md) before contributing.

---

**Chatty** - An extensible chat platform for real-time collaboration
