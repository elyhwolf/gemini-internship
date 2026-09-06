// DripVault — Smart Wardrobe & AI Outfit Builder Engine

// Pre-loaded Streetwear & Fashion Catalog Database for Smart Autocomplete & Web Lookup
const STREETWEAR_CATALOG = [
  {
    name: "Fear of God Essentials Hoodie - Light Oatmeal",
    brand: "Essentials",
    category: "Hoodies",
    colorHex: "#D6CFC4",
    colorName: "Light Oatmeal",
    preset: "preset-hoodie-oatmeal",
    imageUrl: "/wardrobe/assets/fog_essentials_hoodie_oatmeal.png"
  },
  {
    name: "Essentials Fleece Shorts - Light Oatmeal",
    brand: "Essentials",
    category: "Shorts",
    colorHex: "#D6CFC4",
    colorName: "Light Oatmeal",
    preset: "preset-shorts-oatmeal",
    imageUrl: "/wardrobe/assets/fog_essentials_shorts_oatmeal.png"
  },
  {
    name: "Fear of God Essentials Oversized Tee - Light Oatmeal",
    brand: "Essentials",
    category: "Shirts",
    colorHex: "#D6CFC4",
    colorName: "Light Oatmeal",
    preset: "preset-stussy-tee",
    imageUrl: "/wardrobe/assets/stussy_white_tee.png"
  },
  {
    name: "Nike Dunk Low - Panda (Black/White)",
    brand: "Nike",
    category: "Shoes",
    colorHex: "#111111",
    colorName: "Panda Black/White",
    preset: "preset-dunk-panda",
    imageUrl: "/wardrobe/assets/nike_dunk_panda.png"
  },
  {
    name: "Carhartt WIP Detroit Jacket - Hamilton Brown",
    brand: "Carhartt",
    category: "Jackets",
    colorHex: "#8C532B",
    colorName: "Hamilton Brown",
    preset: "preset-carhartt-jacket",
    imageUrl: "/wardrobe/assets/carhartt_detroit_jacket.png"
  },
  {
    name: "Stüssy Basic Stock Tee - White",
    brand: "Stüssy",
    category: "Shirts",
    colorHex: "#FFFFFF",
    colorName: "White",
    preset: "preset-stussy-tee",
    imageUrl: "/wardrobe/assets/stussy_white_tee.png"
  },
  {
    name: "Levi's 501 Original Straight Jeans - Medium Wash",
    brand: "Levi's",
    category: "Pants",
    colorHex: "#4B6584",
    colorName: "Medium Denim",
    preset: "preset-levis-pants",
    imageUrl: "/wardrobe/assets/levis_501_jeans.png"
  },
  {
    name: "Arc'teryx Beta LT Jacket - Black",
    brand: "Arc'teryx",
    category: "Jackets",
    colorHex: "#111111",
    colorName: "Black",
    preset: "preset-carhartt-jacket",
    imageUrl: "/wardrobe/assets/carhartt_detroit_jacket.png"
  },
  {
    name: "Nike Air Force 1 '07 - Triple White",
    brand: "Nike",
    category: "Shoes",
    colorHex: "#FFFFFF",
    colorName: "Triple White",
    preset: "preset-dunk-panda",
    imageUrl: "/wardrobe/assets/nike_dunk_panda.png"
  },
  {
    name: "Carhartt WIP Watch Beanie - Black",
    brand: "Carhartt",
    category: "Accessories",
    colorHex: "#111111",
    colorName: "Black",
    preset: "preset-beanie",
    imageUrl: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Supreme Box Logo Hoodie - Heather Grey",
    brand: "Supreme",
    category: "Hoodies",
    colorHex: "#A9A9A9",
    colorName: "Heather Grey",
    preset: "preset-hoodie-oatmeal",
    imageUrl: "/wardrobe/assets/fog_essentials_hoodie_oatmeal.png"
  }
];

// App State Variables
let inventory = [];
let savedOutfits = [];
let activeCategoryFilter = "all";
let activeTab = "closet";
let uploadedImageDataUrl = null;

// Fit Studio Canvas Selection State
let currentOutfitCanvas = {
  Outerwear: null,
  Top: null,
  Bottom: null,
  Shoes: null,
  Accessory: null
};

