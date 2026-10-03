// Minimal Math Gauntlet Engine

const QUESTIONS = [
  // 1-20: Ultra Easy
  { q: "1 + 1 = ?", a: "2", level: "Ultra Easy", hint: "Just warm up!" },
  { q: "3 + 4 = ?", a: "7", level: "Ultra Easy", hint: "Simple addition" },
  { q: "10 - 6 = ?", a: "4", level: "Ultra Easy", hint: "Subtract 6 from 10" },
  { q: "5 + 5 = ?", a: "10", level: "Ultra Easy", hint: "Double five" },
  { q: "9 - 2 = ?", a: "7", level: "Ultra Easy", hint: "Subtract 2 from 9" },
  { q: "8 + 7 = ?", a: "15", level: "Ultra Easy", hint: "Basic addition" },
  { q: "12 - 5 = ?", a: "7", level: "Ultra Easy", hint: "Subtract 5" },
  { q: "6 + 9 = ?", a: "15", level: "Ultra Easy", hint: "Single digits" },
  { q: "14 - 8 = ?", a: "6", level: "Ultra Easy", hint: "Basic subtraction" },
  { q: "11 + 7 = ?", a: "18", level: "Ultra Easy", hint: "Add 7" },
  { q: "20 - 9 = ?", a: "11", level: "Ultra Easy", hint: "Subtract 9" },
  { q: "13 + 8 = ?", a: "21", level: "Ultra Easy", hint: "Basic arithmetic" },
  { q: "18 - 4 = ?", a: "14", level: "Ultra Easy", hint: "Subtract 4" },
  { q: "15 + 9 = ?", a: "24", level: "Ultra Easy", hint: "Add 9" },
  { q: "25 - 11 = ?", a: "14", level: "Ultra Easy", hint: "Subtract 11" },
  { q: "17 + 6 = ?", a: "23", level: "Ultra Easy", hint: "Basic addition" },
  { q: "30 - 14 = ?", a: "16", level: "Ultra Easy", hint: "Subtract 14" },
  { q: "19 + 12 = ?", a: "31", level: "Ultra Easy", hint: "Add 12" },
  { q: "40 - 18 = ?", a: "22", level: "Ultra Easy", hint: "Subtract 18" },
  { q: "24 + 16 = ?", a: "40", level: "Ultra Easy", hint: "Round total" },

  // 21-40: Easy Multiplication & Division
  { q: "3 × 4 = ?", a: "12", level: "Easy", hint: "Times 4" },
  { q: "5 × 6 = ?", a: "30", level: "Easy", hint: "Times 6" },
  { q: "24 ÷ 4 = ?", a: "6", level: "Easy", hint: "Divide by 4" },
  { q: "7 × 4 = ?", a: "28", level: "Easy", hint: "Times 4" },
  { q: "36 ÷ 6 = ?", a: "6", level: "Easy", hint: "Divide by 6" },
  { q: "8 × 7 = ?", a: "56", level: "Easy", hint: "Times 7" },
  { q: "45 ÷ 9 = ?", a: "5", level: "Easy", hint: "Divide by 9" },
  { q: "9 × 6 = ?", a: "54", level: "Easy", hint: "Times 6" },
  { q: "64 ÷ 8 = ?", a: "8", level: "Easy", hint: "Divide by 8" },
  { q: "12 × 5 = ?", a: "60", level: "Easy", hint: "Times 5" },
  { q: "81 ÷ 9 = ?", a: "9", level: "Easy", hint: "Square root of 81" },
  { q: "11 × 7 = ?", a: "77", level: "Easy", hint: "Times 7" },
  { q: "96 ÷ 12 = ?", a: "8", level: "Easy", hint: "Divide by 12" },
  { q: "14 × 3 = ?", a: "42", level: "Easy", hint: "Times 3" },
  { q: "72 ÷ 6 = ?", a: "12", level: "Easy", hint: "Divide by 6" },
  { q: "15 × 4 = ?", a: "60", level: "Easy", hint: "Quarter century times 4" },
  { q: "108 ÷ 9 = ?", a: "12", level: "Easy", hint: "Divide by 9" },
  { q: "16 × 5 = ?", a: "80", level: "Easy", hint: "Times 5" },
  { q: "132 ÷ 11 = ?", a: "12", level: "Easy", hint: "Divide by 11" },
  { q: "18 × 3 = ?", a: "54", level: "Easy", hint: "Times 3" },

  // 41-60: Medium 2-Step & Squares
  { q: "12² = ?", a: "144", level: "Medium", hint: "12 squared" },
  { q: "7 × 8 + 6 = ?", a: "62", level: "Medium", hint: "Order of operations" },
  { q: "90 ÷ 5 - 7 = ?", a: "11", level: "Medium", hint: "Divide then subtract" },
  { q: "13² = ?", a: "169", level: "Medium", hint: "13 squared" },
  { q: "15 × 6 - 20 = ?", a: "70", level: "Medium", hint: "Multiply then subtract" },
  { q: "(14 + 16) × 3 = ?", a: "90", level: "Medium", hint: "Parentheses first" },
  { q: "144 ÷ 12 + 23 = ?", a: "35", level: "Medium", hint: "Divide then add" },
  { q: "15² - 25 = ?", a: "200", level: "Medium", hint: "Square minus 25" },
  { q: "84 ÷ 4 + 19 = ?", a: "40", level: "Medium", hint: "Divide then add" },
  { q: "16² = ?", a: "256", level: "Medium", hint: "16 squared" },
  { q: "(25 - 9) × 4 = ?", a: "64", level: "Medium", hint: "Parentheses first" },
  { q: "175 ÷ 5 = ?", a: "35", level: "Medium", hint: "Divide by 5" },
  { q: "18 × 4 - 22 = ?", a: "50", level: "Medium", hint: "Multiply then subtract" },
  { q: "200 ÷ 8 + 15 = ?", a: "40", level: "Medium", hint: "Divide then add" },
  { q: "14 × 6 + 16 = ?", a: "100", level: "Medium", hint: "Multiply then add" },
  { q: "19² = ?", a: "361", level: "Medium", hint: "19 squared" },
  { q: "(45 + 55) ÷ 4 = ?", a: "25", level: "Medium", hint: "Sum then divide" },
  { q: "21 × 4 = ?", a: "84", level: "Medium", hint: "Times 4" },
  { q: "225 ÷ 15 + 35 = ?", a: "50", level: "Medium", hint: "Divide then add" },
  { q: "20² - 100 = ?", a: "300", level: "Medium", hint: "Square minus 100" },

  // 61-80: Hard Algebra, Roots & Powers
  { q: "2⁶ = ?", a: "64", level: "Hard", hint: "2 to the 6th power" },
  { q: "√144 + 28 = ?", a: "40", level: "Hard", hint: "Square root + 28" },
  { q: "Solve x: 3x - 9 = 21", a: "10", level: "Hard", hint: "Find x" },
  { q: "3⁴ = ?", a: "81", level: "Hard", hint: "3 to the 4th power" },
  { q: "√256 × 2 = ?", a: "32", level: "Hard", hint: "Square root times 2" },
  { q: "Solve x: 5x + 15 = 65", a: "10", level: "Hard", hint: "Find x" },
  { q: "2⁷ = ?", a: "128", level: "Hard", hint: "2 to the 7th power" },
  { q: "17 × 13 = ?", a: "221", level: "Hard", hint: "Multiplication" },
  { q: "√400 + 45 = ?", a: "65", level: "Hard", hint: "Square root + 45" },
  { q: "Solve x: 4x - 18 = 42", a: "15", level: "Hard", hint: "Find x" },
  { q: "3⁵ - 43 = ?", a: "200", level: "Hard", hint: "Power minus 43" },
  { q: "2⁸ = ?", a: "256", level: "Hard", hint: "2 to the 8th power" },
  { q: "√625 ÷ 5 = ?", a: "5", level: "Hard", hint: "Square root divided by 5" },
  { q: "Solve x: 6x + 24 = 120", a: "16", level: "Hard", hint: "Find x" },
  { q: "14 × 16 = ?", a: "224", level: "Hard", hint: "Multiplication" },
  { q: "2⁹ = ?", a: "512", level: "Hard", hint: "2 to the 9th power" },
  { q: "√900 - 12 = ?", a: "18", level: "Hard", hint: "Square root minus 12" },
  { q: "Solve x: 7x - 21 = 70", a: "13", level: "Hard", hint: "Find x" },
  { q: "15 × 15 + 75 = ?", a: "300", level: "Hard", hint: "Square plus 75" },
  { q: "2¹⁰ ÷ 4 = ?", a: "256", level: "Hard", hint: "Power divided by 4" },

  // 81-100: Expert Calculus, Logarithms & Factorials
  { q: "5! = ?", a: "120", level: "Expert", hint: "Factorial 5 × 4 × 3 × 2 × 1" },
  { q: "log₂(64) = ?", a: "6", level: "Expert", hint: "Logarithm base 2" },
  { q: "d/dx (4x + 9) at x=5", a: "4", level: "Expert", hint: "Derivative value" },
  { q: "Solve x: 2ˣ = 128", a: "7", level: "Expert", hint: "Exponent x" },
  { q: "6! ÷ 10 = ?", a: "72", level: "Expert", hint: "Factorial divided by 10" },
  { q: "d/dx (x² + 6x) at x=3", a: "12", level: "Expert", hint: "2x + 6 evaluated at 3" },
  { q: "log₃(81) = ?", a: "4", level: "Expert", hint: "3 to what power equals 81?" },
  { q: "∫₀⁴ 2x dx = ?", a: "16", level: "Expert", hint: "Definite integral [x²] from 0 to 4" },
  { q: "Solve x: 3ˣ = 243", a: "5", level: "Expert", hint: "Exponent x" },
  { q: "(5! + 30) ÷ 3 = ?", a: "50", level: "Expert", hint: "Factorial equation" },
  { q: "d/dx (2x² - 5x) at x=4", a: "11", level: "Expert", hint: "4x - 5 evaluated at 4" },
  { q: "log₂(512) = ?", a: "9", level: "Expert", hint: "2 to what power equals 512?" },
  { q: "∫₀³ 3x² dx = ?", a: "27", level: "Expert", hint: "Definite integral [x³] from 0 to 3" },
  { q: "Solve x: 2⁽ˣ⁺¹⁾ = 64", a: "5", level: "Expert", hint: "Exponent equation" },
  { q: "6! ÷ 24 = ?", a: "30", level: "Expert", hint: "Factorial division" },
  { q: "d/dx (x³ - 4x) at x=2", a: "8", level: "Expert", hint: "3x² - 4 evaluated at 2" },
  { q: "log₁₀(100,000) = ?", a: "5", level: "Expert", hint: "Logarithm base 10" },
  { q: "∫₀² 4x³ dx = ?", a: "16", level: "Expert", hint: "Definite integral [x⁴] from 0 to 2" },
  { q: "7! ÷ 5! = ?", a: "42", level: "Expert", hint: "7 × 6" },
  { q: "d/dx (x⁴ - 2x² + 10) at x=2", a: "24", level: "Expert", hint: "4x³ - 4x evaluated at 2" }
];

