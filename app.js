// WebMCP Detection & Tools Configuration
const modelContext = document.modelContext || navigator.modelContext;
const isWebMCPSupported = !!(modelContext && typeof modelContext.registerTool === 'function');

// Global mock state for demo purposes
const STATE = {
  modelParams: {
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 2048,
    modelName: 'gemini-1.5-flash'
  },
  interns: [
    { name: 'Ely Wolf', role: 'AI Engineering Intern', joined: '2026-06-22' }
  ],
  tasks: [
    { id: 'TASK-101', title: 'Implement glassmorphic styling for model settings', tags: ['React', 'CSS', 'UI'], status: 'In Progress' },
    { id: 'TASK-102', title: 'Verify WebMCP testing flags in chromium builds', tags: ['WebMCP', 'Chrome', 'Testing'], status: 'Completed' },
    { id: 'TASK-201', title: 'Connect local agent tools to browser window context', tags: ['AI Agent', 'WebMCP', 'JS'], status: 'Open' },
    { id: 'TASK-202', title: 'Integrate Gemini API streaming parser', tags: ['Gemini', 'API', 'Node'], status: 'Open' }
  ]
};

// Tool schemas and execution logic for the simulator registry
const SIMULATED_TOOLS = {
  // Declarative Tools (HTML Forms)
  'search_tasks': {
    name: 'search_tasks',
    type: 'declarative',
    description: 'Searches internship tasks and code challenges by keyword or tags.',
    targetId: 'search-tasks-form',
    execute: (input) => {
      const keyword = (input.keyword || '').toLowerCase();
      const results = STATE.tasks.filter(t => 
        t.title.toLowerCase().includes(keyword) || 
        t.id.toLowerCase().includes(keyword) ||
        t.tags.some(tag => tag.toLowerCase().includes(keyword))
      );
      return {
        count: results.length,
        results: results
      };
    }
  },
  'adjust_hyperparameters': {
    name: 'adjust_hyperparameters',
    type: 'declarative',
    description: 'Modifies model temperature, top-p, and max tokens.',
    targetId: 'params-form',
    execute: (input) => {
      STATE.modelParams.temperature = parseFloat(input.temperature || STATE.modelParams.temperature);
      STATE.modelParams.topP = parseFloat(input.topP || STATE.modelParams.topP);
      STATE.modelParams.maxTokens = parseInt(input.maxTokens || STATE.modelParams.maxTokens);
      if (input.modelName) STATE.modelParams.modelName = input.modelName;
      
      // Update UI sliders/values if necessary
      updateParamsUI();
      
      return {
        status: 'success',
        updatedParameters: STATE.modelParams
      };
    }
  },
  'register_intern': {
    name: 'register_intern',
    type: 'declarative',
    description: 'Registers a new intern profile (Requires manual review/approval).',
    targetId: 'intern-form',
    execute: (input) => {
      const newIntern = {
        name: input.name || 'Anonymous Intern',
        role: input.role || 'General Intern',
        joined: new Date().toISOString().split('T')[0]
      };
      STATE.interns.push(newIntern);
      updateInternsUI();
      return {
        status: 'registered',
        intern: newIntern,
        totalInterns: STATE.interns.length
      };
    }
  },
  
  // Imperative Tools
  'get_system_status': {
    name: 'get_system_status',
    type: 'imperative',
    description: 'Returns simulated system utilization, memory metrics, and active tools.',
    schema: {
      type: 'object',
      properties: {}
    },
    execute: () => {
      const cpu = Math.floor(Math.random() * 25) + 10; // 10-35%
      const memory = (3.2 + Math.random() * 0.4).toFixed(2); // 3.2 - 3.6 GB
      return {
        agentHost: 'Antigravity IDE Agent Host',
        status: 'Online',
        webmcpNative: isWebMCPSupported,
        activeToolsCount: Object.keys(SIMULATED_TOOLS).length,
        metrics: {
          cpuLoad: `${cpu}%`,
          memoryAllocated: `${memory} GB / 8.00 GB`,
          heartbeat: 'healthy'
        }
      };
    }
  },
  'generate_report': {
    name: 'generate_report',
    type: 'imperative',
    description: 'Produces a mock Markdown formatted internship progress report.',
    schema: {
      type: 'object',
      properties: {
        format: { type: 'string', description: 'File format (e.g. markdown, html)' }
      }
    },
    execute: (input) => {
      const format = input.format || 'markdown';
      if (format === 'html') {
        return `<h3>Internship Summary Report</h3><p>Intern count: ${STATE.interns.length}</p><p>Completed tasks: ${STATE.tasks.filter(t => t.status === 'Completed').length}</p>`;
      }
      return `# Internship Summary Report\n\n- **Active Interns**: ${STATE.interns.map(i => i.name).join(', ')}\n- **Task Completion Status**: ${STATE.tasks.filter(t => t.status === 'Completed').length} / ${STATE.tasks.length} tasks completed.\n- **Current AI Model**: \`${STATE.modelParams.modelName}\` (Temp: ${STATE.modelParams.temperature})`;
    }
  },
  'clear_logs': {
    name: 'clear_logs',
    type: 'imperative',
    description: 'Clears the simulated agent terminal console logs.',
    schema: {
      type: 'object',
      properties: {}
    },
    execute: () => {
      const terminal = document.getElementById('terminal-body');
      if (terminal) terminal.innerHTML = '';
      return 'Console cleared successfully.';
    }
  }
};

