// SHARK BAIT: Underwater Go Fish Engine (Zero Emojis - Vector SVG & Clean Text Only)

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

// 1v1 Challenge Mode Variables
const urlParams = new URLSearchParams(window.location.search);
const is1v1Mode = urlParams.get('mode') === '1v1';
const matchId = urlParams.get('match') || '1v1_default';
const playerRole = urlParams.get('role') || 'host'; // 'host' or 'guest'
const opponentName = (urlParams.get('opp') || (playerRole === 'host' ? 'Challenger' : 'Host')).trim();

const matchChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('elywolf_gofish_' + matchId) : null;
const globalSyncChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('elywolf_arcade_sync') : null;
let remoteOpponentConnected = false;

// Web Audio API High-Fidelity Sound Engine
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playSound(type) {
  if (!isAudioEnabled) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    if (type === 'card') {
      // Crisp card flick/snap with wood-table resonance
      const bufferSize = ctx.sampleRate * 0.035;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.Q.setValueAtTime(2.5, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.35, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);

      // Low tactile body thud
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(200, now);
      sub.frequency.exponentialRampToValueAtTime(60, now + 0.04);
      subGain.gain.setValueAtTime(0.2, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      sub.connect(subGain);
      subGain.connect(ctx.destination);
      sub.start(now);
      sub.stop(now + 0.04);
    } else if (type === 'bubble') {
      // Juicy underwater bubble pop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startFreq = 320 + Math.random() * 60;
      const endFreq = 1100 + Math.random() * 250;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.08);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.085);
    } else if (type === 'chomp') {
      // Heavy shark bite & sub punch
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = 'triangle';
      sub.frequency.setValueAtTime(180, now);
      sub.frequency.exponentialRampToValueAtTime(40, now + 0.2);
      subGain.gain.setValueAtTime(0.45, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      sub.connect(subGain);
      subGain.connect(ctx.destination);
      sub.start(now);
      sub.stop(now + 0.2);

      // Gritty jaw bite snap
      const bufferSize = ctx.sampleRate * 0.12;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, now);
      filter.frequency.linearRampToValueAtTime(250, now + 0.12);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.4, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);
    } else if (type === 'book') {
      // Ultra-satisfying 4-of-a-kind triumph chime (Rich harmonic arpeggio + sub pulse)
      const chord = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
      chord.forEach((freq, idx) => {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        const gain2 = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq, now + idx * 0.055);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq * 1.0025, now + idx * 0.055);

        gain1.gain.setValueAtTime(0, now + idx * 0.055);
        gain1.gain.linearRampToValueAtTime(0.2, now + idx * 0.055 + 0.015);
        gain1.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.055 + 0.45);

        gain2.gain.setValueAtTime(0, now + idx * 0.055);
        gain2.gain.linearRampToValueAtTime(0.1, now + idx * 0.055 + 0.015);
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.055 + 0.45);

        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);

        osc1.start(now + idx * 0.055);
        osc1.stop(now + idx * 0.055 + 0.5);
        osc2.start(now + idx * 0.055);
        osc2.stop(now + idx * 0.055 + 0.5);
      });
    } else if (type === 'lucky') {
      // Sparkly magical reward chime for drawing requested card
      const scale = [659.25, 880, 1046.50, 1318.51, 1760];
      scale.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);

        gain.gain.setValueAtTime(0.2, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.4);
      });
    } else if (type === 'win') {
      // Epic Victory Fanfare
      const notes = [
        { f: 523.25, t: 0, d: 0.14 },
        { f: 659.25, t: 0.14, d: 0.14 },
        { f: 783.99, t: 0.28, d: 0.14 },
        { f: 1046.50, t: 0.42, d: 0.7 }
      ];
      notes.forEach(n => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.f, now + n.t);
        gain.gain.setValueAtTime(0.3, now + n.t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + n.t);
        osc.stop(now + n.t + n.d);
      });
    } else if (type === 'lose') {
      // Deep ominous underwater defeat tone
      const notes = [440, 415.30, 392, 349.23];
      notes.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now + idx * 0.18);
        gain.gain.setValueAtTime(0.25, now + idx * 0.18);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.18 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.18);
        osc.stop(now + idx * 0.18 + 0.3);
      });
    } else if (type === 'hover') {
      // Subtle crisp UI hover tick
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(950, now + 0.02);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.02);
    }
  } catch(e) {}
}

