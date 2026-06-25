// WebMCP Detection & Tools Configuration
const modelContext = document.modelContext || navigator.modelContext;
const isWebMCPSupported = !!(modelContext && typeof modelContext.registerTool === 'function');

// Global mock state for the Fried Chicken Kitchen
const STATE = {
  order: {
    bucketSize: '10-Piece Crispy Bucket',
    spiceLevel: 'Classic Golden',
    sides: 'Waffle Fries',
    primarySauce: 'Creamy Honey Mustard',
    secondarySauce: 'Smoky Chipotle BBQ',
    totalPrice: 16.99
  },
  loyaltyMembers: [
    { name: 'Ely Wolf', favoriteSide: 'Spicy Waffle Fries', joined: '2026-06-22' }
  ],
  menu: [
    { id: '6-Piece Golden Tenders', price: 9.99 },
    { id: '10-Piece Crispy Bucket', price: 16.99 },
    { id: '20-Piece Spicy Feaster', price: 29.99 }
  ],
  ttt: {
    board: Array(9).fill(null),
    active: true,
    turn: 'X',
    scores: { player: 0, bot: 0, draws: 0 }
  }
};

// Tool schemas and execution logic for the simulator registry
const SIMULATED_TOOLS = {
  // Declarative Tools (HTML Forms)
  'order_chicken_bucket': {
    name: 'order_chicken_bucket',
    type: 'declarative',
    description: 'Places an order for a fried chicken bucket with custom size, spice, and sides.',
    targetId: 'order-chicken-form',
    execute: (input) => {
      if (input.bucketSize) STATE.order.bucketSize = input.bucketSize;
      if (input.spiceLevel) STATE.order.spiceLevel = input.spiceLevel;
      if (input.sides) STATE.order.sides = input.sides;
      
      const menuItem = STATE.menu.find(m => m.id === STATE.order.bucketSize);
      STATE.order.totalPrice = menuItem ? menuItem.price : 16.99;
      
      updateOrderUI();
      
      return {
        status: 'order_placed',
        orderSummary: STATE.order,
        estimatedPrepTimeMinutes: STATE.order.bucketSize.includes('20') ? 15 : 10
      };
    }
  },
  'choose_sauces': {
    name: 'choose_sauces',
    type: 'declarative',
    description: 'Configures dip sauce combinations for the active order.',
    targetId: 'sauces-form',
    execute: (input) => {
      if (input.primarySauce) STATE.order.primarySauce = input.primarySauce;
      if (input.secondarySauce) STATE.order.secondarySauce = input.secondarySauce;
      
      updateOrderUI();
      
      return {
        status: 'sauces_updated',
        sauces: {
          primary: STATE.order.primarySauce,
          secondary: STATE.order.secondarySauce
        }
      };
    }
  },
  'register_loyalty_member': {
    name: 'register_loyalty_member',
    type: 'declarative',
    description: 'Registers a new rewards loyalty profile (Requires manager approval).',
    targetId: 'loyalty-form',
    execute: (input) => {
      const newMember = {
        name: input.name || 'Anonymous Guest',
        favoriteSide: input.favoriteSide || 'Waffle Fries',
        joined: new Date().toISOString().split('T')[0]
      };
      STATE.loyaltyMembers.push(newMember);
      updateLoyaltyUI();
      return {
        status: 'member_registered',
        member: newMember,
        totalMembers: STATE.loyaltyMembers.length
      };
    }
  },
  
  // Imperative Tools
  'get_kitchen_status': {
    name: 'get_kitchen_status',
    type: 'imperative',
    description: 'Returns kitchen queue size, wait times, and active frying vat temperatures.',
    schema: {
      type: 'object',
      properties: {}
    },
    execute: () => {
      const queueSize = Math.floor(Math.random() * 4) + 1; // 1-5 orders
      const waitTime = queueSize * 6; // 6 mins per order
      const vatTemp1 = 345 + Math.floor(Math.random() * 15); // 345-360F
      const vatTemp2 = 350 + Math.floor(Math.random() * 10); // 350-360F
      
      return {
        kitchenHost: "Ely's Hot Chicken",
        status: 'OPERATIONAL',
        activeVats: 2,
        queue: {
          pendingOrders: queueSize,
          estimatedWaitTime: `${waitTime} minutes`
        },
        telemetry: {
          fryerVat1: `${vatTemp1}°F (Ready)`,
          fryerVat2: `${vatTemp2}°F (Frying)`
        }
      };
    }
  },
  'generate_receipt': {
    name: 'generate_receipt',
    type: 'imperative',
    description: 'Produces a markdown formatted food receipt for the customer.',
    schema: {
      type: 'object',
      properties: {
        format: { type: 'string', description: 'Receipt print format (markdown, html)' }
      }
    },
    execute: (input) => {
      const format = input.format || 'markdown';
      const tax = (STATE.order.totalPrice * 0.08).toFixed(2);
      const total = (STATE.order.totalPrice * 1.08).toFixed(2);
      
      if (format === 'html') {
        return `<h3>Ely's Hot Chicken Receipt</h3><p>Bucket: ${STATE.order.bucketSize}</p><p>Sauces: ${STATE.order.primarySauce} & ${STATE.order.secondarySauce}</p><p>Total: $${total}</p>`;
      }
      return `# ELY'S HOT CHICKEN RECEIPT\n\n- **Item**: ${STATE.order.bucketSize} (${STATE.order.spiceLevel})\n- **Side**: ${STATE.order.sides}\n- **Dips**: ${STATE.order.primarySauce} & ${STATE.order.secondarySauce}\n- **Subtotal**: $${STATE.order.totalPrice.toFixed(2)}\n- **Tax (8%)**: $${tax}\n- **Total Due**: $${total}\n\n*Thank you for ordering with Ely's Hot Chicken!*`;
    }
  },
  'clear_order_logs': {
    name: 'clear_order_logs',
    type: 'imperative',
    description: 'Clears the drive-thru terminal display logs.',
    schema: {
      type: 'object',
      properties: {}
    },
    execute: () => {
      const terminal = document.getElementById('terminal-body');
      if (terminal) terminal.innerHTML = '';
      return 'Drive-thru console logs wiped clean.';
    }
  },
  'play_tic_tac_toe_move': {
    name: 'play_tic_tac_toe_move',
    type: 'imperative',
    description: 'Executes a player move (🍗) on the Crispy-Tac-Toe board at a specified cell position.',
    schema: {
      type: 'object',
      properties: {
        cellIndex: { 
          type: 'integer', 
          minimum: 0, 
          maximum: 8, 
          description: 'The 0-indexed cell index on the grid (0-8, 0=top-left, 4=center, 8=bottom-right).' 
        }
      },
      required: ['cellIndex']
    },
    execute: (input) => {
      const cellIndex = parseInt(input.cellIndex);
      if (isNaN(cellIndex) || cellIndex < 0 || cellIndex > 8) {
        throw new Error('Invalid cellIndex. Must be between 0 and 8 inclusive.');
      }
      return makeTicTacToeMoveDirect(cellIndex);
    }
  }
};