let activePickingSlot = null;

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  loadDataFromStorage();
  // Reset seed if previous placeholders were loaded
  if (inventory.length === 0 || (inventory[0] && inventory[0].imageUrl.includes('unsplash'))) {
    seedInitialInventory();
  }
  renderAllViews();
  setupClickOutsideHandlers();
  setupDragAndDrop();
});

// Seed Initial Demonstration Items
function seedInitialInventory() {
  inventory = [
    {
      id: "item-1",
      name: "Fear of God Essentials Hoodie - Light Oatmeal",
      brand: "Essentials",
      category: "Hoodies",
      colorHex: "#D6CFC4",
      colorName: "Light Oatmeal",
      season: "Fall/Winter",
      imageUrl: "/wardrobe/assets/fog_essentials_hoodie_oatmeal.png",
      favorite: true,
      wearCount: 4
    },
    {
      id: "item-2",
      name: "Essentials Fleece Shorts - Light Oatmeal",
      brand: "Essentials",
      category: "Shorts",
      colorHex: "#D6CFC4",
      colorName: "Light Oatmeal",
      season: "Spring/Summer",
      imageUrl: "/wardrobe/assets/fog_essentials_shorts_oatmeal.png",
      favorite: false,
      wearCount: 2
    },
    {
      id: "item-3",
      name: "Nike Dunk Low - Panda (Black/White)",
      brand: "Nike",
      category: "Shoes",
      colorHex: "#111111",
      colorName: "Panda Black/White",
      season: "All-Season",
      imageUrl: "/wardrobe/assets/nike_dunk_panda.png",
      favorite: true,
      wearCount: 7
    },
    {
      id: "item-4",
      name: "Carhartt WIP Detroit Jacket - Hamilton Brown",
      brand: "Carhartt",
      category: "Jackets",
      colorHex: "#8C532B",
      colorName: "Hamilton Brown",
      season: "Fall/Winter",
      imageUrl: "/wardrobe/assets/carhartt_detroit_jacket.png",
      favorite: true,
      wearCount: 3
    },
    {
      id: "item-5",
      name: "Levi's 501 Original Straight Jeans - Medium Wash",
      brand: "Levi's",
      category: "Pants",
      colorHex: "#4B6584",
      colorName: "Medium Denim",
      season: "All-Season",
      imageUrl: "/wardrobe/assets/levis_501_jeans.png",
      favorite: false,
      wearCount: 5
    },
    {
      id: "item-6",
      name: "Stüssy Basic Stock Tee - White",
      brand: "Stüssy",
      category: "Shirts",
      colorHex: "#FFFFFF",
      colorName: "White",
      season: "All-Season",
      imageUrl: "/wardrobe/assets/stussy_white_tee.png",
      favorite: false,
      wearCount: 8
    }
  ];
  saveDataToStorage();
}

// LocalStorage Persistence
function loadDataFromStorage() {
  try {
    const invData = localStorage.getItem("dripvault_inventory");
    if (invData) inventory = JSON.parse(invData);

    const fitData = localStorage.getItem("dripvault_outfits");
    if (fitData) savedOutfits = JSON.parse(fitData);
  } catch (e) {
    console.error("LocalStorage load error:", e);
  }
}

function saveDataToStorage() {
  try {
    localStorage.setItem("dripvault_inventory", JSON.stringify(inventory));
    localStorage.setItem("dripvault_outfits", JSON.stringify(savedOutfits));
  } catch (e) {
    console.error("LocalStorage save error:", e);
  }
}

// Tab Switching
function switchTab(tabName) {
  activeTab = tabName;

  document.querySelectorAll(".nav-tab").forEach(tab => tab.classList.remove("active"));
  document.querySelectorAll(".view-panel").forEach(panel => panel.classList.remove("active"));

  if (tabName === "closet") {
    document.getElementById("tabCloset").classList.add("active");
    document.getElementById("viewCloset").classList.add("active");
  } else if (tabName === "studio") {
    document.getElementById("tabStudio").classList.add("active");
    document.getElementById("viewStudio").classList.add("active");
    renderFitStudioCanvas();
  } else if (tabName === "lookbook") {
    document.getElementById("tabLookbook").classList.add("active");
    document.getElementById("viewLookbook").classList.add("active");
    renderLookbook();
  }
}

// Render All Views
function renderAllViews() {
  renderStatsBar();
  renderCategoryCounts();
  renderClosetGrid();
}