let currentIndex = 0;

function startGauntlet() {
  document.getElementById('startStage').classList.remove('active');
  document.getElementById('gauntletStage').classList.add('active');
  currentIndex = 0;
  renderQuestion();
}

function renderQuestion() {
  const current = QUESTIONS[currentIndex];
  const qNum = currentIndex + 1;
  const total = QUESTIONS.length;

  document.getElementById('questionCounter').textContent = `${qNum} / ${total}`;
  document.getElementById('difficultyTag').textContent = current.level;
  document.getElementById('equationText').textContent = current.q;
  document.getElementById('equationHint').textContent = current.hint || "Enter numerical answer";

  const progressPct = (qNum / total) * 100;
  document.getElementById('progressFill').style.width = `${progressPct}%`;

  const input = document.getElementById('answerInput');
  input.value = '';
  input.focus();

  const errorMsg = document.getElementById('errorMsg');
  errorMsg.classList.remove('active');
}

function submitAnswer(e) {
  e.preventDefault();
  const input = document.getElementById('answerInput');
  const userAns = input.value.trim();
  const current = QUESTIONS[currentIndex];

  if (userAns === current.a) {
    currentIndex++;
    if (currentIndex >= QUESTIONS.length) {
      triggerLevel2Prank();
    } else {
      renderQuestion();
    }
  } else {
    showError();
  }
}