// Native WebMCP registration (runs if supported by the browser)
if (isWebMCPSupported) {
  try {
    modelContext.registerTool({
      name: SIMULATED_TOOLS.get_kitchen_status.name,
      description: SIMULATED_TOOLS.get_kitchen_status.description,
      inputSchema: SIMULATED_TOOLS.get_kitchen_status.schema,
      execute: SIMULATED_TOOLS.get_kitchen_status.execute
    });

    modelContext.registerTool({
      name: SIMULATED_TOOLS.generate_receipt.name,
      description: SIMULATED_TOOLS.generate_receipt.description,
      inputSchema: SIMULATED_TOOLS.generate_receipt.schema,
      execute: SIMULATED_TOOLS.generate_receipt.execute
    });

    modelContext.registerTool({
      name: SIMULATED_TOOLS.clear_order_logs.name,
      description: SIMULATED_TOOLS.clear_order_logs.description,
      inputSchema: SIMULATED_TOOLS.clear_order_logs.schema,
      execute: SIMULATED_TOOLS.clear_order_logs.execute
    });

    modelContext.registerTool({
      name: SIMULATED_TOOLS.play_tic_tac_toe_move.name,
      description: SIMULATED_TOOLS.play_tic_tac_toe_move.description,
      inputSchema: SIMULATED_TOOLS.play_tic_tac_toe_move.schema,
      execute: SIMULATED_TOOLS.play_tic_tac_toe_move.execute
    });
    
    console.log('WebMCP Native: Chicken kitchen tools registered successfully!');
  } catch (err) {
    console.error('WebMCP Native registration failed:', err);
  }
}