// Render Stats
function renderStatsBar() {
  document.getElementById("statTotalItems").textContent = inventory.length;
  document.getElementById("statTotalOutfits").textContent = savedOutfits.length;

  // Determine Top Category
  const catCounts = {};
  inventory.forEach(item => {
    catCounts[item.category] = (catCounts[item.category] || 0) + 1;
  });

  let topCat = "None";
  let maxCount = 0;
  Object.keys(catCounts).forEach(cat => {
    if (catCounts[cat] > maxCount) {
      maxCount = catCounts[cat];
      topCat = cat;
    }
  });

  document.getElementById("statTopCategory").textContent = topCat;
}

// Render Category Counts in Filter Bar
function renderCategoryCounts() {
  const categories = ["Shirts", "Shorts", "Pants", "Hoodies", "Jackets", "Shoes", "Accessories"];
  
  document.getElementById("count-all").textContent = inventory.length;
  
  categories.forEach(cat => {
    const count = inventory.filter(i => i.category === cat).length;
    const el = document.getElementById(`count-${cat}`);
    if (el) el.textContent = count;
  });
}

// Filter Category
function filterCategory(category) {
  activeCategoryFilter = category;
  
  document.querySelectorAll(".cat-btn").forEach(btn => btn.classList.remove("active"));
  
  const activeBtn = Array.from(document.querySelectorAll(".cat-btn")).find(btn => 
    btn.getAttribute("onclick").includes(`'${category}'`)
  );
  if (activeBtn) activeBtn.classList.add("active");

  renderClosetGrid();
}

// Render Closet Grid
function renderClosetGrid() {
  const gridEl = document.getElementById("closetGrid");
  const emptyEl = document.getElementById("closetEmptyState");
  if (!gridEl) return;

  gridEl.innerHTML = "";

  const filtered = activeCategoryFilter === "all"
    ? inventory
    : inventory.filter(item => item.category === activeCategoryFilter);

  if (filtered.length === 0) {
    emptyEl.style.display = "flex";
    gridEl.style.display = "none";
    return;
  }

  emptyEl.style.display = "none";
  gridEl.style.display = "grid";

  filtered.forEach(item => {
    const card = document.createElement("div");
    card.className = "item-card";

    card.innerHTML = `
      <div class="item-media">
        <img src="${item.imageUrl}" alt="${item.name}" class="item-img" onerror="this.src='https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80'">
        <span class="category-tag">${item.category}</span>
        <button type="button" class="fav-btn ${item.favorite ? 'active' : ''}" onclick="toggleFavorite('${item.id}', event)">
          ${item.favorite ? '★' : '☆'}
        </button>
      </div>

      <div class="item-info">
        <span class="item-brand">${item.brand || 'DripVault'}</span>
        <h4 class="item-name">${item.name}</h4>
        
        <div class="item-meta">
          <div class="color-indicator">
            <span class="color-dot" style="background-color: ${item.colorHex || '#8b5cf6'};"></span>
            <span>${item.colorName || 'Default'}</span>
          </div>

          <div class="item-actions">
            <button type="button" class="icon-action-btn" title="Equip in Fit Studio" onclick="equipInStudio('${item.id}')">✨</button>
            <button type="button" class="icon-action-btn delete" title="Delete Item" onclick="deleteItem('${item.id}')">🗑️</button>
          </div>
        </div>
      </div>
    `;

    gridEl.appendChild(card);
  });
}

// Toggle Favorite State
function toggleFavorite(id, event) {
  if (event) event.stopPropagation();
  const item = inventory.find(i => i.id === id);
  if (item) {
    item.favorite = !item.favorite;
    saveDataToStorage();
    renderClosetGrid();
  }
}

// Delete Item
function deleteItem(id) {
  if (confirm("Are you sure you want to remove this item from your vault?")) {
    inventory = inventory.filter(i => i.id !== id);
    
    // Remove from current studio canvas if equipped
    Object.keys(currentOutfitCanvas).forEach(slot => {
      if (currentOutfitCanvas[slot] && currentOutfitCanvas[slot].id === id) {
        currentOutfitCanvas[slot] = null;
      }
    });

    saveDataToStorage();
    renderAllViews();
    showToast("Item removed from Vault");
  }
}

/* ====================================================== */
/* SMART AUTOCOMPLETE & WEB LOOKUP ENGINE */
/* ====================================================== */
/* SMART AUTOCOMPLETE & DRAG-AND-DROP IMAGE ENGINE */
/* ====================================================== */

