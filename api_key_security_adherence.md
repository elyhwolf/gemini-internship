# Bonus Checkpoint Delivery: API Key Security & Markdown Adherence

This artifact documents the validation steps, architecture, and constraints implemented to satisfy the bonus checkpoint for API key security and custom persona adherence to markdown instructions.

---

## 🔒 1. API Key Security Architecture

To ensure developer credentials are never compromised or exposed in version control, we implemented a multi-layer security configuration:

### GitIgnore Containment
- Added `.env` directly to **[`.gitignore`](file:///Users/elywolf/antigravity_workspace/gemini-internship/.gitignore)**.
- Checked in `.gitignore` modifications to prevent local `.env` variables from ever being staged or pushed.
- Confirmed via Git CLI that untracked credentials remain locally stored.

### Client-Side Sandbox Storage
- Implemented a dual key-retrieval pipeline inside **[`focus-timer/index.html`](file:///Users/elywolf/antigravity_workspace/gemini-internship/focus-timer/index.html)**:
  1. Checks local browser **`localStorage`** first.
  2. Falls back to Vite environment variables (`import.meta.env.VITE_GEMINI_API_KEY`) using parse-safe runtime compilation to protect static configurations.
- Keys are never logged, sent to intermediate servers, or cached outside the user's local browser context.

---

## 📝 2. Persona Adherence to Markdown Instructions

To align the generative AI assistant's conversation style with target mascot specifications, we decoupled prompt instructions from Javascript code and stored them dynamically:

### Markdown Decoupling
- Built the custom instructions inside **[`instructions.md`](file:///Users/elywolf/antigravity_workspace/gemini-internship/instructions.md)**.
- decodes:
  - Identity constraints (ChronoCluck focus mascot for Ely's Hot Chicken).
  - Exact formatting rules (all lowercase casing).
  - Terms of address (random selections of "bro", "brodie", "brudda", "mud", or "gang").

### Dynamic Injector Pipeline
- Configured the client-side chat processor to dynamically **fetch** the markdown file on startup:
  ```javascript
  fetch('../instructions.md')
    .then(r => r.text())
    .then(text => { chatbotSystemPrompt = text; })
  ```
- Integrates the raw markdown contents directly into the Gemini model call as `systemInstruction` parameters:
  ```json
  "systemInstruction": {
    "parts": [{ "text": systemPrompt }]
  }
  ```
- This ensures that updating `instructions.md` instantly controls the AI's behavior without requiring code rewrites.