// Startup hooks
document.addEventListener('DOMContentLoaded', () => {
  setupForms();
  updateOrderUI();
  updateLoyaltyUI();
  updateConnectionStatus();
  
  logToTerminal('system', "Ely's Hot Chicken: Drive-thru system initialized.");
  logToTerminal('system', `WebMCP Native support: ${isWebMCPSupported ? 'CONNECTED' : 'SIMULATED (Offline API Mode)'}`);
  logToTerminal('system', 'Say or click an instruction to order.');
});

// Intercept form submissions
function setupForms() {
  const forms = [
    { id: 'order-chicken-form', toolName: 'order_chicken_bucket' },
    { id: 'sauces-form', toolName: 'choose_sauces' },
    { id: 'loyalty-form', toolName: 'register_loyalty_member' }
  ];

  forms.forEach(({ id, toolName }) => {
    const formEl = document.getElementById(id);
    if (!formEl) return;

    formEl.addEventListener('submit', (event) => {
      event.preventDefault();
      
      const formData = new FormData(event.target);
      const data = Object.fromEntries(formData.entries());
      
      const tool = SIMULATED_TOOLS[toolName];
      const result = tool ? tool.execute(data) : { error: 'Tool execution failed' };
      
      if (!event.agentInvoked) {
        logToTerminal('system', `Manual order submission captured for [${toolName}]`);
        logToTerminal('tool', `Receipt details: ${JSON.stringify(result, null, 2)}`);
      }

      if (event.agentInvoked && typeof event.respondWith === 'function') {
        event.respondWith(Promise.resolve(JSON.stringify(result)));
      }
    });
  });
}

// Sync UI inputs to matches
function updateOrderUI() {
  const sizeEl = document.getElementById('bucket-size');
  const spiceEl = document.getElementById('spice-level');
  const sidesEl = document.getElementById('side-dish');
  const primaryEl = document.getElementById('sauce-primary');
  const secondaryEl = document.getElementById('sauce-secondary');

  if (sizeEl) sizeEl.value = STATE.order.bucketSize;
  if (spiceEl) spiceEl.value = STATE.order.spiceLevel;
  if (sidesEl) sidesEl.value = STATE.order.sides;
  if (primaryEl) primaryEl.value = STATE.order.primarySauce;
  if (secondaryEl) secondaryEl.value = STATE.order.secondarySauce;
}

function updateLoyaltyUI() {
  const listEl = document.getElementById('interns-list');
  if (!listEl) return;

  listEl.innerHTML = STATE.loyaltyMembers.map(m => `
    <div style="background: rgba(245, 158, 11, 0.03); border: 1px solid rgba(245, 158, 11, 0.08); border-radius: 6px; padding: 0.5rem 0.75rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; margin-top: 0.5rem;">
      <div>
        <div style="font-weight: 600; color: var(--color-primary);">${escapeHTML(m.name)}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">Likes: ${escapeHTML(m.favoriteSide)}</div>
      </div>
      <div style="font-size: 0.75rem; color: var(--text-dark);">${escapeHTML(m.joined)}</div>
    </div>
  `).join('');
}