function setupDragAndDrop() {
  const dropzone = document.getElementById("imageDropzone");
  if (!dropzone) return;

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, false);
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, () => {
      dropzone.classList.add('drag-over');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, () => {
      dropzone.classList.remove('drag-over');
    }, false);
  });

  dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, false);
}

function triggerFileInput() {
  const fileInput = document.getElementById("itemFileInput");
  if (fileInput) fileInput.click();
}

function handleFileSelect(e) {
  const file = e.target.files && e.target.files[0];
  if (file) {
    processFile(file);
  }
}

function processFile(file) {
  if (!file || !file.type.startsWith("image/")) {
    alert("Please select a valid image file (PNG, JPG, WEBP).");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    uploadedImageDataUrl = e.target.result;
    displayImagePreview(uploadedImageDataUrl);
  };
  reader.readAsDataURL(file);
}

function displayImagePreview(url) {
  const preview = document.getElementById("dropzonePreview");
  const content = document.getElementById("dropzoneContent");
  const img = document.getElementById("previewImg");

  if (img && preview && content) {
    img.src = url;
    preview.style.display = "flex";
    content.style.display = "none";
  }
}

function removeUploadedImage(e) {
  if (e) e.stopPropagation();
  uploadedImageDataUrl = null;
  
  const preview = document.getElementById("dropzonePreview");
  const content = document.getElementById("dropzoneContent");
  const img = document.getElementById("previewImg");
  const fileInput = document.getElementById("itemFileInput");

  if (img) img.src = "";
  if (preview) preview.style.display = "none";
  if (content) content.style.display = "flex";
  if (fileInput) fileInput.value = "";
}

function openAddItemModal() {
  document.getElementById("addItemModal").classList.add("active");
  document.getElementById("itemQueryInput").value = "";
  document.getElementById("itemBrand").value = "";
  document.getElementById("itemColorName").value = "";
  document.getElementById("autocompleteDropdown").classList.remove("active");
  removeUploadedImage();
  document.getElementById("itemQueryInput").focus();
}

function closeAddItemModal() {
  document.getElementById("addItemModal").classList.remove("active");
  removeUploadedImage();
}

function handleSmartTyping(e) {
  const query = e.target.value.trim().toLowerCase();
  const dropdown = document.getElementById("autocompleteDropdown");

  if (query.length < 2) {
    dropdown.classList.remove("active");
    return;
  }

  // Filter catalog by query
  const matches = STREETWEAR_CATALOG.filter(item => 
    item.name.toLowerCase().includes(query) ||
    item.brand.toLowerCase().includes(query) ||
    item.category.toLowerCase().includes(query) ||
    item.colorName.toLowerCase().includes(query)
  );

  if (matches.length === 0) {
    dropdown.classList.remove("active");
    return;
  }

  dropdown.innerHTML = "";
  matches.slice(0, 5).forEach(match => {
    const div = document.createElement("div");
    div.className = "suggestion-item";
    div.onclick = () => selectAutocompleteSuggestion(match);

    div.innerHTML = `
      <img src="${match.imageUrl}" class="suggestion-thumb" alt="${match.name}">
      <div class="suggestion-info">
        <span class="suggestion-title">${match.name}</span>
        <span class="suggestion-category">${match.brand} • ${match.category}</span>
      </div>
    `;

    dropdown.appendChild(div);
  });

  dropdown.classList.add("active");
}

function selectAutocompleteSuggestion(item) {
  document.getElementById("itemQueryInput").value = item.name;
  document.getElementById("itemCategory").value = item.category;
  document.getElementById("itemBrand").value = item.brand;
  document.getElementById("itemColorPicker").value = item.colorHex;
  document.getElementById("itemColorName").value = item.colorName;
  
  if (item.imageUrl) {
    uploadedImageDataUrl = item.imageUrl;
    displayImagePreview(uploadedImageDataUrl);
  }

  document.getElementById("autocompleteDropdown").classList.remove("active");
  showToast(`Autofilled: ${item.name}`);
}

function syncColorInput(hex) {
  document.getElementById("itemColorPicker").value = hex;
}

