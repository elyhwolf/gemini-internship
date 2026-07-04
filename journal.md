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

---

# 📓 Developer Journal - June 27, 2026

## 🛠️ What did I build today?
- Integrated **isiXhosa (Xhosa)** language translation dictionary and switcher controls.
- Localized dynamic logs, loyalty card labels, empty feed notifications, and game results into Xhosa.
- Set up **GitHub Actions CI/CD workflow** (`deploy.yml`) to automatically build with Vite and deploy the project to **GitHub Pages**.
- Created `vite.config.js` to configure the base subdirectory path (`/gemini-internship/`) for correct asset resolution.

## 🤖 What AI prompt worked?
- Designing a custom GitHub Actions pages yml structure with the latest cache options (`cache: npm`) for ultra-fast builds.

## 🔍 What broke and how did I fix it?
- **GitHub Pages 404 assets**: Initially assets failed to load because Vite built them with absolute root paths `/assets/`.
  * **Fix**: Added `vite.config.js` with `base: '/gemini-internship/'` to resolve paths relative to the GitHub Pages repository namespace.

---

# 📓 Developer Journal - June 29, 2026

## 🛠️ What did I build today?
- Created a brand-new standalone application: **ChronoFocus** (Pomodoro Focus Timer + Task Tracker).
- Styled the app with a vibrant **fiery orange and lime green** glassmorphic dark theme sponsored by **Ely's Hot Chicken**.
- Integrated full multi-language switcher tabs (English, Spanish, Hebrew, Xhosa) with dynamic **RTL (Right-to-Left)** layout adjustments for Hebrew.
- Added custom time configuration settings, allowing the user to dynamically adjust Focus Session, Short Break, and Long Break durations in minutes with instant active timer resets.
- Added audio chimes on session completion and localStorage persistence for daily stats.

## 🤖 What AI prompt worked?
- Prompting the browser subagent to execute a full E2E user path: add a task, change focus duration to 10 minutes, click play, and verify the ticking countdown state.

## 🔍 What broke and how did I fix it?
- **Server crash on pipeline**: Running the local server pipe to `head -5` caused serve to terminate immediately once head exited due to a broken pipe.
  * **Fix**: Relaunched the local server directly in the background without piping, ensuring a stable local environment.

---

# 📓 Developer Journal - June 30, 2026

## 🛠️ What did I build today?
- Restored the original **Ely's Hot Chicken Drive-Thru Dashboard** on port `5173` after a git checkout rollback.
- Separated the new **ChronoFocus Timer** to run on its own port `5174` under `/focus-timer/`.
- Restructured the ChronoFocus grid layout, moving the **stats bar** to a full-width row at the bottom to solve vertical clipping and stats cutoff issues.
- Updated `package.json` build scripts to copy the static `focus-timer` folder to the `dist/` directory, allowing deployment of both sites side-by-side on GitHub Pages.
- Pushed all updates to the remote GitHub repository.

## 🤖 What AI prompt worked?
- Visually inspecting the browser screenshot of port 5174 to identify container height clipping, realizing that the stats-bar should be full-width rather than squished inside Column 1.

## 🔍 What broke and how did I fix it?
- **Overwritten index.html**: Overwriting root `index.html` with the timer code initially deleted the drive-thru dashboard.
  * **Fix**: Reverted the root file via Git (`git checkout 52ec0d8 -- index.html`) and relocated the timer code to `/focus-timer/index.html` to keep both projects active and separate.

---

# 📓 Developer Journal - July 1, 2026

## 🛠️ What did I build today?
- Updated `vite.config.js` to set the base path conditionally. It checks for the `GITHUB_ACTIONS` environment variable: deploying to GitHub Pages uses `/gemini-internship/` while Vercel or local builds deploy to root `/`.
- Connected the GitHub repository to **Vercel** for live production hosting.
- Deployed both applications side-by-side: **Ely's Hot Chicken Drive-Thru** is live at `https://gemini-internship.vercel.app/` and the **ChronoFocus Timer** is live at `/focus-timer/`.

## 🤖 What AI prompt worked?
- Implementing a conditional environment check (`process.env.GITHUB_ACTIONS`) in `vite.config.js` so a single build script works flawlessly on both GitHub Pages and Vercel.

## 🔍 What broke and how did I fix it?
- **Root path mismatch on Vercel**: Statically referencing `/gemini-internship/` for asset resolution works on GitHub Pages but fails on Vercel subdomains which resolve directly to the root directory `/`.
  * **Fix**: Used conditional environment parameters to serve `/` on Vercel and `/gemini-internship/` on GitHub Pages automatically.
- **Vite Signup Bad Request**: Vercel registration verification code input returned a `400 Bad Request` code entry error.
  * **Fix**: Bypassed manual email signups by selecting **"Continue with GitHub"** to authenticate via OAuth directly.

---

# 📓 Developer Journal - July 2, 2026