function updateConnectionStatus() {
  const statusBadge = document.getElementById('connection-status');
  if (statusBadge) {
    statusBadge.innerHTML = isWebMCPSupported 
      ? '<span class="status-dot"></span>Drive-Thru: Active'
      : '<span class="status-dot" style="background-color: var(--color-warning); box-shadow: 0 0 8px var(--color-warning);"></span>Drive-Thru: Simulated';
  }
}

// Drive-Thru Assistant Console logger
function logToTerminal(type, text) {
  const terminal = document.getElementById('terminal-body');
  if (!terminal) return;

  const entry = document.createElement('div');
  entry.className = 'log-entry';

  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const timeSpan = `<span class="log-time">[${time}]</span>`;

  let content = '';
  if (type === 'agent') {
    content = `${timeSpan} <span class="log-agent">🗣️ Assistant:</span> ${escapeHTML(text)}`;
  } else if (type === 'system') {
    content = `${timeSpan} <span class="log-system">🍽️ Kitchen:</span> ${escapeHTML(text)}`;
  } else if (type === 'tool') {
    content = `${timeSpan} <span class="log-tool">🍟 OrderData:</span> <pre style="background: rgba(0,0,0,0.6); padding: 0.5rem; margin-top: 0.25rem; border-radius: 4px; overflow-x: auto; color: var(--color-primary); font-size: 0.8rem;">${escapeHTML(text)}</pre>`;
  } else if (type === 'error') {
    content = `${timeSpan} <span class="log-error">❌ OrderError:</span> <span style="color: var(--color-danger);">${escapeHTML(text)}</span>`;
  } else if (type === 'success') {
    content = `${timeSpan} <span class="log-success">🍳 Success:</span> <span style="color: var(--color-warning);">${escapeHTML(text)}</span>`;
  }

  entry.innerHTML = content;
  terminal.appendChild(entry);
  terminal.scrollTop = terminal.scrollHeight;
}

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

