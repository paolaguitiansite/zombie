// Utility functions

import type { Vector2D, Entity } from "./types";

/**
 * Calculate distance between two points
 */
export function distance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check collision between two rectangular entities
 */
export function checkRectCollision(a: Entity, b: Entity): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/**
 * Check collision between a rectangle and a circle
 */
export function checkRectCircleCollision(
  rect: Entity,
  circleX: number,
  circleY: number,
  radius: number
): boolean {
  // Find the closest point on the rectangle to the circle
  const closestX = Math.max(rect.x, Math.min(circleX, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(circleY, rect.y + rect.height));

  // Calculate distance from circle center to closest point
  const dist = distance(circleX, circleY, closestX, closestY);

  return dist < radius;
}

/**
 * Check collision between two circles
 */
export function checkCircleCollision(
  x1: number,
  y1: number,
  r1: number,
  x2: number,
  y2: number,
  r2: number
): boolean {
  const dist = distance(x1, y1, x2, y2);
  return dist < r1 + r2;
}

/**
 * Normalize a vector and return its components
 */
export function normalize(x: number, y: number): Vector2D {
  const len = Math.sqrt(x * x + y * y);
  if (len === 0) return { x: 0, y: 0 };
  return {
    x: x / len,
    y: y / len,
  };
}

/**
 * Calculate angle between two points
 */
export function angleBetween(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return Math.atan2(y2 - y1, x2 - x1);
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Get a random integer between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get a random float between min and max
 */
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Get a random element from an array
 */
export function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Linear interpolation
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Get random spawn position around the canvas edges
 */
export function getRandomSpawnPosition(
  canvasWidth: number,
  canvasHeight: number,
  margin: number
): Vector2D {
  const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left

  switch (side) {
    case 0: // top
      return { x: Math.random() * canvasWidth, y: -margin };
    case 1: // right
      return { x: canvasWidth + margin, y: Math.random() * canvasHeight };
    case 2: // bottom
      return { x: Math.random() * canvasWidth, y: canvasHeight + margin };
    case 3: // left
      return { x: -margin, y: Math.random() * canvasHeight };
    default:
      return { x: canvasWidth / 2, y: -margin };
  }
}

/**
 * Weighted random selection for zombie types
 */
export function weightedRandomZombieType(
  weights: Record<string, number>
): string {
  const totalWeight = Object.values(weights).reduce(
    (sum, weight) => sum + weight,
    0
  );
  let random = Math.random() * totalWeight;

  for (const [type, weight] of Object.entries(weights)) {
    random -= weight;
    if (random <= 0) {
      return type;
    }
  }

  return Object.keys(weights)[0];
}