## 🛠️ What did I build today?
- Tested the newly configured Vercel CI/CD pipeline by making a code change locally.
- Added a "CI/CD Active 🚀" badge/tagline in the top header in `index.html` to confirm live update cycles.
- Added a small centered footer text `"Thursday's job done"` underneath the Cashier Admin Mode button at the bottom of `index.html`.
- Pushed changes to the GitHub repository and verified the automated rebuild deployment process on Vercel.

## 🤖 What AI prompt worked?
- Implementing localized tagline changes directly in index.html, pushing to main, and checking the live website status programmatically via `read_url_content` tools to verify live rebuild state.

## 🔍 What broke and how did I fix it?
- Rebuild completed cleanly on Vercel without warnings or build errors; the changes went live automatically within 20 seconds.

---

# 📓 Developer Journal - July 3, 2026

## 🛠️ What did I build today?
- Completed the final **Code Review** for the live Vercel deployments.
- Resolved a critical rendering bug in ChronoFocus where adding a task failed due to the `#task-empty` node being deleted from the DOM during initial page clears.
- Decoupled the empty state template `#task-empty` from `#task-list` in the HTML markup.
- Refactored the `.task-check` circle into a beautiful square checkbox option with hover micro-animations and completed checks next to tasks.
- **ChronoCluck AI Chatbot Pop-up**: Added a sleek glassmorphic chatbot popup in ChronoFocus that lets users request session timings (focus, short breaks, long breaks) and start/pause/reset controls in natural language.
- Extended the chatbot logic to allow **creating and checking off tasks** directly through chat inputs in all supported languages.
- Upgraded the chatbot to support **general conversational chit-chat** (handling greetings, mood checks, hot chicken spice queries, productivity quotes, and chicken-themed jokes).
- Added full multi-language translations (English, Spanish, Hebrew, Xhosa) for the chatbot interface, text prompts, status logs, and greetings.
- **ChronoCluck Hood Persona**: Restyled the chatbot's English voice to speak in lowercase hood/gang-affiliated slang (such as "yo what's good homie", "grind on some goals", "real talk", "stay safe").
- Refactored the unknown query fallback response to match the gangster persona: `"my glock got brandished brudda could u repeat dat"`.
- Presented the live URLs for the primary Nashville Hot Chicken drive-thru simulator dashboard and the standalone glassmorphic ChronoFocus productivity timer.

## 🤖 What AI prompt worked?
- Analyzing the browser subagent's feedback on task list HTML state, recognizing that the initial `list.innerHTML = ''` execution cleared all children of `#task-list` (including `#task-empty`), which caused subsequent calls to crash on `null` style references.
- Regular expression parsing with localized word matching to capture numbers (minutes) and trigger action handlers (switchMode, startTimer, resetTimer).
- Context-matching regex capturing to extract task text descriptions for creation and target task names for status updates (completed/done toggles).
- Splitting strings by alphanumeric sets to prevent short keywords (like "hi" in "chicken") from matching substring inclusions incorrectly.
- Modifying appendChatMsg to enforce lowercase conversion on the output of bot responses.

## 🔍 What broke and how did I fix it?
- **ChronoFocus Task list crash**: Setting `.style.display = 'none'` on the null reference `empty` crashed the script.
  * **Fix**: Restructured HTML to keep `#task-empty` outside the clearable list container, and added safety validation guards inside `renderTasks()`.
- **Chatbot greeting substring matching collision**: Short keywords like `"hi"` matched substrings in words like `"chicken"`, triggering greetings instead of jokes.
  * **Fix**: Implemented space/punctuation split arrays (`words`) and check methods (`hasWord()`) to guarantee matching of exact words.

---

# 📓 Developer Journal - July 4, 2026

## 🛠️ What did I build today?
- **ChronoCluck Slang Customization**: Customized the chatbot's terms of address dynamically.
- **Dynamic Address Slang Replacement**: Refactored the chatbot rendering logic to dynamically replace `"homie"` with a randomly selected slang term: `"bro"`, `"brodie"`, `"brudda"`, `"mud"`, or `"gang"`.
- **Integrated Dynamic Initialization**: Updated `initChatbot()` to pass the welcome message through `appendChatMsg`, ensuring that the initial welcome greeting dynamically chooses a slang term on load.
- Verified that all responses render in lowercase and randomly address the user as requested.

## 🤖 What AI prompt worked?
- Implementing a dynamic replacement mapping via Regex callback replacements `processedText.replace(/\bhomie\b/g, () => randomSlang)` inside `appendChatMsg` to dynamically randomize greetings without manual string changes.

## 🔍 What broke and how did I fix it?
- **Welcome message address slang caching**: The initial welcome message in the chatbot container was hardcoded in `initChatbot()` through `innerHTML`, causing it to miss the dynamic slang replacement engine.
  * **Fix**: Refactored `initChatbot()` to feed the welcome message through the `appendChatMsg()` pipeline, enabling dynamic slang selection on load.