// Drive-Thru AI parser and routing
async function simulateAgentExecution(prompt) {
  if (!prompt || prompt.trim() === '') return;
  
  logToTerminal('agent', `Customer request: "${prompt}"`);
  
  const thinking = showThinking('Parsing order intent and consulting active menu tools...');
  await sleep(1200);
  if (thinking) thinking.remove();

  const lowerPrompt = prompt.toLowerCase();
  let matchedTool = null;
  let compiledParams = {};

  if (lowerPrompt.includes('kitchen') || lowerPrompt.includes('fryer') || lowerPrompt.includes('queue') || lowerPrompt.includes('status')) {
    matchedTool = SIMULATED_TOOLS.get_kitchen_status;
  } else if (lowerPrompt.includes('receipt') || lowerPrompt.includes('bill') || lowerPrompt.includes('subtotal') || lowerPrompt.includes('total')) {
    matchedTool = SIMULATED_TOOLS.generate_receipt;
    compiledParams = { format: lowerPrompt.includes('html') ? 'html' : 'markdown' };
  } else if (lowerPrompt.includes('order') || lowerPrompt.includes('bucket') || lowerPrompt.includes('tenders') || lowerPrompt.includes('chicken') || lowerPrompt.includes('piece')) {
    matchedTool = SIMULATED_TOOLS.order_chicken_bucket;
    
    // Simple parameter compiler
    let size = '10-Piece Crispy Bucket';
    if (lowerPrompt.includes('6-piece') || lowerPrompt.includes('6 piece') || lowerPrompt.includes('tenders')) size = '6-Piece Golden Tenders';
    else if (lowerPrompt.includes('20-piece') || lowerPrompt.includes('20 piece') || lowerPrompt.includes('feaster')) size = '20-Piece Spicy Feaster';
    
    let spice = 'Classic Golden';
    if (lowerPrompt.includes('mild') || lowerPrompt.includes('honey')) spice = 'Honey Glazed (Mild)';
    else if (lowerPrompt.includes('nashville') || lowerPrompt.includes('blast') || lowerPrompt.includes('spicy')) spice = 'Spicy Nashville Blast';
    else if (lowerPrompt.includes('ghost') || lowerPrompt.includes('pepper') || lowerPrompt.includes('nuclear')) spice = 'Ghost Pepper Flame';

    let side = 'Waffle Fries';
    if (lowerPrompt.includes('coleslaw') || lowerPrompt.includes('slaw')) side = 'Coleslaw';
    else if (lowerPrompt.includes('mac') || lowerPrompt.includes('cheese')) side = 'Mac & Cheese';
    
    compiledParams = { bucketSize: size, spiceLevel: spice, sides: side };
  } else if (lowerPrompt.includes('sauce') || lowerPrompt.includes('dip') || lowerPrompt.includes('bbq') || lowerPrompt.includes('mustard') || lowerPrompt.includes('mayo') || lowerPrompt.includes('chili')) {
    matchedTool = SIMULATED_TOOLS.choose_sauces;
    
    let primary = 'Creamy Honey Mustard';
    if (lowerPrompt.includes('bbq') || lowerPrompt.includes('chipotle')) primary = 'Smoky Chipotle BBQ';
    else if (lowerPrompt.includes('garlic') || lowerPrompt.includes('mayo')) primary = 'Spicy Garlic Mayo';
    else if (lowerPrompt.includes('chili') || lowerPrompt.includes('sweet')) primary = 'Sweet Hot Chili';

    let secondary = 'Smoky Chipotle BBQ';
    if (lowerPrompt.includes('mustard') && primary !== 'Creamy Honey Mustard') secondary = 'Creamy Honey Mustard';
    else if (lowerPrompt.includes('mayo') && primary !== 'Spicy Garlic Mayo') secondary = 'Spicy Garlic Mayo';
    else if (lowerPrompt.includes('chili') && primary !== 'Sweet Hot Chili') secondary = 'Sweet Hot Chili';
    
    compiledParams = { primarySauce: primary, secondarySauce: secondary };
  } else if (lowerPrompt.includes('loyalty') || lowerPrompt.includes('rewards') || lowerPrompt.includes('register') || lowerPrompt.includes('member')) {
    matchedTool = SIMULATED_TOOLS.register_loyalty_member;
    
    let name = 'Alice Mercer';
    if (lowerPrompt.includes('jane')) name = 'Jane Doe';
    else if (lowerPrompt.includes('ely')) name = 'Ely Wolf';
    compiledParams = { name: name, favoriteSide: 'Spicy Waffle Fries' };
  } else if (lowerPrompt.includes('clear') || lowerPrompt.includes('wipe')) {
    matchedTool = SIMULATED_TOOLS.clear_order_logs;
  } else if (lowerPrompt.includes('tic') || lowerPrompt.includes('tictactoe') || lowerPrompt.includes('ttt') || lowerPrompt.includes('game') || lowerPrompt.includes('play')) {
    matchedTool = SIMULATED_TOOLS.play_tic_tac_toe_move;
    
    let cellIndex = 4; // default center
    if (lowerPrompt.includes('top left') || lowerPrompt.includes('top-left') || lowerPrompt.includes('0')) cellIndex = 0;
    else if (lowerPrompt.includes('top center') || lowerPrompt.includes('top middle') || lowerPrompt.includes('top-center') || lowerPrompt.includes('1')) cellIndex = 1;
    else if (lowerPrompt.includes('top right') || lowerPrompt.includes('top-right') || lowerPrompt.includes('2')) cellIndex = 2;
    else if (lowerPrompt.includes('middle left') || lowerPrompt.includes('left middle') || lowerPrompt.includes('middle-left') || lowerPrompt.includes('3')) cellIndex = 3;
    else if (lowerPrompt.includes('middle right') || lowerPrompt.includes('right middle') || lowerPrompt.includes('middle-right') || lowerPrompt.includes('5')) cellIndex = 5;
    else if (lowerPrompt.includes('bottom left') || lowerPrompt.includes('bottom-left') || lowerPrompt.includes('6')) cellIndex = 6;
    else if (lowerPrompt.includes('bottom center') || lowerPrompt.includes('bottom-center') || lowerPrompt.includes('7')) cellIndex = 7;
    else if (lowerPrompt.includes('bottom right') || lowerPrompt.includes('bottom-right') || lowerPrompt.includes('8')) cellIndex = 8;
    else {
      const emptyIdx = STATE.ttt.board.findIndex(c => c === null);
      if (emptyIdx !== -1) cellIndex = emptyIdx;
    }
    compiledParams = { cellIndex: cellIndex };
  }

  if (!matchedTool) {
    logToTerminal('error', 'Assistant could not understand order request. Please order standard bucket combos or check wait times.');
    return;
  }

  logToTerminal('agent', `Resolved Menu Action: "${matchedTool.name}"`);
  
  // Visual glow highlighting
  let elementToHighlight = null;
  if (matchedTool.type === 'declarative' && matchedTool.targetId) {
    elementToHighlight = document.getElementById(matchedTool.targetId);
  } else {
    const toolHeaderEl = Array.from(document.querySelectorAll('.tool-name')).find(el => el.textContent.trim() === matchedTool.name);
    if (toolHeaderEl) {
      elementToHighlight = toolHeaderEl.closest('.tool-item');
    }
  }

  if (elementToHighlight) {
    elementToHighlight.classList.add('tool-form-active');
  }

  const paramsThinking = showThinking(`Staging ingredients/parameters for [${matchedTool.name}]...`);
  await sleep(1000);
  if (paramsThinking) paramsThinking.remove();
  
  logToTerminal('agent', `Parameters registered: ${JSON.stringify(compiledParams)}`);

  // Handle flow state
  if (matchedTool.type === 'declarative') {
    const formEl = document.getElementById(matchedTool.targetId);
    
    // Loyalty profile review simulation
    if (matchedTool.name === 'register_loyalty_member') {
      logToTerminal('system', 'Form missing [toolautosubmit]. Manager approval required.');
      
      const submitBtn = formEl ? formEl.querySelector('button[type="submit"]') : null;
      if (submitBtn) submitBtn.classList.add('tool-submit-active');
      
      const approvalThinking = showThinking('Awaiting manager cashier checkout... (Submit form manually to override)');
      
      await new Promise((resolve) => {
        const handler = () => {
          if (submitBtn) submitBtn.classList.remove('tool-submit-active');
          if (approvalThinking) approvalThinking.remove();
          formEl.removeEventListener('submit', handler);
          resolve();
        };
        formEl.addEventListener('submit', handler);
        
        setTimeout(() => {
          logToTerminal('system', 'Rewards Club Manager override code entered.');
          handler();
        }, 4000);
      });
    } else {
      logToTerminal('system', 'Form features [toolautosubmit]. Auto-sending parameters.');
      await sleep(600);
    }

    const result = matchedTool.execute(compiledParams);
    logToTerminal('success', `Cashier response: respondWith(Promise.resolve(data))`);
    logToTerminal('tool', JSON.stringify(result, null, 2));

  } else {
    // Imperative tool direct execution
    const runThinking = showThinking(`Triggering kitchen callback for [${matchedTool.name}]...`);
    await sleep(800);
    if (runThinking) runThinking.remove();

    try {
      const result = matchedTool.execute(compiledParams);
      logToTerminal('success', 'Kitchen callback returned successfully.');
      logToTerminal('tool', typeof result === 'object' ? JSON.stringify(result, null, 2) : result);
    } catch (e) {
      logToTerminal('error', `Kitchen vat error: ${e.message}`);
    }
  }

  if (elementToHighlight) {
    await sleep(500);
    elementToHighlight.classList.remove('tool-form-active');
  }
}