// Native WebMCP registration (runs if supported by the browser)
if (isWebMCPSupported) {
  try {
    // 1. Register get_system_status
    modelContext.registerTool({
      name: SIMULATED_TOOLS.get_system_status.name,
      description: SIMULATED_TOOLS.get_system_status.description,
      inputSchema: SIMULATED_TOOLS.get_system_status.schema,
      execute: SIMULATED_TOOLS.get_system_status.execute,
      annotations: { readOnlyHint: true }
    });

    // 2. Register generate_report
    modelContext.registerTool({
      name: SIMULATED_TOOLS.generate_report.name,
      description: SIMULATED_TOOLS.generate_report.description,
      inputSchema: SIMULATED_TOOLS.generate_report.schema,
      execute: SIMULATED_TOOLS.generate_report.execute,
      annotations: { readOnlyHint: true }
    });

    // 3. Register clear_logs
    modelContext.registerTool({
      name: SIMULATED_TOOLS.clear_logs.name,
      description: SIMULATED_TOOLS.clear_logs.description,
      inputSchema: SIMULATED_TOOLS.clear_logs.schema,
      execute: SIMULATED_TOOLS.clear_logs.execute
    });
    
    console.log('WebMCP Native: Programmatic tools registered successfully!');
  } catch (err) {
    console.error('WebMCP Native registration failed:', err);
  }
} else {
  console.log('WebMCP Native: Not supported. Running in Client-Side Simulated Mode.');
}

// Intercept HTML forms for Declarative WebMCP functionality
document.addEventListener('DOMContentLoaded', () => {
  setupForms();
  setupSliders();
  updateParamsUI();
  updateInternsUI();
  updateConnectionStatus();
  
  // Log startup message
  logToTerminal('system', 'System initialization complete.');
  logToTerminal('system', `WebMCP Native support: ${isWebMCPSupported ? 'CONNECTED' : 'SIMULATED (Browser lacks Native WebMCP)'}`);
  logToTerminal('system', 'Ready to receive agent instructions.');
});

// Setup Form submit events (standard & declarative WebMCP API)
function setupForms() {
  const forms = [
    { id: 'search-tasks-form', toolName: 'search_tasks' },
    { id: 'params-form', toolName: 'adjust_hyperparameters' },
    { id: 'intern-form', toolName: 'register_intern' }
  ];

  forms.forEach(({ id, toolName }) => {
    const formEl = document.getElementById(id);
    if (!formEl) return;

    formEl.addEventListener('submit', (event) => {
      event.preventDefault();
      
      const formData = new FormData(event.target);
      const data = Object.fromEntries(formData.entries());
      
      // Perform local execution
      const tool = SIMULATED_TOOLS[toolName];
      const result = tool ? tool.execute(data) : { error: 'Tool not found' };
      
      // Visual notification of manual submission
      if (!event.agentInvoked) {
        logToTerminal('system', `Manual submit triggered on form [${toolName}]`);
        logToTerminal('tool', `Result: ${JSON.stringify(result, null, 2)}`);
      }

      // Handle agent declarative WebMCP submission
      if (event.agentInvoked && typeof event.respondWith === 'function') {
        const responsePromise = Promise.resolve(JSON.stringify(result));
        event.respondWith(responsePromise);
      }
    });
  });
}

