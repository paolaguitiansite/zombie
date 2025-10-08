// Rendering system

import type { Player, Bullet, Zombie, ResourceNode, GameState, Gate } from "./types";
import { GateType } from "./types";
import { CANVAS_WIDTH, CANVAS_HEIGHT, LANE_DIVIDER_X } from "./constants";
import { getZombieColor } from "./entities";
import { EffectsManager } from "./effects";

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private effects: EffectsManager;

  constructor(ctx: CanvasRenderingContext2D, effects: EffectsManager) {
    this.ctx = ctx;
    this.effects = effects;
  }

  /**
   * Clear the canvas
   */
  clear(): void {
    // Dark background
    this.ctx.fillStyle = "#1a1a1a";
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw grid for depth
    this.drawGrid();
  }

  /**
   * Draw background grid and lane divider
   */
  private drawGrid(): void {
    this.ctx.strokeStyle = "#2a2a2a";
    this.ctx.lineWidth = 1;

    const gridSize = 50;

    // Vertical lines
    for (let x = 0; x < CANVAS_WIDTH; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, CANVAS_HEIGHT);
      this.ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y < CANVAS_HEIGHT; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(CANVAS_WIDTH, y);
      this.ctx.stroke();
    }

    // Draw lane divider (more visible)
    this.ctx.strokeStyle = "#ffff00";
    this.ctx.lineWidth = 3;
    this.ctx.setLineDash([10, 10]);
    this.ctx.beginPath();
    this.ctx.moveTo(LANE_DIVIDER_X, 0);
    this.ctx.lineTo(LANE_DIVIDER_X, CANVAS_HEIGHT);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }

  /**
   * Render the player
   */
  renderPlayer(player: Player): void {
    this.ctx.save();

    // Translate to player center
    this.ctx.translate(
      player.x + player.width / 2,
      player.y + player.height / 2
    );

    // Apply damage flash effect
    if (player.damageFlashTime > 0) {
      this.ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.05) * 0.3;
    }

    // Rotate to face mouse
    this.ctx.rotate(player.rotation);

    // Draw player body (rectangle)
    this.ctx.fillStyle = player.invulnerableTime > 0 ? "#ffff00" : "#4a9eff";
    this.ctx.fillRect(
      -player.width / 2,
      -player.height / 2,
      player.width,
      player.height
    );

    // Draw player "face" direction indicator
    this.ctx.fillStyle = "#ffffff";
    this.ctx.beginPath();
    this.ctx.moveTo(player.width / 2 - 5, 0);
    this.ctx.lineTo(player.width / 2 + 5, -5);
    this.ctx.lineTo(player.width / 2 + 5, 5);
    this.ctx.closePath();
    this.ctx.fill();

    // Draw gun
    this.ctx.fillStyle = "#333333";
    this.ctx.fillRect(player.width / 2 - 8, -3, 20, 6);

    this.ctx.restore();

    // Draw health bar above player
    this.renderHealthBar(
      player.x + player.width / 2,
      player.y - 10,
      player.health,
      player.maxHealth,
      50
    );
  }

  /**
   * Render bullets
   */
  renderBullets(bullets: Bullet[]): void {
    this.ctx.fillStyle = "#ffff00";

    for (const bullet of bullets) {
      if (!bullet.active) continue;

      this.ctx.save();
      this.ctx.translate(bullet.x, bullet.y);

      // Rotate bullet based on velocity
      const angle = Math.atan2(bullet.velocityY, bullet.velocityX);
      this.ctx.rotate(angle);

      // Draw bullet as elongated rectangle
      this.ctx.fillRect(
        -bullet.width / 2,
        -bullet.height / 2,
        bullet.width,
        bullet.height
      );

      // Draw bullet glow
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = "#ffff00";
      this.ctx.fillRect(
        -bullet.width / 2,
        -bullet.height / 2,
        bullet.width,
        bullet.height
      );
      this.ctx.shadowBlur = 0;

      this.ctx.restore();
    }
  }

  /**
   * Render zombies
   */
  renderZombies(zombies: Zombie[]): void {
    for (const zombie of zombies) {
      if (!zombie.active) continue;

      // Render blood particles first (behind zombie)
      this.effects.renderBloodParticles(this.ctx, zombie.bloodParticles);

      // Draw zombie body
      const color = getZombieColor(zombie);
      this.ctx.fillStyle = color;

      this.ctx.beginPath();
      this.ctx.arc(zombie.x, zombie.y, zombie.radius, 0, Math.PI * 2);
      this.ctx.fill();

      // Draw zombie outline
      this.ctx.strokeStyle = "#000000";
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      // Draw zombie eyes
      this.ctx.fillStyle = "#ff0000";
      const eyeOffset = zombie.radius * 0.4;
      this.ctx.beginPath();
      this.ctx.arc(
        zombie.x - eyeOffset / 2,
        zombie.y - eyeOffset / 2,
        3,
        0,
        Math.PI * 2
      );
      this.ctx.arc(
        zombie.x + eyeOffset / 2,
        zombie.y - eyeOffset / 2,
        3,
        0,
        Math.PI * 2
      );
      this.ctx.fill();

      // Draw type indicator
      this.drawZombieTypeIndicator(zombie);

      // Draw health bar
      this.renderHealthBar(
        zombie.x,
        zombie.y - zombie.radius - 10,
        zombie.health,
        zombie.maxHealth,
        zombie.radius * 2
      );
    }
  }

  /**
   * Draw zombie type indicator
   */
  private drawZombieTypeIndicator(zombie: Zombie): void {
    let symbol = "";

    switch (zombie.type) {
      case "runner":
        symbol = "⚡";
        break;
      case "tank":
        symbol = "🛡";
        break;
      case "spitter":
        symbol = "💧";
        break;
      case "exploder":
        symbol = "💣";
        break;
      default:
        return;
    }

    this.ctx.font = "16px Arial";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(symbol, zombie.x, zombie.y);
  }

  /**
   * Render health bar
   */
  private renderHealthBar(
    x: number,
    y: number,
    health: number,
    maxHealth: number,
    width: number
  ): void {
    const height = 6;
    const healthPercent = health / maxHealth;

    // Background
    this.ctx.fillStyle = "#333333";
    this.ctx.fillRect(x - width / 2, y, width, height);

    // Health
    const healthColor =
      healthPercent > 0.5
        ? "#00ff00"
        : healthPercent > 0.25
        ? "#ffff00"
        : "#ff0000";
    this.ctx.fillStyle = healthColor;
    this.ctx.fillRect(x - width / 2, y, width * healthPercent, height);

    // Border
    this.ctx.strokeStyle = "#000000";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x - width / 2, y, width, height);
  }

  /**
   * Render resource nodes
   */
  renderResourceNodes(nodes: ResourceNode[]): void {
    for (const node of nodes) {
      if (node.collected) continue;

      // Pulsing effect
      const pulse = Math.sin(Date.now() * 0.003) * 3;

      // Draw glow
      const gradient = this.ctx.createRadialGradient(
        node.x + node.width / 2,
        node.y + node.height / 2,
        0,
        node.x + node.width / 2,
        node.y + node.height / 2,
        node.width / 2 + pulse + 10
      );
      gradient.addColorStop(0, "rgba(255, 215, 0, 0.8)");
      gradient.addColorStop(1, "rgba(255, 215, 0, 0)");

      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(
        node.x + node.width / 2,
        node.y + node.height / 2,
        node.width / 2 + pulse + 10,
        0,
        Math.PI * 2
      );
      this.ctx.fill();

      // Draw resource node
      this.ctx.fillStyle = "#ffd700";
      this.ctx.fillRect(node.x, node.y, node.width, node.height);

      // Draw border
      this.ctx.strokeStyle = "#ffaa00";
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(node.x, node.y, node.width, node.height);

      // Draw resource icon
      this.ctx.fillStyle = "#000000";
      this.ctx.font = "20px Arial";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText("$", node.x + node.width / 2, node.y + node.height / 2);
    }
  }

  /**
   * Render gates
   */
  renderGates(gates: Gate[]): void {
    for (const gate of gates) {
      if (!gate.active) continue;

      // Draw gate background
      const bgColor = gate.passed ? "#666666" : gate.type === GateType.ADD ? "#4CAF50" : "#FF9800";
      this.ctx.fillStyle = bgColor;
      this.ctx.fillRect(gate.x, gate.y, gate.width, gate.height);

      // Draw gate border
      this.ctx.strokeStyle = "#ffffff";
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(gate.x, gate.y, gate.width, gate.height);

      // Draw symbol and value
      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "bold 36px Arial";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      
      const symbol = gate.type === GateType.ADD ? "+" : "×";
      const text = `${symbol}${gate.value}`;
      
      this.ctx.fillText(
        text,
        gate.x + gate.width / 2,
        gate.y + gate.height / 2
      );
    }
  }

  /**
   * Render UI
   */
  renderUI(player: Player, gameState: GameState): void {
    // Top left - Player stats
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "bold 20px Arial";
    this.ctx.textAlign = "left";
    this.ctx.fillText(
      `Health: ${Math.ceil(player.health)}/${player.maxHealth}`,
      20,
      30
    );
    this.ctx.fillText(`Shooters: ${player.shooterCount}`, 20, 60);
    this.ctx.fillText(`Resources: ${player.resources}`, 20, 90);
    this.ctx.fillText(`Wave: ${gameState.currentWave}`, 20, 120);

    // Wave progress
    if (gameState.waveActive) {
      const zombiesRemaining =
        gameState.zombiesInWave - gameState.zombiesKilled;
      this.ctx.fillText(`Zombies: ${zombiesRemaining}`, 20, 150);
    } else {
      this.ctx.fillText("WAVE COMPLETE!", 20, 150);
    }

    // Top right - Instructions
    this.ctx.textAlign = "right";
    this.ctx.font = "16px Arial";
    this.ctx.fillStyle = "#aaaaaa";
    this.ctx.fillText("A/D or ← → - Switch Lanes", CANVAS_WIDTH - 20, 30);
    this.ctx.fillText("Auto-Shoot", CANVAS_WIDTH - 20, 55);
    this.ctx.fillText("Collect gates to increase shooters!", CANVAS_WIDTH - 20, 80);
    this.ctx.fillText("Green = Add (+) | Orange = Multiply (×)", CANVAS_WIDTH - 20, 105);

    // Center - Mode indicator
    this.ctx.textAlign = "center";
    this.ctx.font = "bold 24px Arial";
    if (gameState.explorationMode) {
      this.ctx.fillStyle = "#ffd700";
      this.ctx.fillText("EXPLORATION MODE", CANVAS_WIDTH / 2, 40);
      this.ctx.font = "16px Arial";
      this.ctx.fillStyle = "#ffffff";
      this.ctx.fillText("Collect resources and survive!", CANVAS_WIDTH / 2, 65);
    }
  }

  /**
   * Render game over screen
   */
  renderGameOver(_player: Player, gameState: GameState): void {
    // Semi-transparent overlay
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Game Over text
    this.ctx.fillStyle = "#ff0000";
    this.ctx.font = "bold 72px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText("YOU DIED", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 100);

    // Stats
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "32px Arial";
    this.ctx.fillText(
      `Wave Reached: ${gameState.currentWave}`,
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2
    );
    this.ctx.fillText(
      `Zombies Killed: ${gameState.zombiesKilled}`,
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2 + 50
    );

    // Resource loss message
    this.ctx.fillStyle = "#ffaa00";
    this.ctx.font = "bold 24px Arial";
    this.ctx.fillText(
      "You lost 50% of your resources!",
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2 + 100
    );

    // Respawn message
    this.ctx.fillStyle = "#aaaaaa";
    this.ctx.font = "20px Arial";
    this.ctx.fillText(
      "Respawning...",
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2 + 150
    );
  }

  /**
   * Render effects
   */
  renderEffects(): void {
    this.effects.renderMuzzleFlashes(this.ctx);
    this.effects.renderExplosions(this.ctx);
  }
}
