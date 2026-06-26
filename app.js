// WebMCP Detection & Tools Configuration
const modelContext = document.modelContext || navigator.modelContext;
const isWebMCPSupported = !!(modelContext && typeof modelContext.registerTool === 'function');

// Translation Dictionary
const TRANSLATIONS = {
  en: {
    langBtn: "🇪🇸 Switch to Español",
    connectionSimulated: "Drive-Thru: Simulated",
    connectionActive: "Drive-Thru: Active",
    connectionConnected: "Drive-Thru Host: Connected",
    tagline: "Based in Jersey City, ESTD 2026",
    declarativeTitle: "📝 Declarative Ordering Tools (HTML Forms)",
    declarativeDesc: "Native forms converted into AI ordering actions via HTML <code>toolname</code>, <code>tooldescription</code>, and <code>toolautosubmit</code> attributes.",
    bucketSizeLabel: "Bucket Size",
    spiceStyleLabel: "Spice Style",
    sideDishLabel: "Select Side Dish",
    btnPlaceBucket: "🍗 Place Bucket Order",
    btnPlaceSandwich: "🥪 Place Sandwich Order ($10.99)",
    customerNameLabel: "Customer Name",
    btnSetOrderName: "👤 Set Order Name",
    primarySauceLabel: "Primary Sauce",
    secondarySauceLabel: "Secondary Sauce",
    btnConfigureSauces: "🍯 Configure Sauces",
    newSuggestionLabel: "New Menu Item or Flavor Suggestion",
    btnSubmitSuggestion: "💡 Submit Suggestion",
    loyaltyTitle: "👥 Crispy Rewards Loyalty Members",
    voiceAssistantTitle: "🗣️ AI Drive-Thru Voice Assistant",
    voiceAssistantDesc: "Order with natural language. The simulated Drive-Thru AI will match your request to active WebMCP schemas, fill forms, glow panels, and verify menu parameters.",
    presetLabel: "Preset Customer Orders",
    promptLabel: "Customer Prompt (e.g. \"I want a 10-piece bucket with coleslaw\")",
    btnOrder: "Order",
    terminalTitle: "drive-thru-assistant @ client-webmcp",
    tttTitle: "🎮 Crispy-Tac-Toe AI Arena",
    tttDesc: "Play against the Chef bots! You place Drumsticks (<strong style=\"color: var(--color-primary);\">🍗</strong>), Bots place Spicy Hot Chilis (<strong style=\"color: var(--color-purple);\">🌶️</strong>).",
    tttDifficultyLabel: "Bot Difficulty",
    tttResetBtn: "Reset",
    tttStatus: "Your turn! Make a move.",
    tttScorePlayer: "Player (🍗)",
    tttScoreDraws: "Draws",
    tttScoreBot: "Bot (🌶️)",
    adminModeBtnLocked: "🔒 Cashier Admin Mode",
    adminModeBtnUnlocked: "🔓 Cashier Admin: Unlocked",
    adminPasscodeTitle: "Enter Admin Passcode",
    adminSubmitBtn: "Submit",
    adminCancelBtn: "Cancel",
    adminDashboardTitle: "🔑 Cashier Control Dashboard (Active)",
    adminLockBtn: "Lock",
    adminLiveOrdersTitle: "Live Orders Feed",
    adminLiveOrdersDesc: "Showing live order placements submitted via UI or AI Drive-Thru tool execution.",
    adminRemoveRewardsTitle: "🗑️ Remove Rewards Member",
    adminRemoveRewardsDesc: "Revokes and deletes an active rewards loyalty profile.",
    adminRemoveSelectLabel: "Select Rewards Member to Remove",
    adminRemoveBtn: "🗑️ Remove Member",
    adminKitchenToolsTitle: "⚙️ Kitchen Controller Callback Tools",
    adminKitchenToolsDesc: "Imperative JavaScript endpoints registered via <code>document.modelContext.registerTool()</code>.",
    adminSuggestionsTitle: "💡 Customer Menu Suggestions",
    adminSuggestionsDesc: "Feedback submitted by guests proposing new menu flavors or items.",
    loyaltyMemberNameLabel: "Loyalty Member Name",
    loyaltyFavoriteSideLabel: "Favorite side",
    customerNamePlaceholder: "e.g. Ely Wolf",
    suggestionPlaceholder: "Enter your suggestion here...",
    loyaltyNamePlaceholder: "e.g. Alice Mercer",
    loyaltyFavoritePlaceholder: "e.g. Waffle Fries",
    agentPromptPlaceholder: "Say your order here...",
    btnRegisterMember: "📋 Register Member",
    btnRemoveMember: "🗑️ Remove Member",
    tttYourTurn: "Your turn! Place a drumstick.",
    tttCellFilled: "Cell already filled!",
    tttChefCalculating: "Chef bot is calculating counter-move...",
    tttYouWon: "🎉 You won! Tasty victory.",
    tttDraw: "🤝 It is a draw! Bucket is empty.",
    tttBotWon: "🌶️ Bot won! Too spicy for you."
  },
  es: {
    langBtn: "🇺🇸 Cambiar a Inglés",
    connectionSimulated: "Autoconsulta: Simulado",
    connectionActive: "Autoconsulta: Activo",
    connectionConnected: "Host de Autoconsulta: Conectado",
    tagline: "Basado en Jersey City, ESTD 2026",
    declarativeTitle: "📝 Herramientas de Pedido Declarativas (Formularios HTML)",
    declarativeDesc: "Formularios nativos convertidos en acciones de pedido de IA mediante los atributos HTML <code>toolname</code>, <code>tooldescription</code> y <code>toolautosubmit</code>.",
    bucketSizeLabel: "Tamaño del Balde",
    spiceStyleLabel: "Estilo de Picante",
    sideDishLabel: "Seleccionar Acompañamiento",
    btnPlaceBucket: "🍗 Realizar Pedido de Balde",
    btnPlaceSandwich: "🥪 Realizar Pedido de Sándwich ($10.99)",
    customerNameLabel: "Nombre del Cliente",
    btnSetOrderName: "👤 Establecer Nombre de Pedido",
    primarySauceLabel: "Salsa Primaria",
    secondarySauceLabel: "Salsa Secundaria",
    btnConfigureSauces: "🍯 Configurar Salsas",
    newSuggestionLabel: "Sugerencia de Nuevo Artículo o Sabor de Menú",
    btnSubmitSuggestion: "💡 Enviar Sugerencia",
    loyaltyTitle: "👥 Miembros del Programa Crispy Rewards",
    voiceAssistantTitle: "🗣️ Asistente de Voz de Autoconsulta de IA",
    voiceAssistantDesc: "Ordene con lenguaje natural. La IA de autoconsulta simulada coincidirá con su solicitud con esquemas WebMCP activos, completará formularios, iluminará paneles y verificará los parámetros del menú.",
    presetLabel: "Pedidos Predeterminados de Clientes",
    promptLabel: "Instrucción del Cliente (ej. \"Quiero un balde de 10 piezas con ensalada de col\")",
    btnOrder: "Pedir",
    terminalTitle: "asistente-autoconsulta @ client-webmcp",
    tttTitle: "🎮 Arena de IA de Crispy-Tac-Toe",
    tttDesc: "¡Juega contra los bots Chef! Tú colocas Muslos (<strong style=\"color: var(--color-primary);\">🍗</strong>), los Bots colocan Chiles Picantes (<strong style=\"color: var(--color-purple);\">🌶️</strong>).",
    tttDifficultyLabel: "Dificultad del Bot",
    tttResetBtn: "Reiniciar",
    tttStatus: "¡Tu turno! Haz un movimiento.",
    tttScorePlayer: "Jugador (🍗)",
    tttScoreDraws: "Empates",
    tttScoreBot: "Bot (🌶️)",
    adminModeBtnLocked: "🔒 Modo Administrador del Cajero",
    adminModeBtnUnlocked: "🔓 Admin del Cajero: Desbloqueado",
    adminPasscodeTitle: "Ingresar Código de Administrador",
    adminSubmitBtn: "Enviar",
    adminCancelBtn: "Cancelar",
    adminDashboardTitle: "🔑 Panel de Control del Cajero (Activo)",
    adminLockBtn: "Bloquear",
    adminLiveOrdersTitle: "Historial de Pedidos en Vivo",
    adminLiveOrdersDesc: "Mostrando pedidos en vivo enviados a través de la interfaz de usuario o la ejecución de herramientas de IA.",
    adminRemoveRewardsTitle: "🗑️ Eliminar Miembro de Recompensas",
    adminRemoveRewardsDesc: "Revoca y elimina un perfil activo de fidelidad de recompensas.",
    adminRemoveSelectLabel: "Seleccionar Miembro de Recompensa a Eliminar",
    adminRemoveBtn: "🗑️ Eliminar Miembro",
    adminKitchenToolsTitle: "⚙️ Herramientas de Retorno del Controlador de Cocina",
    adminKitchenToolsDesc: "Puntos finales imperativos de JavaScript registrados a través de <code>document.modelContext.registerTool()</code>.",
    adminSuggestionsTitle: "💡 Sugerencias de Menú de Clientes",
    adminSuggestionsDesc: "Comentarios enviados por los clientes proponiendo nuevos sabores o artículos de menú.",
    loyaltyMemberNameLabel: "Nombre del Miembro de Fidelidad",
    loyaltyFavoriteSideLabel: "Acompañamiento favorito",
    customerNamePlaceholder: "ej. Ely Wolf",
    suggestionPlaceholder: "Ingrese su sugerencia aquí...",
    loyaltyNamePlaceholder: "ej. Alice Mercer",
    loyaltyFavoritePlaceholder: "ej. Papas Waffle",
    agentPromptPlaceholder: "Diga su pedido aquí...",
    btnRegisterMember: "📋 Registrar Miembro",
    btnRemoveMember: "🗑️ Eliminar Miembro",
    tttYourTurn: "¡Tu turno! Coloca un muslo.",
    tttCellFilled: "¡La casilla ya está ocupada!",
    tttChefCalculating: "El bot Chef está calculando su contraataque...",
    tttYouWon: "🎉 ¡Ganaste! Sabrosa victoria.",
    tttDraw: "🤝 ¡Es un empate! El balde está vacío.",
    tttBotWon: "🌶️ ¡El bot ganó! Demasiado picante para ti."
  }
};