// Drive-Thru helper
function submitAgentPrompt() {
  const promptInput = document.getElementById('agent-prompt');
  if (!promptInput) return;
  const prompt = promptInput.value;
  simulateAgentExecution(prompt);
  promptInput.value = '';
}

window.submitAgentPrompt = submitAgentPrompt;
window.simulateAgentExecution = simulateAgentExecution;

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

// ==========================================
// Crispy-Tac-Toe AI Arena Core Mechanics
// ==========================================

function checkWinner(board) {
  const winLines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  for (let line of winLines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: line };
    }
  }
  return null;
}

function resetTicTacToe() {
  STATE.ttt.board.fill(null);
  STATE.ttt.active = true;
  STATE.ttt.turn = 'X';
  
  const cells = document.querySelectorAll('.tictactoe-cell');
  cells.forEach(cell => {
    cell.textContent = '';
    cell.className = 'tictactoe-cell';
  });

  updateTTTStatusUI('Your turn! Place a drumstick.');
}

// Emojis mapping: X = 🍗 (Player), O = 🌶️ (Bot)
function updateTTTBoardUI() {
  const cells = document.querySelectorAll('.tictactoe-cell');
  cells.forEach((cell, idx) => {
    const val = STATE.ttt.board[idx];
    cell.className = 'tictactoe-cell';
    
    if (val === 'X') {
      cell.textContent = '🍗';
      cell.classList.add('cell-x');
    } else if (val === 'O') {
      cell.textContent = '🌶️';
      cell.classList.add('cell-o');
    } else {
      cell.textContent = '';
    }
  });

  const winResult = checkWinner(STATE.ttt.board);
  if (winResult) {
    winResult.line.forEach(winIdx => {
      const cell = document.querySelector(`.tictactoe-cell[data-index="${winIdx}"]`);
      if (cell) cell.classList.add('winning-cell');
    });
  }
}