// YouTube Background Music Integration (Queue: HVN ON EARTH -> 500 lbs)
const MUSIC_QUEUE = ['NSCZ5awmH1U', '35-MnoI1drY'];
let ytPlayer = null;

function initYTMusicPlayer() {
  if (ytPlayer) return;
  if (!window.YT || !window.YT.Player) return;

  try {
    ytPlayer = new YT.Player('ytMusicPlayer', {
      height: '0',
      width: '0',
      playerVars: {
        playlist: MUSIC_QUEUE.join(','),
        autoplay: 1,
        loop: 1,
        controls: 0,
        enablejsapi: 1
      },
      events: {
        'onReady': (e) => {
          try {
            e.target.setVolume(50);
            if (typeof e.target.loadPlaylist === 'function') {
              e.target.loadPlaylist(MUSIC_QUEUE);
              e.target.setLoop(true);
            }
            if (isAudioEnabled) {
              e.target.unMute();
              e.target.playVideo();
            } else {
              e.target.mute();
            }
          } catch(err) {}
        }
      }
    });
  } catch(e) {}
}

window.onYouTubeIframeAPIReady = function() {
  initYTMusicPlayer();
};

if (window.YT && window.YT.Player) {
  initYTMusicPlayer();
}

function startBackgroundMusicOnInteraction() {
  if (ytPlayer && typeof ytPlayer.playVideo === 'function') {
    if (isAudioEnabled) {
      try {
        ytPlayer.unMute();
        if (ytPlayer.getPlayerState() !== 1) { // 1 = playing
          ytPlayer.playVideo();
        }
      } catch(err) {}
    }
  }
}

document.addEventListener('click', () => {
  getAudioContext();
  startBackgroundMusicOnInteraction();
});

function toggleAudio() {
  isAudioEnabled = !isAudioEnabled;
  const btn = document.getElementById('btnAudio');
  if (btn) {
    btn.innerHTML = `<img src="assets/${isAudioEnabled ? 'audio_on' : 'audio_off'}.svg" class="btn-svg-icon" alt="Audio" />`;
  }
  if (ytPlayer && typeof ytPlayer.mute === 'function') {
    try {
      if (isAudioEnabled) {
        ytPlayer.unMute();
        ytPlayer.playVideo();
      } else {
        ytPlayer.mute();
      }
    } catch(err) {}
  }
  showToast(isAudioEnabled ? "Audio FX & Music Enabled" : "Audio FX & Music Muted");
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
  isPlayerTurn = is1v1Mode ? (playerRole === 'host') : true;
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
  checkForBooks(sharkHand, sharkBooks, is1v1Mode ? opponentName : 'Finley');

  document.getElementById('gameOverModal').classList.remove('active');
  updateUI();

  if (is1v1Mode) {
    if (isPlayerTurn) {
      updateSharkSpeech(`⚔️ 1v1 MATCH vs ${opponentName}! Select a card from your hand to ask ${opponentName}.`);
      showToast(`1v1 Match Started! Your turn vs ${opponentName}.`);
    } else {
      updateSharkSpeech(`⚔️ 1v1 MATCH vs ${opponentName}! Waiting for ${opponentName}'s move...`);
      showToast(`1v1 Match Started! ${opponentName}'s turn first.`);
    }

    if (matchChannel) {
      if (playerRole === 'host') {
        matchChannel.postMessage({
          type: '1V1_INIT',
          hostHandCount: playerHand.length,
          guestHand: sharkHand,
          deckCount: deck.length,
          turn: 'host'
        });
      } else {
        matchChannel.postMessage({ type: '1V1_GUEST_HELLO' });
      }
    }
  } else {
    updateSharkSpeech("Welcome to my reef, land-lubber! Select a card from your hand to ask me for a rank.");
    showToast("New Game Started! Select a card to ask Captain Finley.");
  }
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
      showToast(`${playerName} completed a book of ${rank}s!`);
      if (is1v1Mode && matchChannel) {
        matchChannel.postMessage({
          type: '1V1_BOOK_COMPLETED',
          from: playerRole,
          rank,
          bookCount: booksArray.length
        });
      }
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
    showToast(`Player drew ${drawCount} replacement cards!`);
  }
  if (sharkHand.length === 0 && deck.length > 0) {
    const drawCount = Math.min(5, deck.length);
    for (let i = 0; i < drawCount; i++) {
      sharkHand.push(deck.pop());
    }
    showToast(`${is1v1Mode ? opponentName : 'Captain Finley'} drew ${drawCount} replacement cards!`);
  }
}