// Global mock state for the Fried Chicken Kitchen
const STATE = {
  language: localStorage.getItem('ely_hot_chicken_language') || 'en',
  order: {
    customerName: 'Guest',
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
  suggestions: [],
  menu: [
    { id: '6-Piece Golden Tenders', price: 9.99 },
    { id: '10-Piece Crispy Bucket', price: 16.99 },
    { id: '20-Piece Spicy Feaster', price: 29.99 },
    { id: 'Chicken Sandwich', price: 10.99 }
  ],
  ttt: {
    board: Array(9).fill(null),
    active: true,
    turn: 'X',
    scores: { player: 0, bot: 0, draws: 0 }
  },
  adminUnlocked: false,
  placedOrders: []
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
      
      // Live order tracker logging
      const isAgentSim = window.isAgentSimulating === true;
      const customerLabel = STATE.order.customerName || (STATE.language === 'es' ? 'Invitado' : 'Guest');
      const sidesLabel = STATE.language === 'es' ? 'Acompañamientos' : 'Sides';
      const dipsLabel = STATE.language === 'es' ? 'Salsas' : 'Dips';
      const originLabel = isAgentSim 
        ? (STATE.language === 'es' ? '🤖 Autoconsulta de IA' : '🤖 Drive-Thru AI')
        : (STATE.language === 'es' ? '👤 Clic de Cliente' : '👤 Customer Click');
      const placedOrderRecord = {
        id: `#ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        details: `[${customerLabel}] ${STATE.order.bucketSize} (${STATE.order.spiceLevel}) - ${sidesLabel}: ${STATE.order.sides} - ${dipsLabel}: ${STATE.order.primarySauce}/${STATE.order.secondarySauce}`,
        price: `$${(STATE.order.totalPrice * 1.08).toFixed(2)}`,
        origin: originLabel
      };
      if (!STATE.placedOrders) STATE.placedOrders = [];
      STATE.placedOrders.unshift(placedOrderRecord);
      updateAdminOrdersUI();
      
      return {
        status: 'order_placed',
        orderSummary: STATE.order,
        estimatedPrepTimeMinutes: STATE.order.bucketSize.includes('20') ? 15 : 10
      };
    }
  },
  'order_chicken_sandwich': {
    name: 'order_chicken_sandwich',
    type: 'declarative',
    description: 'Places an order for a hot chicken sandwich with custom spice style and sides.',
    targetId: 'order-sandwich-form',
    execute: (input) => {
      STATE.order.bucketSize = 'Chicken Sandwich';
      if (input.spiceLevel) STATE.order.spiceLevel = input.spiceLevel;
      if (input.sides) STATE.order.sides = input.sides;
      
      const menuItem = STATE.menu.find(m => m.id === 'Chicken Sandwich');
      STATE.order.totalPrice = menuItem ? menuItem.price : 10.99;
      
      updateOrderUI();
      
      // Live order tracker logging
      const isAgentSim = window.isAgentSimulating === true;
      const customerLabel = STATE.order.customerName || (STATE.language === 'es' ? 'Invitado' : 'Guest');
      const sidesLabel = STATE.language === 'es' ? 'Acompañamientos' : 'Sides';
      const dipsLabel = STATE.language === 'es' ? 'Salsas' : 'Dips';
      const originLabel = isAgentSim 
        ? (STATE.language === 'es' ? '🤖 Autoconsulta de IA' : '🤖 Drive-Thru AI')
        : (STATE.language === 'es' ? '👤 Clic de Cliente' : '👤 Customer Click');
      const placedOrderRecord = {
        id: `#ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        details: `[${customerLabel}] Chicken Sandwich (${STATE.order.spiceLevel}) - ${sidesLabel}: ${STATE.order.sides} - ${dipsLabel}: ${STATE.order.primarySauce}/${STATE.order.secondarySauce}`,
        price: `$${(STATE.order.totalPrice * 1.08).toFixed(2)}`,
        origin: originLabel
      };
      if (!STATE.placedOrders) STATE.placedOrders = [];
      STATE.placedOrders.unshift(placedOrderRecord);
      updateAdminOrdersUI();
      
      return {
        status: 'order_placed',
        orderSummary: STATE.order,
        estimatedPrepTimeMinutes: 8
      };
    }
  },
  'set_customer_name': {
    name: 'set_customer_name',
    type: 'declarative',
    description: "Configures the customer's name for the active order.",
    targetId: 'customer-name-form',
    execute: (input) => {
      if (input.customerName) STATE.order.customerName = input.customerName;
      
      updateOrderUI();
      
      return {
        status: 'name_updated',
        customerName: STATE.order.customerName
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
  'submit_menu_suggestion': {
    name: 'submit_menu_suggestion',
    type: 'declarative',
    description: 'Submits a menu suggestion or flavor request to the restaurant kitchen managers.',
    targetId: 'suggestion-form',
    execute: (input) => {
      const text = input.suggestionText || '';
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      if (!STATE.suggestions) STATE.suggestions = [];
      STATE.suggestions.unshift({ text, time });
      
      updateSuggestionsUI();
      
      const inputEl = document.getElementById('suggestion-input');
      if (inputEl) inputEl.value = '';
      
      return {
        status: 'suggestion_submitted',
        suggestionText: text
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
  'remove_loyalty_member': {
    name: 'remove_loyalty_member',
    type: 'declarative',
    description: 'Removes a restaurant rewards loyalty profile.',
    targetId: 'remove-loyalty-form',
    execute: (input) => {
      const index = STATE.loyaltyMembers.findIndex(m => m.name === input.name);
      if (index !== -1) {
        const removed = STATE.loyaltyMembers.splice(index, 1)[0];
        updateLoyaltyUI();
        return {
          status: 'member_removed',
          member: removed,
          totalMembers: STATE.loyaltyMembers.length
        };
      }
      return { error: 'Member not found' };
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
        return `<h3>Ely's Hot Chicken Receipt</h3><p>Customer: ${STATE.order.customerName || 'Guest'}</p><p>Item: ${STATE.order.bucketSize}</p><p>Sauces: ${STATE.order.primarySauce} & ${STATE.order.secondarySauce}</p><p>Total: $${total}</p>`;
      }
      return `# ELY'S HOT CHICKEN RECEIPT\n\n- **Customer**: ${STATE.order.customerName || 'Guest'}\n- **Item**: ${STATE.order.bucketSize} (${STATE.order.spiceLevel})\n- **Side**: ${STATE.order.sides}\n- **Dips**: ${STATE.order.primarySauce} & ${STATE.order.secondarySauce}\n- **Subtotal**: $${STATE.order.totalPrice.toFixed(2)}\n- **Tax (8%)**: $${tax}\n- **Total Due**: $${total}\n\n*Thank you for ordering with Ely's Hot Chicken!*`;
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
  updateSuggestionsUI();
  updateConnectionStatus();
  applyLanguage();
  
  logToTerminal('system', "Ely's Hot Chicken: Drive-thru system initialized.");
  logToTerminal('system', `WebMCP Native support: ${isWebMCPSupported ? 'CONNECTED' : 'SIMULATED (Offline API Mode)'}`);
  logToTerminal('system', 'Say or click an instruction to order.');
});

// Intercept form submissions
function setupForms() {
  const forms = [
    { id: 'order-chicken-form', toolName: 'order_chicken_bucket' },
    { id: 'order-sandwich-form', toolName: 'order_chicken_sandwich' },
    { id: 'customer-name-form', toolName: 'set_customer_name' },
    { id: 'sauces-form', toolName: 'choose_sauces' },
    { id: 'loyalty-form', toolName: 'register_loyalty_member' },
    { id: 'remove-loyalty-form', toolName: 'remove_loyalty_member' },
    { id: 'suggestion-form', toolName: 'submit_menu_suggestion' }
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
  
  const sandwichSpiceEl = document.getElementById('sandwich-spice');
  const sandwichSideEl = document.getElementById('sandwich-side');
  
  const customerNameEl = document.getElementById('order-customer-name');

  if (customerNameEl) customerNameEl.value = STATE.order.customerName || '';

  if (STATE.order.bucketSize === 'Chicken Sandwich') {
    if (sandwichSpiceEl) sandwichSpiceEl.value = STATE.order.spiceLevel;
    if (sandwichSideEl) sandwichSideEl.value = STATE.order.sides;
  } else {
    if (sizeEl) sizeEl.value = STATE.order.bucketSize;
    if (spiceEl) spiceEl.value = STATE.order.spiceLevel;
    if (sidesEl) sidesEl.value = STATE.order.sides;
  }
  
  if (primaryEl) primaryEl.value = STATE.order.primarySauce;
  if (secondaryEl) secondaryEl.value = STATE.order.secondarySauce;
}

function updateLoyaltyUI() {
  const listEl = document.getElementById('interns-list');
  if (!listEl) return;

  const likesLabel = STATE.language === 'es' ? 'Le gusta' : 'Likes';
  listEl.innerHTML = STATE.loyaltyMembers.map(m => `
    <div style="background: rgba(245, 158, 11, 0.03); border: 1px solid rgba(245, 158, 11, 0.08); border-radius: 6px; padding: 0.5rem 0.75rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; margin-top: 0.5rem;">
      <div>
        <div style="font-weight: 600; color: var(--color-primary);">${escapeHTML(m.name)}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">${likesLabel}: ${escapeHTML(m.favoriteSide)}</div>
      </div>
      <div style="font-size: 0.75rem; color: var(--text-dark);">${escapeHTML(m.joined)}</div>
    </div>
  `).join('');

  const removeSelect = document.getElementById('remove-member-name');
  if (removeSelect) {
    if (STATE.loyaltyMembers.length === 0) {
      const emptyMsg = STATE.language === 'es' ? 'No hay miembros registrados' : 'No members registered';
      removeSelect.innerHTML = `<option value="">${emptyMsg}</option>`;
    } else {
      removeSelect.innerHTML = STATE.loyaltyMembers.map(m => `
        <option value="${escapeHTML(m.name)}">${escapeHTML(m.name)}</option>
      `).join('');
    }
  }
}

function updateSuggestionsUI() {
  const feedEl = document.getElementById('admin-suggestions-feed');
  if (!feedEl) return;
  
  if (!STATE.suggestions || STATE.suggestions.length === 0) {
    const emptyMsg = STATE.language === 'es' ? 'No hay sugerencias enviadas aún.' : 'No suggestions submitted yet.';
    feedEl.innerHTML = `<div style="font-size: 0.85rem; color: var(--text-dark); text-align: center; padding: 1rem;">${emptyMsg}</div>`;
    return;
  }
  
  const feedbackLabel = STATE.language === 'es' ? 'Comentario Recibido' : 'Feedback Received';
  
  feedEl.innerHTML = STATE.suggestions.map(sug => `
    <div style="background: rgba(10, 4, 1, 0.3); border: 1px solid rgba(245, 158, 11, 0.12); border-radius: 6px; padding: 0.6rem 0.8rem; display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.85rem; margin-bottom: 0.5rem;">
      <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-dark);">
        <span>${feedbackLabel}</span>
        <span>${escapeHTML(sug.time)}</span>
      </div>
      <div style="color: var(--text-main); font-weight: 500;">"${escapeHTML(sug.text)}"</div>
    </div>
  `).join('');
}

function updateConnectionStatus() {
  const statusBadge = document.getElementById('connection-status');
  if (statusBadge) {
    const lang = STATE.language || 'en';
    const t = TRANSLATIONS[lang];
    statusBadge.innerHTML = isWebMCPSupported 
      ? `<span class="status-dot"></span>${t.connectionActive}`
      : `<span class="status-dot" style="background-color: var(--color-warning); box-shadow: 0 0 8px var(--color-warning);"></span>${t.connectionSimulated}`;
  }
}

// Language translation updater
function applyLanguage() {
  const lang = STATE.language || 'en';
  localStorage.setItem('ely_hot_chicken_language', lang);

  const t = TRANSLATIONS[lang];
  if (!t) return;

  const langBtn = document.getElementById('lang-btn');
  if (langBtn) langBtn.textContent = t.langBtn;

  const tagline = document.getElementById('app-tagline');
  if (tagline) tagline.textContent = t.tagline;

  updateConnectionStatus();

  const decTitle = document.getElementById('declarative-title');
  if (decTitle) decTitle.innerHTML = t.declarativeTitle;

  const decDesc = document.getElementById('declarative-desc');
  if (decDesc) decDesc.innerHTML = t.declarativeDesc;

  const labels = {
    'label[for="bucket-size"]': t.bucketSizeLabel,
    'label[for="spice-level"]': t.spiceStyleLabel,
    'label[for="side-dish"]': t.sideDishLabel,
    'label[for="sandwich-spice"]': t.spiceStyleLabel,
    'label[for="sandwich-side"]': t.sideDishLabel,
    'label[for="order-customer-name"]': t.customerNameLabel,
    'label[for="sauce-primary"]': t.primarySauceLabel,
    'label[for="sauce-secondary"]': t.secondarySauceLabel,
    'label[for="suggestion-input"]': t.newSuggestionLabel,
    'label[for="member-name"]': t.loyaltyMemberNameLabel,
    'label[for="member-favorite"]': t.loyaltyFavoriteSideLabel,
    'label[for="remove-member-name"]': t.adminRemoveSelectLabel
  };

  for (const [selector, text] of Object.entries(labels)) {
    const el = document.querySelector(selector);
    if (el) el.textContent = text;
  }

  const submitBtns = {
    'order-chicken-submit': t.btnPlaceBucket,
    'order-sandwich-submit': t.btnPlaceSandwich,
    'customer-name-submit': t.btnSetOrderName,
    'sauces-submit': t.btnConfigureSauces,
    'suggestion-submit': t.btnSubmitSuggestion,
    'loyalty-submit': t.btnRegisterMember,
    'remove-loyalty-submit': t.btnRemoveMember
  };

  for (const [id, text] of Object.entries(submitBtns)) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = text;
  }

  const placeholders = {
    'order-customer-name': t.customerNamePlaceholder,
    'suggestion-input': t.suggestionPlaceholder,
    'member-name': t.loyaltyNamePlaceholder,
    'member-favorite': t.loyaltyFavoritePlaceholder,
    'agent-prompt': t.agentPromptPlaceholder
  };

  for (const [id, text] of Object.entries(placeholders)) {
    const el = document.getElementById(id);
    if (el) el.placeholder = text;
  }

  const loyaltyTitle = document.getElementById('loyalty-title');
  if (loyaltyTitle) loyaltyTitle.innerHTML = t.loyaltyTitle;

  const voiceTitle = document.getElementById('voice-title');
  if (voiceTitle) voiceTitle.innerHTML = t.voiceAssistantTitle;

  const voiceDesc = document.getElementById('voice-desc');
  if (voiceDesc) voiceDesc.textContent = t.voiceAssistantDesc;

  const presetLabel = document.getElementById('preset-label');
  if (presetLabel) presetLabel.textContent = t.presetLabel;

  const promptLabel = document.getElementById('prompt-label');
  if (promptLabel) promptLabel.textContent = t.promptLabel;

  const promptSubmit = document.getElementById('agent-prompt-submit');
  if (promptSubmit) promptSubmit.textContent = t.btnOrder;

  const termTitle = document.getElementById('terminal-title');
  if (termTitle) termTitle.textContent = t.terminalTitle;

  const tttTitle = document.getElementById('ttt-title');
  if (tttTitle) tttTitle.innerHTML = t.tttTitle;

  const tttDesc = document.getElementById('ttt-desc');
  if (tttDesc) tttDesc.innerHTML = t.tttDesc;

  const tttDiffLabel = document.getElementById('ttt-diff-label');
  if (tttDiffLabel) tttDiffLabel.textContent = t.tttDifficultyLabel;

  const tttReset = document.getElementById('ttt-reset');
  if (tttReset) tttReset.textContent = t.tttResetBtn;

  const statusEl = document.getElementById('ttt-status');
  if (statusEl) {
    const currentText = statusEl.textContent.trim();
    const oldLang = lang === 'en' ? 'es' : 'en';
    const oldT = TRANSLATIONS[oldLang];
    const newT = TRANSLATIONS[lang];
    const matchedKey = Object.keys(oldT).find(key => oldT[key] === currentText);
    if (matchedKey && newT[matchedKey]) {
      statusEl.textContent = newT[matchedKey];
    } else if (currentText === 'Your turn! Make a move.' || currentText === '¡Tu turno! Haz un movimiento.') {
      statusEl.textContent = newT.tttStatus;
    }
  }

  const tttPlayerLabel = document.getElementById('ttt-stat-player-label');
  if (tttPlayerLabel) tttPlayerLabel.textContent = t.tttScorePlayer;

  const tttDrawsLabel = document.getElementById('ttt-stat-draws-label');
  if (tttDrawsLabel) tttDrawsLabel.textContent = t.tttScoreDraws;

  const tttBotLabel = document.getElementById('ttt-stat-bot-label');
  if (tttBotLabel) tttBotLabel.textContent = t.tttScoreBot;

  const adminBtn = document.getElementById('admin-mode-btn');
  if (adminBtn) {
    adminBtn.textContent = STATE.adminUnlocked ? t.adminModeBtnUnlocked : t.adminModeBtnLocked;
  }

  const loginTitle = document.getElementById('admin-login-title');
  if (loginTitle) loginTitle.textContent = t.adminPasscodeTitle;

  const loginSubmit = document.getElementById('admin-login-submit');
  if (loginSubmit) loginSubmit.textContent = t.adminSubmitBtn;

  const loginCancel = document.getElementById('admin-login-cancel');
  if (loginCancel) loginCancel.textContent = t.adminCancelBtn;

  const dashboardTitle = document.getElementById('admin-dashboard-title');
  if (dashboardTitle) dashboardTitle.innerHTML = t.adminDashboardTitle;

  const dashboardLock = document.getElementById('admin-dashboard-lock');
  if (dashboardLock) dashboardLock.textContent = t.adminLockBtn;

  const liveOrdersDesc = document.getElementById('admin-live-orders-desc');
  if (liveOrdersDesc) liveOrdersDesc.textContent = t.adminLiveOrdersDesc;

  const regRewardsTitle = document.getElementById('admin-register-rewards-title');
  if (regRewardsTitle) regRewardsTitle.innerHTML = t.adminRegisterRewardsTitle;

  const regRewardsDesc = document.getElementById('admin-register-rewards-desc');
  if (regRewardsDesc) regRewardsDesc.textContent = t.adminRegisterRewardsDesc;

  const removeTitle = document.getElementById('admin-remove-rewards-title');
  if (removeTitle) removeTitle.innerHTML = t.adminRemoveRewardsTitle;

  const removeDesc = document.getElementById('admin-remove-rewards-desc');
  if (removeDesc) removeDesc.textContent = t.adminRemoveRewardsDesc;

  const kitchenTitle = document.getElementById('admin-kitchen-tools-title');
  if (kitchenTitle) kitchenTitle.innerHTML = t.adminKitchenToolsTitle;

  const kitchenDesc = document.getElementById('admin-kitchen-tools-desc');
  if (kitchenDesc) kitchenDesc.textContent = t.adminKitchenToolsDesc;

  const sugTitle = document.getElementById('admin-suggestions-title');
  if (sugTitle) sugTitle.innerHTML = t.adminSuggestionsTitle;

  const sugDesc = document.getElementById('admin-suggestions-desc');
  if (sugDesc) sugDesc.textContent = t.adminSuggestionsDesc;
}

function toggleLanguage() {
  STATE.language = STATE.language === 'en' ? 'es' : 'en';
  applyLanguage();
}
window.toggleLanguage = toggleLanguage;

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

// Main simulated Agent inference and tool-execution router
async function simulateAgentExecution(prompt) {
  if (!prompt || prompt.trim() === '') return;
  
  window.isAgentSimulating = true;
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
  } else if (lowerPrompt.includes('suggest') || lowerPrompt.includes('suggestion') || lowerPrompt.includes('recommend adding') || lowerPrompt.includes('feedback')) {
    matchedTool = SIMULATED_TOOLS.submit_menu_suggestion;
    
    let text = 'Mango Habanero seasoning';
    const suggestIdx = lowerPrompt.indexOf('suggest');
    const addIdx = lowerPrompt.indexOf('recommend adding');
    
    if (suggestIdx !== -1) {
      text = prompt.substring(suggestIdx + 7).trim();
    } else if (addIdx !== -1) {
      text = prompt.substring(addIdx + 16).trim();
    }
    
    if (text.toLowerCase().startsWith('adding')) {
      text = text.substring(6).trim();
    }
    text = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();
    compiledParams = { suggestionText: text };
  } else if (lowerPrompt.includes('name is') || lowerPrompt.includes('called') || (lowerPrompt.includes('set') && lowerPrompt.includes('name'))) {
    matchedTool = SIMULATED_TOOLS.set_customer_name;
    
    let name = 'Guest';
    const nameIsIdx = lowerPrompt.indexOf('name is');
    const calledIdx = lowerPrompt.indexOf('called');
    const setToIdx = lowerPrompt.indexOf('name to');
    
    if (nameIsIdx !== -1) {
      name = prompt.substring(nameIsIdx + 7).trim();
    } else if (calledIdx !== -1) {
      name = prompt.substring(calledIdx + 6).trim();
    } else if (setToIdx !== -1) {
      name = prompt.substring(setToIdx + 7).trim();
    }
    
    name = name.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();
    compiledParams = { customerName: name };
  } else if (lowerPrompt.includes('sandwich')) {
    matchedTool = SIMULATED_TOOLS.order_chicken_sandwich;
    
    let spice = 'Classic Golden';
    if (lowerPrompt.includes('mild') || lowerPrompt.includes('honey')) spice = 'Honey Glazed (Mild)';
    else if (lowerPrompt.includes('nashville') || lowerPrompt.includes('blast') || lowerPrompt.includes('spicy')) spice = 'Spicy Nashville Blast';
    else if (lowerPrompt.includes('ghost') || lowerPrompt.includes('pepper') || lowerPrompt.includes('nuclear')) spice = 'Ghost Pepper Flame';

    let side = 'Waffle Fries';
    if (lowerPrompt.includes('french') || (lowerPrompt.includes('fries') && !lowerPrompt.includes('waffle'))) side = 'French Fries';
    else if (lowerPrompt.includes('waffle')) side = 'Waffle Fries';
    else if (lowerPrompt.includes('coleslaw') || lowerPrompt.includes('slaw')) side = 'Coleslaw';
    else if (lowerPrompt.includes('mac') || lowerPrompt.includes('cheese')) side = 'Mac and Cheese';
    else if (lowerPrompt.includes('collard') || lowerPrompt.includes('greens')) side = 'Collard Greens';
    else if (lowerPrompt.includes('onion') || lowerPrompt.includes('rings')) side = 'Onion Rings';
    else if (lowerPrompt.includes('caesar') || lowerPrompt.includes('salad')) side = 'Caesar Salad';
    
    compiledParams = { spiceLevel: spice, sides: side };
  } else if (lowerPrompt.includes('order') || lowerPrompt.includes('bucket') || lowerPrompt.includes('tenders') || lowerPrompt.includes('chicken') || lowerPrompt.includes('piece')) {
    matchedTool = SIMULATED_TOOLS.order_chicken_bucket;
    
    let size = '10-Piece Crispy Bucket';
    if (lowerPrompt.includes('6-piece') || lowerPrompt.includes('6 piece') || lowerPrompt.includes('tenders')) size = '6-Piece Golden Tenders';
    else if (lowerPrompt.includes('20-piece') || lowerPrompt.includes('20 piece') || lowerPrompt.includes('feaster')) size = '20-Piece Spicy Feaster';
    
    let spice = 'Classic Golden';
    if (lowerPrompt.includes('mild') || lowerPrompt.includes('honey')) spice = 'Honey Glazed (Mild)';
    else if (lowerPrompt.includes('nashville') || lowerPrompt.includes('blast') || lowerPrompt.includes('spicy')) spice = 'Spicy Nashville Blast';
    else if (lowerPrompt.includes('ghost') || lowerPrompt.includes('pepper') || lowerPrompt.includes('nuclear')) spice = 'Ghost Pepper Flame';

    let side = 'Waffle Fries';
    if (lowerPrompt.includes('french') || (lowerPrompt.includes('fries') && !lowerPrompt.includes('waffle'))) side = 'French Fries';
    else if (lowerPrompt.includes('waffle')) side = 'Waffle Fries';
    else if (lowerPrompt.includes('coleslaw') || lowerPrompt.includes('slaw')) side = 'Coleslaw';
    else if (lowerPrompt.includes('mac') || lowerPrompt.includes('cheese')) side = 'Mac and Cheese';
    else if (lowerPrompt.includes('collard') || lowerPrompt.includes('greens')) side = 'Collard Greens';
    else if (lowerPrompt.includes('onion') || lowerPrompt.includes('rings')) side = 'Onion Rings';
    else if (lowerPrompt.includes('caesar') || lowerPrompt.includes('salad')) side = 'Caesar Salad';
    
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
  } else if ((lowerPrompt.includes('remove') || lowerPrompt.includes('delete') || lowerPrompt.includes('revoke')) && (lowerPrompt.includes('loyalty') || lowerPrompt.includes('rewards') || lowerPrompt.includes('member'))) {
    matchedTool = SIMULATED_TOOLS.remove_loyalty_member;
    
    let name = 'Alice Mercer';
    if (lowerPrompt.includes('jane')) name = 'Jane Doe';
    else if (lowerPrompt.includes('ely')) name = 'Ely Wolf';
    compiledParams = { name: name };
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

  // Cleanup highlights
  if (elementToHighlight) {
    await sleep(500);
    elementToHighlight.classList.remove('tool-form-active');
  }
  window.isAgentSimulating = false;
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

  updateTTTStatusUI(TRANSLATIONS[STATE.language].tttYourTurn);
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
    updateTTTStatusUI(TRANSLATIONS[STATE.language].tttCellFilled, true);
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
    updateTTTStatusUI(TRANSLATIONS[STATE.language].tttYouWon);
    return;
  }

  if (STATE.ttt.board.every(cell => cell !== null)) {
    STATE.ttt.active = false;
    STATE.ttt.scores.draws++;
    updateTTTScoresUI();
    updateTTTStatusUI(TRANSLATIONS[STATE.language].tttDraw);
    return;
  }

  STATE.ttt.turn = 'O';
  updateTTTStatusUI(TRANSLATIONS[STATE.language].tttChefCalculating);
  
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
      updateTTTStatusUI(TRANSLATIONS[STATE.language].tttBotWon);
      return;
    }

    if (STATE.ttt.board.every(cell => cell !== null)) {
      STATE.ttt.active = false;
      STATE.ttt.scores.draws++;
      updateTTTScoresUI();
      updateTTTStatusUI(TRANSLATIONS[STATE.language].tttDraw);
      return;
    }
  }

  STATE.ttt.turn = 'X';
  updateTTTStatusUI(TRANSLATIONS[STATE.language].tttYourTurn);
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

// ==========================================
// Cashier Admin Mode Authentication & Live Tracker
// ==========================================

function toggleAdminMode() {
  const modal = document.getElementById('admin-login-modal');
  if (!modal) return;
  
  if (STATE.adminUnlocked) {
    lockAdminMode();
  } else {
    modal.style.display = modal.style.display === 'none' ? 'block' : 'none';
    const input = document.getElementById('admin-passcode-input');
    if (input) {
      input.value = '';
      input.focus();
    }
    const errorEl = document.getElementById('admin-login-error');
    if (errorEl) errorEl.style.display = 'none';
  }
}

function closeAdminLogin() {
  const modal = document.getElementById('admin-login-modal');
  if (modal) modal.style.display = 'none';
}

function submitAdminPasscode() {
  const input = document.getElementById('admin-passcode-input');
  const errorEl = document.getElementById('admin-login-error');
  if (!input) return;
  
  if (input.value === '2806') {
    STATE.adminUnlocked = true;
    closeAdminLogin();
    
    const panel = document.getElementById('admin-panel');
    if (panel) panel.style.display = 'block';
    
    const btn = document.getElementById('admin-mode-btn');
    if (btn) btn.textContent = TRANSLATIONS[STATE.language].adminModeBtnUnlocked;
    
    updateAdminOrdersUI();
    logToTerminal('system', STATE.language === 'es' ? 'Acceso de seguridad autorizado. Modo Administrador de Cajero autenticado.' : 'Security access cleared. Cashier Admin Mode authenticated.');
  } else {
    if (errorEl) errorEl.style.display = 'block';
    input.value = '';
    input.focus();
  }
}

function lockAdminMode() {
  STATE.adminUnlocked = false;
  
  const panel = document.getElementById('admin-panel');
  if (panel) panel.style.display = 'none';
  
  const btn = document.getElementById('admin-mode-btn');
  if (btn) btn.textContent = TRANSLATIONS[STATE.language].adminModeBtnLocked;
  
  closeAdminLogin();
  logToTerminal('system', STATE.language === 'es' ? 'Modo Administrador de Cajero bloqueado.' : 'Cashier Admin Mode locked.');
}

function updateAdminOrdersUI() {
  const feedEl = document.getElementById('admin-orders-feed');
  if (!feedEl) return;
  
  if (!STATE.placedOrders || STATE.placedOrders.length === 0) {
    const emptyMsg = STATE.language === 'es' ? 'No hay pedidos realizados aún.' : 'No orders placed yet.';
    feedEl.innerHTML = `<div style="font-size: 0.85rem; color: var(--text-dark); text-align: center; padding: 1rem;">${emptyMsg}</div>`;
    return;
  }
  
  feedEl.innerHTML = STATE.placedOrders.map(ord => `
    <div style="background: rgba(10, 4, 1, 0.5); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 8px; padding: 0.75rem 1rem; display: flex; flex-direction: column; gap: 0.4rem; font-size: 0.85rem; margin-bottom: 0.5rem; animation: fade-in 0.2s ease-out forwards;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 700; color: var(--color-primary);">${ord.id}</span>
        <span style="font-size: 0.75rem; color: var(--text-dark);">${ord.time}</span>
      </div>
      <div style="color: var(--text-main); font-weight: 500;">${escapeHTML(ord.details)}</div>
      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed rgba(245,158,11,0.1); padding-top: 0.4rem; font-size: 0.75rem; margin-top: 0.2rem;">
        <span style="color: var(--text-muted); font-size: 0.75rem;">${STATE.language === 'es' ? 'Origen:' : 'Source:'} ${ord.origin}</span>
        <span style="font-weight: 600; color: var(--color-accent); font-family: 'Fira Code', monospace; font-size: 0.85rem;">${ord.price}</span>
      </div>
    </div>
  `).join('');
}

window.makeTicTacToeMove = makeTicTacToeMove;
window.resetTicTacToe = resetTicTacToe;
window.toggleAdminMode = toggleAdminMode;
window.closeAdminLogin = closeAdminLogin;
window.submitAdminPasscode = submitAdminPasscode;
window.lockAdminMode = lockAdminMode;
window.updateAdminOrdersUI = updateAdminOrdersUI;