function saveItemFromModal() {
  const name = document.getElementById("itemQueryInput").value.trim();
  const category = document.getElementById("itemCategory").value;
  const brand = document.getElementById("itemBrand").value.trim() || "Vault Essential";
  const colorHex = document.getElementById("itemColorPicker").value;
  const colorName = document.getElementById("itemColorName").value.trim() || "Custom";
  const season = document.getElementById("itemSeason").value;

  if (!name) {
    alert("Please enter or select an item name!");
    return;
  }

  // Use uploaded/dragged image if provided, catalog match if available, or default image
  let imageUrl = uploadedImageDataUrl;
  
  if (!imageUrl) {
    const catalogMatch = STREETWEAR_CATALOG.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (catalogMatch) {
      imageUrl = catalogMatch.imageUrl;
    } else {
      const FALLBACK_MAP = {
        "Hoodies": "/wardrobe/assets/fog_essentials_hoodie_oatmeal.png",
        "Shorts": "/wardrobe/assets/fog_essentials_shorts_oatmeal.png",
        "Shoes": "/wardrobe/assets/nike_dunk_panda.png",
        "Jackets": "/wardrobe/assets/carhartt_detroit_jacket.png",
        "Shirts": "/wardrobe/assets/stussy_white_tee.png",
        "Pants": "/wardrobe/assets/levis_501_jeans.png",
        "Accessories": "/wardrobe/assets/stussy_white_tee.png"
      };
      imageUrl = FALLBACK_MAP[category] || "/wardrobe/assets/fog_essentials_hoodie_oatmeal.png";
    }
  }

  const newItem = {
    id: `item-${Date.now()}`,
    name,
    brand,
    category,
    colorHex,
    colorName,
    season,
    imageUrl,
    favorite: false,
    wearCount: 0
  };

  inventory.unshift(newItem);
  saveDataToStorage();
  closeAddItemModal();
  renderAllViews();
  showToast(`Added ${name} to your Vault!`);
}

function setupClickOutsideHandlers() {
  document.addEventListener("click", (e) => {
    const dropdown = document.getElementById("autocompleteDropdown");
    const input = document.getElementById("itemQueryInput");
    if (dropdown && !dropdown.contains(e.target) && e.target !== input) {
      dropdown.classList.remove("active");
    }
  });
}

/* ====================================================== */
/* FIT STUDIO & COLOR HARMONY STYLIST ENGINE */
/* ====================================================== */

function equipInStudio(itemId) {
  const item = inventory.find(i => i.id === itemId);
  if (!item) return;

  // Map category to slot
  let slot = "Top";
  if (item.category === "Hoodies" || item.category === "Jackets") slot = "Outerwear";
  else if (item.category === "Shirts") slot = "Top";
  else if (item.category === "Pants" || item.category === "Shorts") slot = "Bottom";
  else if (item.category === "Shoes") slot = "Shoes";
  else if (item.category === "Accessories") slot = "Accessory";

  currentOutfitCanvas[slot] = item;
  switchTab("studio");
  renderFitStudioCanvas();
  showToast(`Equipped ${item.name} in ${slot} slot!`);
}

function renderFitStudioCanvas() {
  const slots = ["Outerwear", "Top", "Bottom", "Shoes", "Accessory"];

  slots.forEach(slot => {
    const el = document.getElementById(`slot${slot}`);
    if (!el) return;

    const equipped = currentOutfitCanvas[slot];

    if (equipped) {
      el.innerHTML = `
        <div class="slot-filled-card">
          <img src="${equipped.imageUrl}" class="slot-item-thumb" alt="${equipped.name}">
          <div class="slot-item-details">
            <span class="slot-item-brand">${equipped.brand}</span>
            <span class="slot-item-title">${equipped.name}</span>
          </div>
          <button type="button" class="slot-remove-btn" title="Remove" onclick="unequipSlot('${slot}', event)">&times;</button>
        </div>
      `;
    } else {
      el.innerHTML = `
        <div class="slot-empty-prompt">
          <span>➕</span> Select ${slot}
        </div>
      `;
    }
  });

  calculateColorHarmonyScore();
}

function unequipSlot(slot, event) {
  if (event) event.stopPropagation();
  currentOutfitCanvas[slot] = null;
  renderFitStudioCanvas();
}

function clearStudioCanvas() {
  currentOutfitCanvas = { Outerwear: null, Top: null, Bottom: null, Shoes: null, Accessory: null };
  renderFitStudioCanvas();
  showToast("Canvas Reset");
}