// Player Turn: Asking Opponent for a rank
function askSharkForRank(rank) {
  if (!isPlayerTurn || mustGoFish) return;

  playSound('card');
  pendingRequestedRank = rank;
  sharkMemory.add(rank);

  if (is1v1Mode && matchChannel) {
    matchChannel.postMessage({
      type: '1V1_ASK_RANK',
      from: playerRole,
      rank
    });
  }

  // Check if Opponent holds matching rank
  const matches = sharkHand.filter(c => c.rank === rank);

  if (matches.length > 0) {
    playSound('chomp');
    sharkHand = sharkHand.filter(c => c.rank !== rank);
    playerHand.push(...matches);
    sortHand(playerHand);

    const oppLabel = is1v1Mode ? opponentName : 'Captain Finley';
    updateSharkSpeech(`${oppLabel}: "You got me! Here are my ${matches.length} ${rank}${matches.length > 1 ? 's' : ''}!"`);
    showToast(`Got ${matches.length} ${rank}(s) from ${oppLabel}! Take another turn!`);

    checkForBooks(playerHand, playerBooks, 'Player');
    updateUI();
  } else {
    // Opponent does NOT have rank -> GO FISH!
    mustGoFish = true;
    const oppLabel = is1v1Mode ? opponentName : 'Captain Finley';
    updateSharkSpeech(`${oppLabel}: "GO FISH! I don't have any ${rank}s! Click the Ocean Deck to draw."`);
    showToast(`${oppLabel} says GO FISH! Click the Ocean Deck.`);
    updateUI();
  }
}

// Switch Turn to Opponent
function switchTurnToShark() {
  if (checkGameOver()) return;

  isPlayerTurn = false;
  mustGoFish = false;
  updateUI();
  const oppLabel = is1v1Mode ? opponentName : 'Captain Finley';
  updateSharkSpeech(`${oppLabel} is making a move...`);

  setTimeout(executeSharkTurn, 1400);
}

// Opponent Turn Logic
function executeSharkTurn() {
  if (checkGameOver() || sharkHand.length === 0) {
    isPlayerTurn = true;
    updateUI();
    return;
  }

  // Pick rank to ask for
  const oppRanksInHand = Array.from(new Set(sharkHand.map(c => c.rank)));
  let chosenRank = null;

  for (let r of oppRanksInHand) {
    if (sharkMemory.has(r)) {
      chosenRank = r;
      break;
    }
  }

  if (!chosenRank) {
    chosenRank = oppRanksInHand[Math.floor(Math.random() * oppRanksInHand.length)];
  }

  const oppLabel = is1v1Mode ? opponentName : 'Captain Finley';
  updateSharkSpeech(`${oppLabel}: "Got any ${chosenRank}s?"`);
  playSound('card');

  setTimeout(() => {
    const playerMatches = playerHand.filter(c => c.rank === chosenRank);

    if (playerMatches.length > 0) {
      playSound('chomp');
      playerHand = playerHand.filter(c => c.rank !== chosenRank);
      sharkHand.push(...playerMatches);
      sortHand(playerHand);

      updateSharkSpeech(`${oppLabel}: "Thanks for the ${playerMatches.length} ${chosenRank}${playerMatches.length > 1 ? 's' : ''}! Going again!"`);
      showToast(`${oppLabel} took ${playerMatches.length} ${chosenRank}(s) from you!`);

      checkForBooks(sharkHand, sharkBooks, oppLabel);
      updateUI();

      if (!checkGameOver()) {
        setTimeout(executeSharkTurn, 1400);
      }
    } else {
      updateSharkSpeech(`You: "GO FISH!" ${oppLabel} draws from the Ocean Deck.`);
      showToast(`You said GO FISH! ${oppLabel} draws a card.`);

      setTimeout(() => {
        if (deck.length > 0) {
          playSound('bubble');
          const drawn = deck.pop();
          sharkHand.push(drawn);

          checkForBooks(sharkHand, sharkBooks, oppLabel);

          if (drawn.rank === chosenRank) {
            updateSharkSpeech(`${oppLabel} drew the lucky ${chosenRank}! They take another turn!`);
            showToast(`${oppLabel} drew a matching card and goes again!`);
            updateUI();
            if (!checkGameOver()) {
              setTimeout(executeSharkTurn, 1400);
            }
            return;
          }
        }

        isPlayerTurn = true;
        mustGoFish = false;
        updateSharkSpeech("Your turn! Select a card from your hand.");
        showToast("Your Turn! Select a card from your hand.");
        updateUI();
      }, 1000);
    }
  }, 1000);
}

