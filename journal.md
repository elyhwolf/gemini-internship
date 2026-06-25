# 📓 Developer Journal - June 22, 2026

## 🛠️ What did I build today?
- Set up the foundation for the `gemini-internship` project.
- Verified that **Node.js** (`v26.3.1`) and **npm** (`11.16.0`) are correctly installed and configured in the development environment.
- Created and initialized the GitHub repository `elyhwolf/gemini-internship` and cloned it to the local workspace.
- Added a structured, professional `README.md` file documenting the Next.js and Node.js project blueprint, including details on prerequisites, setup, running the application, and the projected file structure.

## 🤖 What AI prompt worked?
- Prompting the AI agent to systematically inspect the development environment configuration using custom shell scripts:
  > *"based on all our previous work, would you say we did all this? [List of setup items]"*
- This allowed the agent to programmatically inspect Node.js installation, global/local Git remotes, GitHub CLI status, and VS Code settings to provide a clean status report.

## 🔍 What broke and how did I fix it?
- **GitHub CLI command not found**: Running `gh auth status` failed because the `gh` tool is not installed on the system.
  * **Fix**: Verified that the Git configuration utilizes `credential.helper=osxkeychain` and has user info correctly set, meaning standard HTTPS Git operations work seamlessly without requiring the `gh` command-line utility.
- **VS Code directories not found**: Checking VS Code extensions via `code --list-extensions` and looking in `~/.vscode/extensions` failed.
  * **Fix**: Confirmed that the system doesn't have standard VS Code installed, but is instead using the **Antigravity IDE** environment. Understanding this resolved the discrepancy about where to look for extensions and how to manage files/git within the editor.

---

# 📓 Developer Journal - June 23, 2026

## 🛠️ What did I build today?
- Created a premium glassmorphic dashboard (`index.html`, `style.css`, `app.js`) to showcase client-side **WebMCP (Web Model Context Protocol)** integration.
- Designed declarative HTML forms with `toolname`, `tooldescription`, and `toolautosubmit` attributes alongside imperative Javascript callback registrations.
- Built an interactive **AI Agent Simulator console** that parses natural language instructions, runs targeted tool code, glows the associated form elements via CSS `:tool-form-active` classes, and writes clean step-by-step logs into a retro terminal container.
- Added package management via **Vite** (`package.json`) to run a local dev server with HMR, and a `.gitignore` to organize tracked files.
- Rewrote `README.md` to cleanly document the current project structure and setup instructions.

## 🤖 What AI prompt worked?
- Using the `modern-web-guidance` skill to fetch specifications for `webmcp` and `agentic-forms`. This provided exact guidelines on declarative HTML parameter resolutions and the imperative registration methods with feature detection fallbacks.

## 🔍 What broke and how did I fix it?
- **Vite Bundler script warning**: Vite flagged that the script was not set as a module when bundling for production.
  * **Fix**: Added `type="module"` to the `<script>` tag in `index.html`.
- **Git Source Control Tab Lag**: Staging files stalled and loading spinners hung in the IDE sidebar changes explorer after running `npm install`.
  * **Fix**: Diagnosed that the IDE's file watcher was scanning thousands of `node_modules` files. Created a `.gitignore`, reset the Git index via `git reset && git add .`, and executed the commit and push commands directly in the terminal, bypassing the IDE interface lag.

---

# 📓 Developer Journal - June 24, 2026

## 🛠️ What did I build today?
- Confirmed the synchronization of Git logs and remote references to ensure repository sync (Push URL: `https://github.com/elyhwolf/gemini-internship.git`).
- Prepped workspace logs for subsequent feature development.

## 🤖 What AI prompt worked?
- Direct terminal execution commands for staging, committing, and pushing branch modifications.

## 🔍 What broke and how did I fix it?
- Verified that local and remote trees are up-to-date; no code or environment issues encountered today.

---

# 📓 Developer Journal - June 25, 2026

## 🛠️ What did I build today?
- Synchronized local workspace documents and launched the interactive WebMCP dashboard in the default browser environment.
- Today was officially the designated day in the curriculum/tasks to create `journal.md`. However, we proactively created and populated this developer journal early on June 22 to track our setup milestones from day one!

## 🤖 What AI prompt worked?
- Using the standard terminal trigger command (`open`) to launch the local Vite workspace at `http://localhost:5173/` directly inside the native OS browser context.

## 🔍 What broke and how did I fix it?
- The environment was fully stable today; no system or rendering issues encountered.

---

# 📓 Developer Journal - June 26, 2026

## 🛠️ What did I build today?
- Performed a formal **Code Review** and demonstration of the client-side WebMCP application workspace.
- Opened the local site at **`http://localhost:5173/`** and screen-shared the interactive AI Agent simulator execution in the browser.
- Demonstrated the public GitHub repository's commit logs at **`https://github.com/elyhwolf/gemini-internship/commits/main`** (pushing to **`https://github.com/elyhwolf/gemini-internship.git`**).

## 🤖 What AI prompt worked?
- Invoking the automated browser subagent to record a live demonstration sequence of our local dev server and git remote branches, capturing it as a high-quality visual walkthrough artifact.

## 🔍 What broke and how did I fix it?
- The demo setup completed smoothly; no rendering errors or synchronization warnings occurred.