function openSlotPicker(slot) {
  activePickingSlot = slot;
  const modal = document.getElementById("slotPickerModal");
  const titleEl = document.getElementById("slotPickerTitle");
  const gridEl = document.getElementById("slotPickerGrid");

  titleEl.textContent = `Select ${slot} from Closet`;
  gridEl.innerHTML = "";

  // Map slot to eligible categories
  let validCats = [];
  if (slot === "Outerwear") validCats = ["Hoodies", "Jackets"];
  else if (slot === "Top") validCats = ["Shirts", "Hoodies"];
  else if (slot === "Bottom") validCats = ["Pants", "Shorts"];
  else if (slot === "Shoes") validCats = ["Shoes"];
  else if (slot === "Accessory") validCats = ["Accessories"];

  const eligible = inventory.filter(i => validCats.includes(i.category));

  if (eligible.length === 0) {
    gridEl.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">No items in closet for ${slot}. Add some first!</p>`;
  } else {
    eligible.forEach(item => {
      const card = document.createElement("div");
      card.className = "item-card";
      card.style.cursor = "pointer";
      card.onclick = () => {
        currentOutfitCanvas[slot] = item;
        closeSlotPicker();
        renderFitStudioCanvas();
      };

      card.innerHTML = `
        <div class="item-media" style="height: 110px;">
          <img src="${item.imageUrl}" class="item-img" alt="${item.name}">
        </div>
        <div class="item-info" style="padding: 8px;">
          <span class="item-brand" style="font-size: 0.65rem;">${item.brand}</span>
          <span class="item-name" style="font-size: 0.8rem;">${item.name}</span>
        </div>
      `;

      gridEl.appendChild(card);
    });
  }

  modal.classList.add("active");
}

function closeSlotPicker() {
  document.getElementById("slotPickerModal").classList.remove("active");
}

// AI Color Harmony Score Calculation
function calculateColorHarmonyScore() {
  const equippedList = Object.values(currentOutfitCanvas).filter(Boolean);
  
  const scoreText = document.getElementById("harmonyScoreText");
  const vibeTag = document.getElementById("harmonyVibeTag");
  const vibeDesc = document.getElementById("harmonyVibeDesc");
  const circle = document.getElementById("harmonyCircle");

  if (equippedList.length === 0) {
    scoreText.textContent = "0%";
    vibeTag.textContent = "Empty Canvas";
    vibeDesc.textContent = "Add pieces to evaluate fit color harmony.";
    circle.style.background = `conic-gradient(rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.1) 100%)`;
    return;
  }

  // Base score depends on items equipped
  let baseScore = 70 + (equippedList.length * 5);

  // Check color palette cohesion
  const colors = equippedList.map(i => i.colorHex || "#ffffff");
  const hasNeutral = colors.some(c => c.toLowerCase().includes("#d6cfc4") || c.toLowerCase().includes("#ffffff") || c.toLowerCase().includes("#111111") || c.toLowerCase().includes("#4b6584"));

  if (hasNeutral) baseScore += 10;
  if (baseScore > 98) baseScore = 98;

  scoreText.textContent = `${baseScore}%`;
  circle.style.background = `conic-gradient(var(--accent-purple) 0%, var(--accent-purple) ${baseScore}%, rgba(255,255,255,0.1) ${baseScore}%)`;

  if (baseScore >= 90) {
    vibeTag.textContent = "Streetwear Essential ⚡";
    vibeDesc.textContent = "Perfect tonal balance with high-vibe contrast.";
  } else if (baseScore >= 80) {
    vibeTag.textContent = "Clean Daily Drip ✨";
    vibeDesc.textContent = "Harmonious combination for daily wear.";
  } else {
    vibeTag.textContent = "Bold Experimental Fit 🎨";
    vibeDesc.textContent = "Unique palette contrast.";
  }
}