// Draw Pile Click Handler (Go Fish action)
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

  const oppLabel = is1v1Mode ? opponentName : 'Captain Finley';
  if (drawnCard.rank === pendingRequestedRank) {
    // Lucky catch!
    playSound('lucky');
    updateSharkSpeech(`Lucky catch! You drew a ${drawnCard.rank}! You get another turn!`);
    showToast(`LUCKY CATCH! You drew a ${drawnCard.rank}! Take another turn!`);
    updateUI();
  } else {
    updateSharkSpeech(`You drew a ${drawnCard.rank}. Turn passes to ${oppLabel}.`);
    showToast(`Drew a ${drawnCard.rank}. Turn passes to ${oppLabel}.`);
    updateUI();
    setTimeout(switchTurnToShark, 1400);
  }
}

// 1v1 Cross-Tab BroadcastChannel Network Listeners
if (matchChannel) {
  matchChannel.onmessage = (e) => {
    const data = e.data;
    if (!data || !is1v1Mode) return;

    if (data.type === '1V1_INIT' && playerRole === 'guest') {
      playerHand = data.guestHand || playerHand;
      sortHand(playerHand);
      sharkHand = new Array(data.hostHandCount || 7).fill({ rank: '?' });
      isPlayerTurn = false;
      updateUI();
      updateSharkSpeech(`⚔️ 1v1 MATCH vs ${opponentName}! Waiting for ${opponentName}'s move...`);
      showToast(`Connected to Host! ${opponentName}'s turn first.`);
    } else if (data.type === '1V1_GUEST_HELLO' && playerRole === 'host') {
      matchChannel.postMessage({
        type: '1V1_INIT',
        hostHandCount: playerHand.length,
        guestHand: sharkHand,
        deckCount: deck.length,
        turn: isPlayerTurn ? 'host' : 'guest'
      });
      showToast(`${opponentName} connected to the match!`);
    } else if (data.type === '1V1_ASK_RANK' && data.from !== playerRole) {
      const requestedRank = data.rank;
      const myMatches = playerHand.filter(c => c.rank === requestedRank);
      if (myMatches.length > 0) {
        playerHand = playerHand.filter(c => c.rank !== requestedRank);
        sortHand(playerHand);
        matchChannel.postMessage({
          type: '1V1_GIVE_CARDS',
          from: playerRole,
          cards: myMatches,
          rank: requestedRank
        });
        updateSharkSpeech(`${opponentName}: "Got any ${requestedRank}s?" You handed over ${myMatches.length}!`);
        showToast(`You gave ${myMatches.length} ${requestedRank}(s) to ${opponentName}!`);
        updateUI();
      } else {
        matchChannel.postMessage({
          type: '1V1_GO_FISH',
          from: playerRole,
          rank: requestedRank
        });
        updateSharkSpeech(`You: "GO FISH!" ${opponentName} draws a card.`);
        showToast(`You said GO FISH to ${opponentName}!`);
      }
    } else if (data.type === '1V1_GIVE_CARDS' && data.from !== playerRole) {
      const received = data.cards || [];
      playerHand.push(...received);
      sortHand(playerHand);
      if (sharkHand.length >= received.length) {
        sharkHand.splice(0, received.length);
      }
      playSound('chomp');
      checkForBooks(playerHand, playerBooks, 'Player');
      updateSharkSpeech(`You got ${received.length} ${data.rank}(s) from ${opponentName}! Take another turn!`);
      showToast(`Got ${received.length} ${data.rank}(s) from ${opponentName}! Take another turn!`);
      updateUI();
    } else if (data.type === '1V1_GO_FISH' && data.from !== playerRole) {
      mustGoFish = true;
      updateSharkSpeech(`${opponentName}: "GO FISH! I have no ${data.rank}s!" Click the Ocean Deck.`);
      showToast(`${opponentName} said GO FISH! Click the Ocean Deck.`);
      updateUI();
    } else if (data.type === '1V1_BOOK_COMPLETED' && data.from !== playerRole) {
      if (!sharkBooks.includes(data.rank)) sharkBooks.push(data.rank);
      playSound('book');
      showToast(`${opponentName} completed a book of ${data.rank}s!`);
      updateUI();
      checkGameOver();
    }
  };
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

  const oppLabel = is1v1Mode ? opponentName : 'Captain Finley';

  if (playerBooks.length > sharkBooks.length) {
    title.textContent = "YOU WIN!";
    sub.textContent = `You outsmarted ${oppLabel} ${playerBooks.length} to ${sharkBooks.length}!`;
    playSound('win');
    triggerConfetti();
  } else if (sharkBooks.length > playerBooks.length) {
    title.textContent = `${oppLabel.toUpperCase()} WINS!`;
    sub.textContent = `${oppLabel} won ${sharkBooks.length} to ${playerBooks.length}. Better luck next time!`;
    playSound('lose');
  } else {
    title.textContent = "TIED GAME!";
    sub.textContent = `An even split of ${playerBooks.length} books each!`;
    playSound('lucky');
  }

  modal.classList.add('active');
}

