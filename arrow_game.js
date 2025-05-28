const svg = document.getElementById("svg");
const arrow = document.getElementById("arrow");
const scoreDisplay = document.getElementById("score");
const highscoreDisplay = document.getElementById("highscore");
const arrowsLeftDisplay = document.getElementById("arrowsLeft");
const startBtn = document.getElementById("startBtn");
const target = document.getElementById("target");

let cursor = svg.createSVGPoint();
const pivot = { x: 100, y: 250 };
let targetCenter = { x: 900, y: 250 };

let score = 0;
let highscore = Number(localStorage.getItem("archeryHighscore")) || 0;
let arrowsLeft = 5;
let arrowFlying = false;
let aiming = false;
let aimStart = null;
let aimEnd = null;

highscoreDisplay.textContent = highscore;

function resetGame() {
  score = 0;
  arrowsLeft = 5;
  scoreDisplay.textContent = score;
  arrowsLeftDisplay.textContent = arrowsLeft;
  moveTarget();
  resetArrow();
}

function moveTarget() {
  // Random position within bounds
  const minX = 700, maxX = 950, minY = 60, maxY = 440;
  const x = Math.floor(Math.random() * (maxX - minX)) + minX;
  const y = Math.floor(Math.random() * (maxY - minY)) + minY;
  target.setAttribute("transform", `translate(${x},${y})`);
  targetCenter.x = x;
  targetCenter.y = y;
}

function resetArrow() {
  gsap.set(arrow, { x: 0, y: 0 });
  arrow.setAttribute("transform", `rotate(0, ${pivot.x}, ${pivot.y})`);
  arrowFlying = false;
}

function updateHighscore() {
  if (score > highscore) {
    highscore = score;
    localStorage.setItem("archeryHighscore", highscore);
    highscoreDisplay.textContent = highscore;
  }
}

function aimStartHandler(e) {
  if (arrowFlying || arrowsLeft <= 0) return;
  aiming = true;
  aimStart = getSVGPoint(e);
}

function aimMoveHandler(e) {
  if (!aiming || arrowFlying) return;
  aimEnd = getSVGPoint(e);
  const dx = aimEnd.x - pivot.x;
  const dy = aimEnd.y - pivot.y;
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  arrow.setAttribute("transform", `rotate(${angle}, ${pivot.x}, ${pivot.y})`);
}

function aimEndHandler(e) {
  if (!aiming || arrowFlying || arrowsLeft <= 0) return;
  aiming = false;
  aimEnd = getSVGPoint(e);
  shootArrow();
}

function getSVGPoint(e) {
  cursor.x = e.clientX;
  cursor.y = e.clientY;
  const CTM = svg.getScreenCTM();
  if (!CTM) return { x: 0, y: 0 };
  return cursor.matrixTransform(CTM.inverse());
}

function shootArrow() {
  arrowFlying = true;
  arrowsLeft--;
  arrowsLeftDisplay.textContent = arrowsLeft;

  // Calculate direction and power
  const dx = aimEnd.x - pivot.x;
  const dy = aimEnd.y - pivot.y;
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  let power = Math.min(Math.hypot(dx, dy), 100000); // Limit max power

  // Calculate target point based on power
  const tx = pivot.x + Math.cos(angle * Math.PI / 180) * power;
  const ty = pivot.y + Math.sin(angle * Math.PI / 180) * power;

  // Set rotation before animation
  arrow.setAttribute("transform", `rotate(${angle}, ${pivot.x}, ${pivot.y})`);

  // Animate arrow
  gsap.to(arrow, {
    duration: 0.7 + power / 800,
    x: tx - pivot.x,
    y: ty - pivot.y,
    ease: "power2.out",
    onComplete: () => {
      checkHit(tx, ty);
      setTimeout(() => {
        if (arrowsLeft > 0) {
          moveTarget();
          resetArrow();
        } else {
          updateHighscore();
          alert("Spillet er over! Poeng: " + score);
        }
      }, 600);
    }
  });
}

function checkHit(arrowTipX, arrowTipY) {
  // Sjekk avstand fra senter av blink
  const dist = Math.hypot(arrowTipX - targetCenter.x, arrowTipY - targetCenter.y);

  let points = 0;
  if (dist <= 10) points = 3; // yellow
  else if (dist <= 20) points = 2; // red
  else if (dist <= 30) points = 1; // white

  if (points > 0) {
    score += points;
    scoreDisplay.textContent = score;
  }
}

startBtn.addEventListener("click", () => {
  resetGame();
});

svg.addEventListener("mousedown", aimStartHandler);
svg.addEventListener("mousemove", aimMoveHandler);
svg.addEventListener("mouseup", aimEndHandler);
svg.addEventListener("mouseleave", () => { aiming = false; });

resetGame();