// Setup Sliders & UI components
function setupSliders() {
  const tempSlider = document.getElementById('temp-slider');
  const tempVal = document.getElementById('temp-val');
  if (tempSlider && tempVal) {
    tempSlider.addEventListener('input', (e) => {
      tempVal.textContent = e.target.value;
      STATE.modelParams.temperature = parseFloat(e.target.value);
    });
  }

  const toppSlider = document.getElementById('topp-slider');
  const toppVal = document.getElementById('topp-val');
  if (toppSlider && toppVal) {
    toppSlider.addEventListener('input', (e) => {
      toppVal.textContent = e.target.value;
      STATE.modelParams.topP = parseFloat(e.target.value);
    });
  }
}

// Update UI methods
function updateParamsUI() {
  const tempSlider = document.getElementById('temp-slider');
  const tempVal = document.getElementById('temp-val');
  const toppSlider = document.getElementById('topp-slider');
  const toppVal = document.getElementById('topp-val');
  const modelSelect = document.getElementById('model-select');
  const tokensInput = document.getElementById('max-tokens');

  if (tempSlider) tempSlider.value = STATE.modelParams.temperature;
  if (tempVal) tempVal.textContent = STATE.modelParams.temperature;
  if (toppSlider) toppSlider.value = STATE.modelParams.topP;
  if (toppVal) toppVal.textContent = STATE.modelParams.topP;
  if (modelSelect) modelSelect.value = STATE.modelParams.modelName;
  if (tokensInput) tokensInput.value = STATE.modelParams.maxTokens;
}

function updateInternsUI() {
  const listEl = document.getElementById('interns-list');
  if (!listEl) return;

  listEl.innerHTML = STATE.interns.map(i => `
    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 6px; padding: 0.5rem 0.75rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; margin-top: 0.5rem;">
      <div>
        <div style="font-weight: 600;">${escapeHTML(i.name)}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHTML(i.role)}</div>
      </div>
      <div style="font-size: 0.75rem; color: var(--text-dark);">${escapeHTML(i.joined)}</div>
    </div>
  `).join('');
}

function updateConnectionStatus() {
  const statusBadge = document.getElementById('connection-status');
  if (statusBadge) {
    statusBadge.innerHTML = isWebMCPSupported 
      ? '<span class="status-dot"></span>WebMCP: Active'
      : '<span class="status-dot" style="background-color: var(--color-warning); box-shadow: 0 0 8px var(--color-warning);"></span>WebMCP: Simulated';
  }
}

// Logger helper for simulated agent terminal
function logToTerminal(type, text) {
  const terminal = document.getElementById('terminal-body');
  if (!terminal) return;

  const entry = document.createElement('div');
  entry.className = 'log-entry';

  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const timeSpan = `<span class="log-time">[${time}]</span>`;

  let content = '';
  if (type === 'agent') {
    content = `${timeSpan} <span class="log-agent">🤖 Agent:</span> ${escapeHTML(text)}`;
  } else if (type === 'system') {
    content = `${timeSpan} <span class="log-system">⚙️ Sys:</span> ${escapeHTML(text)}`;
  } else if (type === 'tool') {
    content = `${timeSpan} <span class="log-tool">🛠️ Tool:</span> <pre style="background: rgba(0,0,0,0.5); padding: 0.5rem; margin-top: 0.25rem; border-radius: 4px; overflow-x: auto; color: var(--color-accent); font-size: 0.8rem;">${escapeHTML(text)}</pre>`;
  } else if (type === 'error') {
    content = `${timeSpan} <span class="log-error">❌ Error:</span> <span style="color: var(--color-danger);">${escapeHTML(text)}</span>`;
  } else if (type === 'success') {
    content = `${timeSpan} <span class="log-success">✅ Success:</span> <span style="color: var(--color-success);">${escapeHTML(text)}</span>`;
  }

  entry.innerHTML = content;
  terminal.appendChild(entry);
  terminal.scrollTop = terminal.scrollHeight;
}

