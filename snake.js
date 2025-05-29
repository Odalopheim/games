const canvas = document.getElementById("snake");
const ctx = canvas.getContext("2d");

const gridSize = 20;
let snake = [{ x: 200, y: 200 }];
let direction = { x: gridSize, y: 0 };
let food = spawnFood();
let gameOver = false;
let score = 0;
let highscore = Number(localStorage.getItem("snakeHighscore")) || 0;

const scoreDisplay = document.getElementById("score");
const highscoreDisplay = document.getElementById("highscore");
const startBtn = document.getElementById("startBtn");

scoreDisplay.textContent = score;
highscoreDisplay.textContent = highscore;

let loopId;

function resetGame() {
  snake = [{ x: 200, y: 200 }];
  direction = { x: gridSize, y: 0 };
  food = spawnFood();
  gameOver = false;
  score = 0;
  scoreDisplay.textContent = score;
  draw();
  clearTimeout(loopId); // Stopp forrige game loop
  gameLoop();
}

function update() {
  if (gameOver) return;

  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  if (
    head.x < 0 || head.x >= canvas.width ||
    head.y < 0 || head.y >= canvas.height
  ) {
    gameOver = true;
    if (score > highscore) {
      highscore = score;
      localStorage.setItem("snakeHighscore", highscore);
      highscoreDisplay.textContent = highscore;
    }
    alert("Game Over!");
    return;
  }

  if (snake.some(part => part.x === head.x && part.y === head.y)) {
    gameOver = true;
    if (score > highscore) {
      highscore = score;
      localStorage.setItem("snakeHighscore", highscore);
      highscoreDisplay.textContent = highscore;
    }
    alert("Game Over!");
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    food = spawnFood();
    score++;
    scoreDisplay.textContent = score;
  } else {
    snake.pop();
  }
}

function spawnFood() {
  return {
    x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
    y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
  };
}

function draw() {
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw snake
  ctx.fillStyle = "#228B22";
  snake.forEach(part => ctx.fillRect(part.x, part.y, gridSize, gridSize));

  // Draw food
  ctx.fillStyle = "#e63946";
  ctx.fillRect(food.x, food.y, gridSize, gridSize);
}

function gameLoop() {
  update();
  draw();
  if (!gameOver) loopId = setTimeout(gameLoop, 100);
}

document.addEventListener("keydown", e => {
  if (e.key === "ArrowUp" && direction.y === 0) direction = { x: 0, y: -gridSize };
  else if (e.key === "ArrowDown" && direction.y === 0) direction = { x: 0, y: gridSize };
  else if (e.key === "ArrowLeft" && direction.x === 0) direction = { x: -gridSize, y: 0 };
  else if (e.key === "ArrowRight" && direction.x === 0) direction = { x: gridSize, y: 0 };
});

startBtn.addEventListener("click", resetGame);

gameLoop();