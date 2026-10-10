// SHARK BAIT: Underwater Go Fish Engine

const SUITS = [
  { name: 'clownfish', icon: 'assets/clownfish.svg', color: '#f97316' },
  { name: 'jellyfish', icon: 'assets/jellyfish.svg', color: '#c084fc' },
  { name: 'sea_turtle', icon: 'assets/sea_turtle.svg', color: '#4ade80' },
  { name: 'hammerhead', icon: 'assets/hammerhead.svg', color: '#38bdf8' }
];

const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Game State Variables
let deck = [];
let playerHand = [];
let sharkHand = [];
let playerBooks = [];
let sharkBooks = [];
let isPlayerTurn = true;
let mustGoFish = false;
let pendingRequestedRank = null;
let sharkMemory = new Set();
let isAudioEnabled = true;

// Web Audio API Synthesizer
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
  if (!isAudioEnabled) return;
  try {
    const now = audioCtx.currentTime;
    if (type === 'bubble') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(now + 0.1);
    } else if (type === 'card') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(now + 0.08);
    } else if (type === 'chomp') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(60, now + 0.2);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(now + 0.2);
    } else if (type === 'book') {
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.12, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.2);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.2);
      });
    }
  } catch(e) {}
}

function toggleAudio() {
  isAudioEnabled = !isAudioEnabled;
  const btn = document.getElementById('btnAudio');
  if (btn) btn.textContent = isAudioEnabled ? '🔊' : '🔇';
  showToast(isAudioEnabled ? "Audio FX Enabled 🔊" : "Audio FX Muted 🔇");
}

// Initialize New Game
function resetGame() {
  deck = createDeck();
  shuffleDeck(deck);

  playerHand = [];
  sharkHand = [];
  playerBooks = [];
  sharkBooks = [];
  sharkMemory.clear();
  isPlayerTurn = true;
  mustGoFish = false;
  pendingRequestedRank = null;

  // Deal 7 cards each
  for (let i = 0; i < 7; i++) {
    if (deck.length > 0) playerHand.push(deck.pop());
    if (deck.length > 0) sharkHand.push(deck.pop());
  }

  // Sort player hand by rank for easy readability
  sortHand(playerHand);

  // Check for any initial 4-of-a-kind books
  checkForBooks(playerHand, playerBooks, 'Player');
  checkForBooks(sharkHand, sharkBooks, 'Finley');

  document.getElementById('gameOverModal').classList.remove('active');
  updateUI();
  updateSharkSpeech("Welcome to my reef! Click any card in your hand to ask me for a rank.");
  showToast("🌊 New Game Started! Select a card to ask Captain Finley.");
}

// Deck Creation & Shuffling
function createDeck() {
  const newDeck = [];
  let id = 1;
  SUITS.forEach(suit => {
    RANKS.forEach(rank => {
      newDeck.push({ id: id++, rank, suit: suit.name, icon: suit.icon, color: suit.color });
    });
  });
  return newDeck;
}