// AI Stylist Auto-Outfit Generator
function generateAiOutfit() {
  const occasion = document.getElementById("generatorOccasion").value;

  const tops = inventory.filter(i => i.category === "Shirts" || i.category === "Hoodies");
  const outerwears = inventory.filter(i => i.category === "Jackets" || i.category === "Hoodies");
  const bottoms = inventory.filter(i => i.category === "Pants" || i.category === "Shorts");
  const shoesList = inventory.filter(i => i.category === "Shoes");
  const accessories = inventory.filter(i => i.category === "Accessories");

  if (inventory.length < 2) {
    alert("Please add at least 2 or 3 items to your Vault first so the AI Stylist can generate fits!");
    return;
  }

  function pickRandom(arr) {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  if (occasion === "cozy") {
    // Hoodie + Shorts
    currentOutfitCanvas.Outerwear = pickRandom(inventory.filter(i => i.category === "Hoodies")) || pickRandom(outerwears);
    currentOutfitCanvas.Top = pickRandom(inventory.filter(i => i.category === "Shirts"));
    currentOutfitCanvas.Bottom = pickRandom(inventory.filter(i => i.category === "Shorts")) || pickRandom(bottoms);
    currentOutfitCanvas.Shoes = pickRandom(shoesList);
    currentOutfitCanvas.Accessory = pickRandom(accessories);
  } else {
    currentOutfitCanvas.Outerwear = pickRandom(outerwears);
    currentOutfitCanvas.Top = pickRandom(tops);
    currentOutfitCanvas.Bottom = pickRandom(bottoms);
    currentOutfitCanvas.Shoes = pickRandom(shoesList);
    currentOutfitCanvas.Accessory = pickRandom(accessories);
  }

  renderFitStudioCanvas();
  showToast("AI Generated New Fit!");
}

/* ====================================================== */
/* LOOKBOOK / SAVED OUTFITS */
/* ====================================================== */

function saveCurrentOutfit() {
  const equippedList = Object.values(currentOutfitCanvas).filter(Boolean);
  if (equippedList.length < 2) {
    alert("Please equip at least 2 pieces (e.g. Top + Bottoms) to save an outfit!");
    return;
  }

  const name = prompt("Name your new outfit:", "Cozy Essentials Fit") || "Styled Fit";

  const outfit = {
    id: `outfit-${Date.now()}`,
    name,
    dateSaved: new Date().toLocaleDateString(),
    items: [...equippedList]
  };

  savedOutfits.unshift(outfit);
  saveDataToStorage();
  renderStatsBar();
  showToast(`Saved "${name}" to Lookbook!`);
}

function renderLookbook() {
  const gridEl = document.getElementById("lookbookGrid");
  const emptyEl = document.getElementById("lookbookEmptyState");
  if (!gridEl) return;

  gridEl.innerHTML = "";

  if (savedOutfits.length === 0) {
    emptyEl.style.display = "flex";
    gridEl.style.display = "none";
    return;
  }

  emptyEl.style.display = "none";
  gridEl.style.display = "grid";

  savedOutfits.forEach(outfit => {
    const card = document.createElement("div");
    card.className = "lookbook-card";

    const thumbsHtml = outfit.items.map(item => `
      <img src="${item.imageUrl}" class="lookbook-thumb" title="${item.name}" alt="${item.name}">
    `).join("");

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h4 style="font-family: 'Space Grotesk', sans-serif; font-size: 1.05rem; color: #ffffff;">${outfit.name}</h4>
        <button type="button" class="icon-action-btn delete" onclick="deleteOutfit('${outfit.id}')">🗑️</button>
      </div>

      <div class="lookbook-items-preview">
        ${thumbsHtml}
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 10px;">
        <span style="font-size: 0.75rem; color: var(--text-muted);">Saved ${outfit.dateSaved}</span>
        <button type="button" class="btn-secondary" style="padding: 6px 12px; font-size: 0.78rem;" onclick="equipLookbookOutfit('${outfit.id}')">
          ✨ Wear Fit
        </button>
      </div>
    `;

    gridEl.appendChild(card);
  });
}

function deleteOutfit(id) {
  if (confirm("Delete this outfit from Lookbook?")) {
    savedOutfits = savedOutfits.filter(o => o.id !== id);
    saveDataToStorage();
    renderStatsBar();
    renderLookbook();
    showToast("Outfit removed");
  }
}

function equipLookbookOutfit(id) {
  const outfit = savedOutfits.find(o => o.id === id);
  if (!outfit) return;

  clearStudioCanvas();
  outfit.items.forEach(item => {
    let slot = "Top";
    if (item.category === "Hoodies" || item.category === "Jackets") slot = "Outerwear";
    else if (item.category === "Shirts") slot = "Top";
    else if (item.category === "Pants" || item.category === "Shorts") slot = "Bottom";
    else if (item.category === "Shoes") slot = "Shoes";
    else if (item.category === "Accessories") slot = "Accessory";
    
    currentOutfitCanvas[slot] = item;
  });

  switchTab("studio");
  showToast(`Equipped "${outfit.name}" in Fit Studio!`);
}

// Toast Popup Notification
function showToast(msg) {
  const toast = document.createElement("div");
  toast.className = "toast-msg";
  toast.innerHTML = `<span>✨</span> ${msg}`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 2400);
}