function updateTTTStatusUI(text, isError = false) {
  const statusEl = document.getElementById('ttt-status');
  if (statusEl) {
    statusEl.textContent = text;
    statusEl.style.color = isError ? 'var(--color-danger)' : 'var(--color-primary)';
  }
}

function updateTTTScoresUI() {
  const pEl = document.getElementById('ttt-score-player');
  const dEl = document.getElementById('ttt-score-draws');
  const bEl = document.getElementById('ttt-score-bot');

  if (pEl) pEl.textContent = STATE.ttt.scores.player;
  if (dEl) dEl.textContent = STATE.ttt.scores.draws;
  if (bEl) bEl.textContent = STATE.ttt.scores.bot;
}

function makeTicTacToeMove(index) {
  if (!STATE.ttt.active || STATE.ttt.turn !== 'X') return;
  
  if (STATE.ttt.board[index] !== null) {
    updateTTTStatusUI('Cell already filled!', true);
    return;
  }

  executePlayerMove(index);
}

function executePlayerMove(index) {
  STATE.ttt.board[index] = 'X';
  updateTTTBoardUI();
  
  const winResult = checkWinner(STATE.ttt.board);
  if (winResult) {
    STATE.ttt.active = false;
    STATE.ttt.scores.player++;
    updateTTTScoresUI();
    updateTTTStatusUI('🎉 You won! Tasty victory.');
    return;
  }

  if (STATE.ttt.board.every(cell => cell !== null)) {
    STATE.ttt.active = false;
    STATE.ttt.scores.draws++;
    updateTTTScoresUI();
    updateTTTStatusUI('🤝 It is a draw! Bucket is empty.');
    return;
  }

  STATE.ttt.turn = 'O';
  updateTTTStatusUI('Chef bot is calculating counter-move...');
  
  setTimeout(() => {
    makeBotMove();
  }, 600);
}