function shuffleDeck(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function sortHand(hand) {
  hand.sort((a, b) => RANKS.indexOf(a.rank) - RANKS.indexOf(b.rank));
}

// Book Checking (4-of-a-kind)
function checkForBooks(hand, booksArray, playerName) {
  const counts = {};
  hand.forEach(c => {
    counts[c.rank] = (counts[c.rank] || 0) + 1;
  });

  Object.keys(counts).forEach(rank => {
    if (counts[rank] === 4) {
      booksArray.push(rank);
      // Remove all 4 cards from hand
      for (let i = hand.length - 1; i >= 0; i--) {
        if (hand[i].rank === rank) {
          hand.splice(i, 1);
        }
      }
      playSound('book');
      showToast(`🎉 ${playerName} completed a book of ${rank}s! 📖`);
    }
  });

  checkHandRefill();
  checkGameOver();
}

function checkHandRefill() {
  if (playerHand.length === 0 && deck.length > 0) {
    const drawCount = Math.min(5, deck.length);
    for (let i = 0; i < drawCount; i++) {
      playerHand.push(deck.pop());
    }
    sortHand(playerHand);
    showToast(`🎣 Player drew ${drawCount} replacement cards!`);
  }
  if (sharkHand.length === 0 && deck.length > 0) {
    const drawCount = Math.min(5, deck.length);
    for (let i = 0; i < drawCount; i++) {
      sharkHand.push(deck.pop());
    }
    showToast(`🦈 Captain Finley drew ${drawCount} replacement cards!`);
  }
}

// Player Turn: Asking Shark for a rank
function askSharkForRank(rank) {
  if (!isPlayerTurn || mustGoFish) return;

  playSound('card');
  pendingRequestedRank = rank;
  sharkMemory.add(rank); // Shark remembers player asked for this rank!

  // Check if Shark holds matching rank
  const matches = sharkHand.filter(c => c.rank === rank);

  if (matches.length > 0) {
    // 🦈 Shark HAS the requested rank! Transfer cards to Player
    playSound('chomp');
    sharkHand = sharkHand.filter(c => c.rank !== rank);
    playerHand.push(...matches);
    sortHand(playerHand);

    updateSharkSpeech(`Argh! You got me... Here are my ${matches.length} ${rank}${matches.length > 1 ? 's' : ''}! 🦈`);
    showToast(`🎯 Got ${matches.length} ${rank}(s) from Captain Finley! Take another turn!`);

    checkForBooks(playerHand, playerBooks, 'Player');
    updateUI();
  } else {
    // 🌊 Shark DOES NOT have rank -> GO FISH!
    mustGoFish = true;
    updateSharkSpeech(`GO FISH! 🌊 I don't have any ${rank}s! Click the Ocean Deck to draw.`);
    showToast(`🌊 Captain Finley says GO FISH! Click the Ocean Deck.`);
    updateUI();
  }
}

// Draw Pile Click Handler (Go Fish action)
function handleDrawPileClick() {
  if (!isPlayerTurn || !mustGoFish) {
    if (isPlayerTurn && !mustGoFish) {
      showToast("Select a card in your hand first!");
    }
    return;
  }

  if (deck.length === 0) {
    showToast("The Ocean Deck is empty!");
    mustGoFish = false;
    switchTurnToShark();
    return;
  }

  playSound('bubble');
  const drawnCard = deck.pop();
  playerHand.push(drawnCard);
  sortHand(playerHand);
  mustGoFish = false;

  checkForBooks(playerHand, playerBooks, 'Player');

  if (drawnCard.rank === pendingRequestedRank) {
    // Lucky catch!
    playSound('book');
    updateSharkSpeech(`Lucky catch! You drew a ${drawnCard.rank}! You get another turn! 🍀`);
    showToast(`🎣 LUCKY CATCH! You drew a ${drawnCard.rank}! Take another turn!`);
    updateUI();
  } else {
    updateSharkSpeech(`You drew a ${drawnCard.rank}. Now it's MY turn! 🦈`);
    showToast(`Drew a ${drawnCard.rank}. Turn passes to Captain Finley.`);
    updateUI();
    setTimeout(switchTurnToShark, 1400);
  }
}

// Switch Turn to Shark AI
function switchTurnToShark() {
  if (checkGameOver()) return;

  isPlayerTurn = false;
  mustGoFish = false;
  updateUI();
  updateSharkSpeech("Thinking... Sizing up your hand 🦈💭");

  setTimeout(executeSharkTurn, 1500);
}

// Shark AI Logic
function executeSharkTurn() {
  if (checkGameOver() || sharkHand.length === 0) {
    isPlayerTurn = true;
    updateUI();
    return;
  }

  // 1. Pick rank to ask for: Prefer rank in Shark's hand that Shark remembers Player asking for!
  const sharkRanksInHand = Array.from(new Set(sharkHand.map(c => c.rank)));
  let chosenRank = null;

  for (let r of sharkRanksInHand) {
    if (sharkMemory.has(r)) {
      chosenRank = r;
      break;
    }
  }

  // Otherwise pick random rank from Shark's hand
  if (!chosenRank) {
    chosenRank = sharkRanksInHand[Math.floor(Math.random() * sharkRanksInHand.length)];
  }

  playSound('chomp');
  updateSharkSpeech(`Got any ${chosenRank}s, land-lubber? 🦈`);
  showToast(`🦈 Captain Finley asks: "Got any ${chosenRank}s?"`);

  setTimeout(() => {
    // Check Player's hand for matching rank
    const matches = playerHand.filter(c => c.rank === chosenRank);

    if (matches.length > 0) {
      // Player HAS cards! Give them to Shark
      playerHand = playerHand.filter(c => c.rank !== chosenRank);
      sharkHand.push(...matches);

      playSound('chomp');
      updateSharkSpeech(`Aha! Hand over those ${matches.length} ${chosenRank}${matches.length > 1 ? 's' : ''}! 🦈`);
      showToast(`🦈 Finley took ${matches.length} ${chosenRank}(s) from you! Finley goes again.`);

      checkForBooks(sharkHand, sharkBooks, 'Finley');
      updateUI();

      // Shark gets another turn!
      setTimeout(executeSharkTurn, 1800);
    } else {
      // Player DOES NOT have rank -> Shark Go Fish!
      updateSharkSpeech(`Argh! No ${chosenRank}s? Guess I'll GO FISH... 🌊`);
      showToast(`🌊 Finley went fishing in the Ocean Deck!`);

      if (deck.length > 0) {
        playSound('bubble');
        const drawnCard = deck.pop();
        sharkHand.push(drawnCard);
        checkForBooks(sharkHand, sharkBooks, 'Finley');

        if (drawnCard.rank === chosenRank) {
          updateSharkSpeech(`Aha! I drew a ${chosenRank}! Finley goes again! 🦈`);
          showToast(`🦈 Finley drew a ${chosenRank}! Finley goes again.`);
          updateUI();
          setTimeout(executeSharkTurn, 1800);
          return;
        }
      }

      // Turn switches back to Player
      isPlayerTurn = true;
      updateUI();
      updateSharkSpeech("Your turn, land-lubber! Choose a card.");
    }
  }, 1600);
}

// Game Over Check
function checkGameOver() {
  const totalBooks = playerBooks.length + sharkBooks.length;

  if (totalBooks === 13 || (deck.length === 0 && playerHand.length === 0 && sharkHand.length === 0)) {
    setTimeout(showGameOverModal, 600);
    return true;
  }
  return false;
}

function showGameOverModal() {
  const modal = document.getElementById('gameOverModal');
  const title = document.getElementById('gameOverTitle');
  const sub = document.getElementById('gameOverSub');
  const pVal = document.getElementById('finalPlayerBooks');
  const sVal = document.getElementById('finalSharkBooks');

  pVal.textContent = playerBooks.length;
  sVal.textContent = sharkBooks.length;

  if (playerBooks.length > sharkBooks.length) {
    title.textContent = "YOU WIN! 🏆";
    sub.textContent = `You outsmarted Captain Finley ${playerBooks.length} to ${sharkBooks.length}!`;
    playSound('book');
    triggerConfetti();
  } else if (sharkBooks.length > playerBooks.length) {
    title.textContent = "FINLEY WINS! 🦈";
    sub.textContent = `Captain Finley won ${sharkBooks.length} to ${playerBooks.length}. Better luck next time!`;
    playSound('chomp');
  } else {
    title.textContent = "TIED GAME! 🤝";
    sub.textContent = `An even split of ${playerBooks.length} books each!`;
  }

  modal.classList.add('active');
}

// UI Updating Function
function updateUI() {
  // Update Score Board & Badges
  document.getElementById('playerBooksCount').textContent = playerBooks.length;
  document.getElementById('sharkBooksCount').textContent = sharkBooks.length;
  document.getElementById('sharkCardsBadge').textContent = `${sharkHand.length} CARDS`;
  document.getElementById('deckCountBadge').textContent = `${deck.length} CARDS LEFT`;

  // Render Shark Face-Down Hand
  const sharkHandContainer = document.getElementById('sharkHandDisplay');
  sharkHandContainer.innerHTML = '';
  for (let i = 0; i < sharkHand.length; i++) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'shark-card-hidden';
    sharkHandContainer.appendChild(cardDiv);
  }

  // Render Player Hand
  const playerHandContainer = document.getElementById('playerHand');
  playerHandContainer.innerHTML = '';

  playerHand.forEach(card => {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'playing-card';
    cardDiv.onclick = () => askSharkForRank(card.rank);

    cardDiv.innerHTML = `
      <div class="card-corner top">
        <span class="card-rank">${card.rank}</span>
        <img src="${card.icon}" class="card-suit-icon" alt="${card.suit}" />
      </div>
      <img src="${card.icon}" class="card-center-icon" alt="${card.suit}" />
      <div class="card-corner bottom">
        <span class="card-rank">${card.rank}</span>
        <img src="${card.icon}" class="card-suit-icon" alt="${card.suit}" />
      </div>
    `;
    playerHandContainer.appendChild(cardDiv);
  });

  // Render Books Lists
  renderBooksDisplay('playerBooksList', playerBooks);
  renderBooksDisplay('sharkBooksList', sharkBooks);

  // Render Turn Banner Status
  const turnBanner = document.getElementById('turnBanner');
  const turnIndicator = document.getElementById('turnIndicator');
  const turnInstruction = document.getElementById('turnInstruction');

  if (isPlayerTurn) {
    turnBanner.classList.remove('shark-turn');
    turnIndicator.textContent = "YOUR TURN";
    if (mustGoFish) {
      turnInstruction.textContent = "Click the Ocean Deck to GO FISH! 🌊";
    } else {
      turnInstruction.textContent = "Select a card from your hand to ask Captain Finley!";
    }
  } else {
    turnBanner.classList.add('shark-turn');
    turnIndicator.textContent = "FINLEY'S TURN";
    turnInstruction.textContent = "Captain Finley is making a move...";
  }
}

