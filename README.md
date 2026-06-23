# 🚀 Gemini AI Internship - WebMCP Workspace

A next-generation development workspace dedicated to exploring, developing, and advancing **WebMCP (Web Model Context Protocol)** client-side integration and browser-native AI agent workflows.

This workspace provides a premium, interactive glassmorphic dashboard showcasing both declarative (HTML-based) and imperative (JavaScript-based) WebMCP tools, complete with a live **AI Agent Execution Simulator**.

---

## 🎨 Key Features

1. **📝 Declarative WebMCP Forms**:
   - Standard HTML `<form>` elements annotated with `toolname`, `tooldescription`, and `toolautosubmit` attributes.
   - The browser automatically parses these forms into JSON schemas for consumption by browser-integrated AI agents.
   - Includes forms for **Search Tasks**, **Adjust Hyperparameters**, and **Register Intern** (requires manual review simulation).

2. **⚙️ Imperative JavaScript Tools**:
   - Programmatically registered callbacks using `document.modelContext.registerTool()`.
   - Complete with input validation schemas and asynchronous response execution.
   - Includes tools for **System Status**, **Markdown Report Generation**, and **Terminal Clearing**.

3. **🤖 Interactive Agent Console**:
   - A visual developer terminal displaying simulated agent logic steps, tool matching, parameters staging, and raw execution logs.
   - Triggers dynamic neon visual glow states (`:tool-form-active`) on target UI components when tools are actively running.
   - Supports preset quick prompts and custom text instruction inputs.

4. **✨ Rich Aesthetics**:
   - Premium space-black CSS design tokens.
   - Frosted obsidian glass styling (`backdrop-filter: blur(16px)`).
   - Pulse indicators, hover interactions, and typewriter log animations.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed locally:
- [Node.js](https://nodejs.org/) (v20 or higher recommended)
- [npm](https://www.npmjs.com/) or another package manager (Yarn, pnpm)

### Installation & Run

1. Clone the repository and navigate to the directory:
   ```bash
   git clone https://github.com/elyhwolf/gemini-internship.git
   cd gemini-internship
   ```

2. Install dependencies (Vite server compiler):
   ```bash
   npm install
   ```

3. Spin up the development server:
   ```bash
   npm run dev
   ```

4. Open the link printed in the terminal (usually **`http://localhost:5173/`**) to view and test the workspace.

---

## 📁 Workspace Structure

```text
gemini-internship/
├── dist/                # Production build output
├── node_modules/        # Package dependencies (git-ignored)
├── index.html           # Dashboard layout and declarative WebMCP forms
├── style.css            # Custom CSS variables, glassmorphic layout, and glow animations
├── app.js               # WebMCP registration scripts and Agent console logic
├── package.json         # Development server config and scripts
├── .gitignore           # Git ignore list
├── journal.md           # Developer logs and environment details
└── README.md            # Project overview and instruction documentation
```

---

## 🤝 Contributing
Feel free to open issues or pull requests to expand the client-side tool registry or enhance the agent runner logic!