// UI Updating Function
function updateUI() {
  const oppLabel = is1v1Mode ? opponentName : 'CAPTAIN FINLEY';

  // 1v1 Mode Header Labels & Badges
  if (is1v1Mode) {
    const subLabel = document.querySelector('.logo-sub');
    if (subLabel) subLabel.textContent = "1v1 VERSUS ARENA";

    const sLabel = document.querySelector('.shark-score .score-label');
    if (sLabel) sLabel.textContent = oppLabel.toUpperCase();

    const nameEl = document.querySelector('.shark-name');
    if (nameEl) nameEl.textContent = oppLabel.toUpperCase();

    const booksTitle = document.getElementById('sharkBooksDisplay')?.querySelector('.books-title');
    if (booksTitle) booksTitle.textContent = `${oppLabel.toUpperCase()}'S BOOKS`;

    const finalLabel = document.getElementById('finalSharkBooks')?.parentElement?.querySelector('.final-label');
    if (finalLabel) finalLabel.textContent = `${oppLabel.toUpperCase()}'S BOOKS`;

    const sharkAvatar = document.getElementById('sharkAvatar');
    if (sharkAvatar && !sharkAvatar.querySelector('.pvp-avatar-badge')) {
      sharkAvatar.innerHTML = `<div class="pvp-avatar-badge">${oppLabel.charAt(0).toUpperCase()}</div>`;
    }
  }

  // Update Score Board & Badges
  document.getElementById('playerBooksCount').textContent = playerBooks.length;
  document.getElementById('sharkBooksCount').textContent = sharkBooks.length;
  document.getElementById('sharkCardsBadge').textContent = `${sharkHand.length} CARDS`;
  document.getElementById('deckCountBadge').textContent = `${deck.length} CARDS LEFT`;

  // Render Opponent Face-Down Hand: The user CANNOT see opponent's cards (only face-down cards)
  const sharkHandContainer = document.getElementById('sharkHandDisplay');
  sharkHandContainer.innerHTML = '';
  for (let i = 0; i < sharkHand.length; i++) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'shark-card-hidden';
    sharkHandContainer.appendChild(cardDiv);
  }

  // Render Player Hand: The player can ONLY see their own deck face up!
  const playerHandContainer = document.getElementById('playerHand');
  playerHandContainer.innerHTML = '';

  playerHand.forEach(card => {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'playing-card';
    cardDiv.onclick = () => askSharkForRank(card.rank);
    cardDiv.onmouseenter = () => playSound('hover');

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
      turnInstruction.textContent = "Click the Ocean Deck to GO FISH!";
    } else {
      turnInstruction.textContent = `Select a card from your hand to ask ${oppLabel}!`;
    }
  } else {
    turnBanner.classList.add('shark-turn');
    turnIndicator.textContent = `${oppLabel.toUpperCase()}'S TURN`;
    turnInstruction.textContent = `${oppLabel} is making a move...`;
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