function renderBooksDisplay(containerId, books) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  books.forEach(rank => {
    const chip = document.createElement('div');
    chip.className = 'book-chip';
    chip.textContent = `${rank}s`;
    container.appendChild(chip);
  });
}

function updateSharkSpeech(text) {
  const bubble = document.getElementById('sharkSpeech');
  if (bubble) {
    bubble.textContent = text;
  }
}

function showToast(msg, duration = 3000) {
  const toast = document.getElementById('toastBanner');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// Confetti Engine for Victory
function triggerConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#38bdf8', '#818cf8', '#34d399', '#fbbf24', '#f43f5e', '#ffffff'];

  for (let i = 0; i < 150; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 20,
      vy: (Math.random() - 0.7) * 20,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 1
    });
  }

  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.4;
      p.opacity -= 0.01;
      if (p.opacity > 0) {
        alive = true;
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
    });
    if (alive) requestAnimationFrame(update);
  }
  update();
}

// Ocean Canvas Particle Effect (Floating Bubbles & Caustics)
function initOceanCanvas() {
  const canvas = document.getElementById('oceanCanvas');
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const bubbles = [];
  for (let i = 0; i < 40; i++) {
    bubbles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 6 + 2,
      speed: Math.random() * 1.2 + 0.4,
      swing: Math.random() * 0.05
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Deep ocean gradient background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGrad.addColorStop(0, '#0a192f');
    bgGrad.addColorStop(0.5, '#020c1b');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw floating bubbles
    bubbles.forEach(b => {
      b.y -= b.speed;
      b.x += Math.sin(b.y * b.swing) * 0.5;

      if (b.y < -10) {
        b.y = canvas.height + 10;
        b.x = Math.random() * canvas.width;
      }

      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.stroke();
    });

    requestAnimationFrame(animate);
  }
  animate();
}

// Start Game on Page Load
window.addEventListener('DOMContentLoaded', () => {
  initOceanCanvas();
  resetGame();
});
