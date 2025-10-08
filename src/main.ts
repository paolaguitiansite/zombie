import "./style.css";

// Canvas setup
const canvas = document.querySelector<HTMLCanvasElement>("#gameCanvas")!;
const ctx = canvas.getContext("2d")!;

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Player object
const player = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 100,
  width: 50,
  height: 50,
  speed: 5,
  velocityX: 0,
};

// Input handling
const keys = {
  left: false,
  right: false,
};

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
    keys.left = true;
  }
  if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
    keys.right = true;
  }
});

window.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
    keys.left = false;
  }
  if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
    keys.right = false;
  }
});

// Update game state
function update() {
  // Handle player movement
  player.velocityX = 0;

  if (keys.left) {
    player.velocityX = -player.speed;
  }
  if (keys.right) {
    player.velocityX = player.speed;
  }

  // Update player position
  player.x += player.velocityX;

  // Keep player within canvas bounds
  if (player.x < 0) {
    player.x = 0;
  }
  if (player.x + player.width > canvas.width) {
    player.x = canvas.width - player.width;
  }
}

// Render game
function render() {
  // Clear canvas
  ctx.fillStyle = "#242424";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw player (red square)
  ctx.fillStyle = "#ff0000";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Draw instructions
  ctx.fillStyle = "#ffffff";
  ctx.font = "20px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("Use Arrow Keys or A/D to move", canvas.width / 2, 40);
}

// Game loop
function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