function showError() {
  const errorMsg = document.getElementById('errorMsg');
  errorMsg.classList.add('active');
  const input = document.getElementById('answerInput');
  input.select();
}

/* Confetti Particle Engine */
function triggerConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#000000', '#333333', '#666666', '#999999', '#cccccc', '#ff0055', '#00e5ff', '#ffea00'];

  for (let i = 0; i < 160; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2 + 50,
      vx: (Math.random() - 0.5) * 22,
      vy: (Math.random() - 0.7) * 24,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10,
      opacity: 1
    });
  }

  let animationFrame;
  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.4; // gravity
      p.rotation += p.vRot;
      p.opacity -= 0.008;

      if (p.opacity > 0) {
        alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    });

    if (alive) {
      animationFrame = requestAnimationFrame(update);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  update();
}

/* Completion & Level 2 Prank Sequence */
function triggerLevel2Prank() {
  document.getElementById('gauntletStage').classList.remove('active');
  const prankStage = document.getElementById('prankStage');
  const prankText = document.getElementById('prankText');

  prankStage.classList.add('active');
  prankText.textContent = "NOW LEVEL 2";
  prankText.classList.remove('fade-out');

  // 1. Burst Confetti
  triggerConfetti();

  // 2. After 2.5 seconds, fade out NOW LEVEL 2 & show "just kidding"
  setTimeout(() => {
    prankText.classList.add('fade-out');

    setTimeout(() => {
      prankText.textContent = "just kidding";
      prankText.classList.remove('fade-out');

      // 3. After 2 seconds, open new tab & attempt tab close
      setTimeout(() => {
        window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
        try {
          window.close();
        } catch (e) {}
      }, 2000);

    }, 500);

  }, 2500);
}
