const svg = document.getElementById("svg");
const arrow = document.getElementById("arrow");
const scoreDisplay = document.getElementById("score");
let cursor = svg.createSVGPoint();

const pivot = { x: 100, y: 250 };
const targetCenter = { x: 900, y: 250 };

let score = 0;
let arrowFlying = false;

window.addEventListener("mousemove", aim);
window.addEventListener("click", shoot);

function aim(e) {
  if (arrowFlying) return;

  cursor.x = e.clientX;
  cursor.y = e.clientY;
  const CTM = svg.getScreenCTM();
  if (!CTM) return;

  const point = cursor.matrixTransform(CTM.inverse());
  const dx = point.x - pivot.x;
  const dy = point.y - pivot.y;
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;

  arrow.setAttribute("transform", `rotate(${angle}, ${pivot.x}, ${pivot.y})`);
}

function shoot() {
  if (arrowFlying) return;
  arrowFlying = true;

  // Bring arrow to front
  svg.appendChild(arrow);

  // Calculate direction
  const dx = targetCenter.x - pivot.x;
  const dy = targetCenter.y - pivot.y;
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;

  // Set rotation before animation
  arrow.setAttribute("transform", `rotate(${angle}, ${pivot.x}, ${pivot.y})`);

  // Move arrow
  gsap.to(arrow, {
    duration: 1,
    x: dx,
    y: dy,
    ease: "power2.out",
    onComplete: () => {
      stickArrow();
      checkHit();
    }
  });
}

function checkHit() {
  const hitZoneRadius = 30;
  const arrowTipX = pivot.x + (targetCenter.x - pivot.x);
  const arrowTipY = pivot.y + (targetCenter.y - pivot.y);

  const dist = Math.hypot(arrowTipX - targetCenter.x, arrowTipY - targetCenter.y);

  if (dist <= hitZoneRadius) {
    score++;
    scoreDisplay.textContent = score;
  }
}