// Visual indicator spinner generator
function showThinking(text) {
  const terminal = document.getElementById('terminal-body');
  if (!terminal) return null;

  const thinkingEl = document.createElement('div');
  thinkingEl.className = 'log-entry log-thinking';
  thinkingEl.innerHTML = `<span class="spinner"></span> <span>${escapeHTML(text)}</span>`;
  terminal.appendChild(thinkingEl);
  terminal.scrollTop = terminal.scrollHeight;
  return thinkingEl;
}

// Main simulated Agent inference and tool-execution router
async function simulateAgentExecution(prompt) {
  if (!prompt || prompt.trim() === '') return;
  
  logToTerminal('agent', `User prompt received: "${prompt}"`);
  
  const thinking = showThinking('Parsing intent and matching active WebMCP schemas...');
  await sleep(1200);
  if (thinking) thinking.remove();

  // Keyword analysis to match tool
  const lowerPrompt = prompt.toLowerCase();
  let matchedTool = null;
  let compiledParams = {};

  if (lowerPrompt.includes('status') || lowerPrompt.includes('system') || lowerPrompt.includes('cpu') || lowerPrompt.includes('memory')) {
    matchedTool = SIMULATED_TOOLS.get_system_status;
  } else if (lowerPrompt.includes('report') || lowerPrompt.includes('summary') || lowerPrompt.includes('generate')) {
    matchedTool = SIMULATED_TOOLS.generate_report;
    compiledParams = { format: lowerPrompt.includes('html') ? 'html' : 'markdown' };
  } else if (lowerPrompt.includes('search') || lowerPrompt.includes('task') || lowerPrompt.includes('find')) {
    matchedTool = SIMULATED_TOOLS.search_tasks;
    // Extract search query
    let keyword = '';
    if (lowerPrompt.includes('react')) keyword = 'React';
    else if (lowerPrompt.includes('webmcp')) keyword = 'WebMCP';
    else if (lowerPrompt.includes('gemini')) keyword = 'Gemini';
    else if (lowerPrompt.includes('task-102')) keyword = 'TASK-102';
    else keyword = prompt.split(' ').pop().replace(/[?.!]/g, ''); // last word as fallback
    compiledParams = { keyword: keyword };
  } else if (lowerPrompt.includes('temperature') || lowerPrompt.includes('temp') || lowerPrompt.includes('adjust') || lowerPrompt.includes('parameter') || lowerPrompt.includes('model')) {
    matchedTool = SIMULATED_TOOLS.adjust_hyperparameters;
    // Extract numbers
    const tempMatch = lowerPrompt.match(/temp(erature)?\s+(of\s+)?(0\.[0-9]+|[0-1](\.[0-9]+)?)/);
    const temp = tempMatch ? parseFloat(tempMatch[3]) : 0.85;
    compiledParams = { temperature: temp, modelName: lowerPrompt.includes('pro') ? 'gemini-1.5-pro' : 'gemini-1.5-flash' };
  } else if (lowerPrompt.includes('register') || lowerPrompt.includes('intern') || lowerPrompt.includes('add')) {
    matchedTool = SIMULATED_TOOLS.register_intern;
    // Try to extract name
    let name = 'Alice Mercer';
    if (lowerPrompt.includes('jane')) name = 'Jane Doe';
    compiledParams = { name: name, role: 'Senior Research Assistant' };
  } else if (lowerPrompt.includes('clear')) {
    matchedTool = SIMULATED_TOOLS.clear_logs;
  }

  // Handle unmatched intents
  if (!matchedTool) {
    logToTerminal('error', 'Unable to resolve any matching tool registration. Reason: Prompt contains no keyword mappings for active WebMCP schemas.');
    return;
  }

  logToTerminal('agent', `Resolved Tool Schema: "${matchedTool.name}"`);
  
  // Highlight UI element of the matched tool to show active interaction
  let elementToHighlight = null;
  if (matchedTool.type === 'declarative' && matchedTool.targetId) {
    elementToHighlight = document.getElementById(matchedTool.targetId);
  } else {
    // Imperative tool highlights the list item in tool card
    const toolHeaderEl = Array.from(document.querySelectorAll('.tool-name')).find(el => el.textContent.trim() === matchedTool.name);
    if (toolHeaderEl) {
      elementToHighlight = toolHeaderEl.closest('.tool-item');
    }
  }

  if (elementToHighlight) {
    elementToHighlight.classList.add('tool-form-active');
  }

  const paramsThinking = showThinking(`Staging parameters for execution on [${matchedTool.name}]...`);
  await sleep(1000);
  if (paramsThinking) paramsThinking.remove();
  
  logToTerminal('agent', `Parameters submitted to tool: ${JSON.stringify(compiledParams)}`);

  // Handle flow control / auto-submit states
  if (matchedTool.type === 'declarative') {
    // If declarative, check manual user review / toolautosubmit simulation
    const formEl = document.getElementById(matchedTool.targetId);
    
    // Check if the form requires manual submission confirmation (simulate register_intern)
    if (matchedTool.name === 'register_intern') {
      logToTerminal('system', 'Form missing [toolautosubmit] attribute. Browser pauses execution waiting for reviewer approval.');
      
      const submitBtn = formEl ? formEl.querySelector('button[type="submit"]') : null;
      if (submitBtn) submitBtn.classList.add('tool-submit-active');
      
      const approvalThinking = showThinking('Awaiting simulated administrator review... (Click "Register" on the form to approve)');
      
      // Hook one-off submission to proceed
      await new Promise((resolve) => {
        const handler = () => {
          if (submitBtn) submitBtn.classList.remove('tool-submit-active');
          if (approvalThinking) approvalThinking.remove();
          formEl.removeEventListener('submit', handler);
          resolve();
        };
        formEl.addEventListener('submit', handler);
        
        // Timeout auto-resolve for smooth flow if user doesn't click
        setTimeout(() => {
          logToTerminal('system', 'Simulating automated admin authorization bypass.');
          handler();
        }, 4000);
      });
    } else {
      // Simulate toolautosubmit: submit form programmatically
      logToTerminal('system', 'Form possesses [toolautosubmit] attribute. Auto-submitting to endpoint.');
      await sleep(600);
    }

    // Execute form action
    const result = matchedTool.execute(compiledParams);
    
    // Simulate event.respondWith() logic
    logToTerminal('success', `Form returned: respondWith(Promise.resolve(data))`);
    logToTerminal('tool', JSON.stringify(result, null, 2));

  } else {
    // Imperative tool direct execution
    const runThinking = showThinking(`Executing JavaScript tool handler for [${matchedTool.name}]...`);
    await sleep(800);
    if (runThinking) runThinking.remove();

    try {
      const result = matchedTool.execute(compiledParams);
      logToTerminal('success', 'JavaScript callback returned successfully.');
      logToTerminal('tool', typeof result === 'object' ? JSON.stringify(result, null, 2) : result);
    } catch (e) {
      logToTerminal('error', `Execution failed: ${e.message}`);
    }
  }

  // Cleanup highlights
  if (elementToHighlight) {
    await sleep(500);
    elementToHighlight.classList.remove('tool-form-active');
  }
}

// Form submit helper (handles custom button triggers)
function submitAgentPrompt() {
  const promptInput = document.getElementById('agent-prompt');
  if (!promptInput) return;
  const prompt = promptInput.value;
  simulateAgentExecution(prompt);
  promptInput.value = '';
}

// Event Bindings
window.submitAgentPrompt = submitAgentPrompt;
window.simulateAgentExecution = simulateAgentExecution;

// Utility functions
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function escapeHTML(str) {
  if (typeof str !== 'string') return String(str);
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
