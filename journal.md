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
