// Visual effects system

import type { MuzzleFlash, BloodParticle, ExplosionEffect } from "./types";
import {
  MUZZLE_FLASH_LIFETIME,
  BLOOD_PARTICLE_COUNT,
  BLOOD_PARTICLE_LIFETIME,
  EXPLOSION_LIFETIME,
} from "./constants";
import { randomFloat } from "./utils";

export class EffectsManager {
  muzzleFlashes: MuzzleFlash[] = [];
  explosions: ExplosionEffect[] = [];

  /**
   * Create a muzzle flash effect at the gun position
   */
  createMuzzleFlash(x: number, y: number, rotation: number): void {
    this.muzzleFlashes.push({
      x,
      y,
      rotation,
      lifetime: MUZZLE_FLASH_LIFETIME,
      size: randomFloat(15, 25),
    });
  }

  /**
   * Create blood particles when a zombie is hit
   */
  createBloodParticles(x: number, y: number): BloodParticle[] {
    const particles: BloodParticle[] = [];

    for (let i = 0; i < BLOOD_PARTICLE_COUNT; i++) {
      const angle =
        (Math.PI * 2 * i) / BLOOD_PARTICLE_COUNT + randomFloat(-0.3, 0.3);
      const speed = randomFloat(2, 5);

      particles.push({
        x,
        y,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed,
        size: randomFloat(3, 8),
        lifetime: BLOOD_PARTICLE_LIFETIME,
        alpha: 1.0,
      });
    }

    return particles;
  }

  /**
   * Create explosion effect
   */
  createExplosion(x: number, y: number, maxRadius: number): void {
    this.explosions.push({
      x,
      y,
      radius: 0,
      maxRadius,
      lifetime: EXPLOSION_LIFETIME,
      createdAt: Date.now(),
    });
  }

  /**
   * Update muzzle flashes
   */
  updateMuzzleFlashes(deltaTime: number): void {
    for (let i = this.muzzleFlashes.length - 1; i >= 0; i--) {
      this.muzzleFlashes[i].lifetime -= deltaTime;

      if (this.muzzleFlashes[i].lifetime <= 0) {
        this.muzzleFlashes.splice(i, 1);
      }
    }
  }

  /**
   * Update explosions
   */
  updateExplosions(currentTime: number): void {
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const explosion = this.explosions[i];
      const elapsed = currentTime - explosion.createdAt;

      if (elapsed >= explosion.lifetime) {
        this.explosions.splice(i, 1);
      } else {
        const progress = elapsed / explosion.lifetime;
        explosion.radius = explosion.maxRadius * progress;
      }
    }
  }

  /**
   * Update blood particles
   */
  updateBloodParticles(particles: BloodParticle[], deltaTime: number): void {
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];

      particle.x += particle.velocityX;
      particle.y += particle.velocityY;
      particle.velocityY += 0.2; // Gravity
      particle.lifetime -= deltaTime;
      particle.alpha = Math.max(0, particle.lifetime / BLOOD_PARTICLE_LIFETIME);

      if (particle.lifetime <= 0) {
        particles.splice(i, 1);
      }
    }
  }

  /**
   * Render muzzle flashes
   */
  renderMuzzleFlashes(ctx: CanvasRenderingContext2D): void {
    for (const flash of this.muzzleFlashes) {
      const alpha = flash.lifetime / MUZZLE_FLASH_LIFETIME;

      ctx.save();
      ctx.translate(flash.x, flash.y);
      ctx.rotate(flash.rotation);

      // Draw flash as a bright yellow/white burst
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, flash.size);
      gradient.addColorStop(0, `rgba(255, 255, 200, ${alpha})`);
      gradient.addColorStop(0.4, `rgba(255, 200, 0, ${alpha * 0.6})`);
      gradient.addColorStop(1, `rgba(255, 100, 0, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, flash.size, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  /**
   * Render blood particles
   */
  renderBloodParticles(
    ctx: CanvasRenderingContext2D,
    particles: BloodParticle[]
  ): void {
    for (const particle of particles) {
      ctx.fillStyle = `rgba(139, 0, 0, ${particle.alpha})`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Render explosions
   */
  renderExplosions(ctx: CanvasRenderingContext2D): void {
    for (const explosion of this.explosions) {
      const progress = explosion.radius / explosion.maxRadius;
      const alpha = 1 - progress;

      // Outer ring
      ctx.strokeStyle = `rgba(255, 100, 0, ${alpha})`;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Inner glow
      const gradient = ctx.createRadialGradient(
        explosion.x,
        explosion.y,
        0,
        explosion.x,
        explosion.y,
        explosion.radius * 0.7
      );
      gradient.addColorStop(0, `rgba(255, 200, 0, ${alpha * 0.5})`);
      gradient.addColorStop(1, `rgba(255, 100, 0, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(explosion.x, explosion.y, explosion.radius * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Clear all effects
   */
  clear(): void {
    this.muzzleFlashes = [];
    this.explosions = [];
  }
}