function makeBotMove() {
  if (!STATE.ttt.active) return;

  const difficultySelect = document.getElementById('ttt-difficulty');
  const difficulty = difficultySelect ? difficultySelect.value : 'medium';
  
  let bestIndex = -1;

  if (difficulty === 'easy') {
    bestIndex = getRandomTTTMove();
  } else if (difficulty === 'medium') {
    bestIndex = getMediumTTTMove();
  } else {
    bestIndex = getHardTTTMove();
  }

  if (bestIndex !== -1) {
    STATE.ttt.board[bestIndex] = 'O';
    updateTTTBoardUI();

    const winResult = checkWinner(STATE.ttt.board);
    if (winResult) {
      STATE.ttt.active = false;
      STATE.ttt.scores.bot++;
      updateTTTScoresUI();
      updateTTTStatusUI('🌶️ Bot won! Too spicy for you.');
      return;
    }

    if (STATE.ttt.board.every(cell => cell !== null)) {
      STATE.ttt.active = false;
      STATE.ttt.scores.draws++;
      updateTTTScoresUI();
      updateTTTStatusUI('🤝 It is a draw!');
      return;
    }
  }

  STATE.ttt.turn = 'X';
  updateTTTStatusUI('Your turn! Place a drumstick.');
}

function getRandomTTTMove() {
  const empties = STATE.ttt.board.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
  if (empties.length === 0) return -1;
  return empties[Math.floor(Math.random() * empties.length)];
}

function getMediumTTTMove() {
  for (let i = 0; i < 9; i++) {
    if (STATE.ttt.board[i] === null) {
      STATE.ttt.board[i] = 'O';
      const isWin = checkWinner(STATE.ttt.board);
      STATE.ttt.board[i] = null;
      if (isWin) return i;
    }
  }

  for (let i = 0; i < 9; i++) {
    if (STATE.ttt.board[i] === null) {
      STATE.ttt.board[i] = 'X';
      const isBlock = checkWinner(STATE.ttt.board);
      STATE.ttt.board[i] = null;
      if (isBlock) return i;
    }
  }

  return getRandomTTTMove();
}

function getHardTTTMove() {
  let bestScore = -Infinity;
  let bestMove = -1;

  for (let i = 0; i < 9; i++) {
    if (STATE.ttt.board[i] === null) {
      STATE.ttt.board[i] = 'O';
      let score = minimax(STATE.ttt.board, 0, false);
      STATE.ttt.board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }
  return bestMove;
}

function minimax(board, depth, isMaximizing) {
  const result = checkWinner(board);
  if (result) {
    return result.winner === 'O' ? 10 - depth : depth - 10;
  }
  if (board.every(cell => cell !== null)) {
    return 0;
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'O';
        let score = minimax(board, depth + 1, false);
        board[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'X';
        let score = minimax(board, depth + 1, true);
        board[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function makeTicTacToeMoveDirect(index) {
  if (!STATE.ttt.active) {
    return { status: 'game_over', message: 'Game has ended. Click reset to start a new game.' };
  }
  if (STATE.ttt.turn !== 'X') {
    return { status: 'waiting_for_bot', message: 'Chef bot turn in progress.' };
  }
  if (STATE.ttt.board[index] !== null) {
    return { status: 'error', message: `Cell ${index} is already filled.` };
  }

  executePlayerMove(index);

  return {
    status: 'move_registered',
    cellPlayed: index,
    boardState: STATE.ttt.board,
    active: STATE.ttt.active,
    turn: STATE.ttt.turn,
    winResult: checkWinner(STATE.ttt.board)
  };
}

window.makeTicTacToeMove = makeTicTacToeMove;
window.resetTicTacToe = resetTicTacToe;
