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

// Game state
let score = 0;
let lastShootTime = 0;
const shootInterval = 500; // milliseconds

// Bullets array
interface Bullet {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}
const bullets: Bullet[] = [];

// Zombies array
interface Zombie {
  x: number;
  y: number;
  radius: number;
  speed: number;
}
const zombies: Zombie[] = [];

let lastZombieSpawn = 0;
const zombieSpawnInterval = 1000; // milliseconds

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

// Spawn a zombie
function spawnZombie() {
  const zombie: Zombie = {
    x: Math.random() * canvas.width,
    y: -30,
    radius: 15,
    speed: 1 + Math.random() * 2,
  };
  zombies.push(zombie);
}

// Shoot a bullet
function shootBullet() {
  const bullet: Bullet = {
    x: player.x + player.width / 2 - 2.5,
    y: player.y,
    width: 5,
    height: 15,
    speed: 7,
  };
  bullets.push(bullet);
}

// Check collision between bullet and zombie
function checkCollision(bullet: Bullet, zombie: Zombie): boolean {
  const bulletCenterX = bullet.x + bullet.width / 2;
  const bulletCenterY = bullet.y + bullet.height / 2;

  const dx = bulletCenterX - zombie.x;
  const dy = bulletCenterY - zombie.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance < zombie.radius + bullet.width / 2;
}

// Check if zombie hits player
function checkZombiePlayerCollision(zombie: Zombie): boolean {
  const zombieLeft = zombie.x - zombie.radius;
  const zombieRight = zombie.x + zombie.radius;
  const zombieTop = zombie.y - zombie.radius;
  const zombieBottom = zombie.y + zombie.radius;

  const playerLeft = player.x;
  const playerRight = player.x + player.width;
  const playerTop = player.y;
  const playerBottom = player.y + player.height;

  return (
    zombieRight > playerLeft &&
    zombieLeft < playerRight &&
    zombieBottom > playerTop &&
    zombieTop < playerBottom
  );
}

// Update game state
function update(currentTime: number) {
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

  // Auto-shoot bullets
  if (currentTime - lastShootTime > shootInterval) {
    shootBullet();
    lastShootTime = currentTime;
  }

  // Update bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].y -= bullets[i].speed;

    // Remove bullets that are off screen
    if (bullets[i].y < -bullets[i].height) {
      bullets.splice(i, 1);
    }
  }

  // Spawn zombies
  if (currentTime - lastZombieSpawn > zombieSpawnInterval) {
    spawnZombie();
    lastZombieSpawn = currentTime;
  }

  // Update zombies
  for (let i = zombies.length - 1; i >= 0; i--) {
    zombies[i].y += zombies[i].speed;

    // Check if zombie hit player
    if (checkZombiePlayerCollision(zombies[i])) {
      // Game over - reset game
      zombies.length = 0;
      bullets.length = 0;
      score = 0;
      player.x = canvas.width / 2 - 25;
      continue;
    }

    // Remove zombies that are off screen
    if (zombies[i].y > canvas.height + zombies[i].radius) {
      zombies.splice(i, 1);
    }
  }

  // Check bullet-zombie collisions
  for (let i = bullets.length - 1; i >= 0; i--) {
    for (let j = zombies.length - 1; j >= 0; j--) {
      if (checkCollision(bullets[i], zombies[j])) {
        bullets.splice(i, 1);
        zombies.splice(j, 1);
        score += 10;
        break;
      }
    }
  }
}

// Render game
function render() {
  // Clear canvas
  ctx.fillStyle = "#242424";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw player (blue square)
  ctx.fillStyle = "#0066ff";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Draw bullets
  ctx.fillStyle = "#ffff00";
  for (const bullet of bullets) {
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  }

  // Draw zombies (red circles)
  ctx.fillStyle = "#ff0000";
  for (const zombie of zombies) {
    ctx.beginPath();
    ctx.arc(zombie.x, zombie.y, zombie.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw score (top right)
  ctx.fillStyle = "#ffffff";
  ctx.font = "24px system-ui";
  ctx.textAlign = "right";
  ctx.fillText(`Score: ${score}`, canvas.width - 20, 35);

  // Draw instructions
  ctx.font = "16px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(
    "Use Arrow Keys or A/D to move",
    canvas.width / 2,
    canvas.height - 20
  );
}

// Game loop
function gameLoop(currentTime: number) {
  update(currentTime);
  render();
  requestAnimationFrame(gameLoop);
}

// Start the game
requestAnimationFrame(gameLoop);
