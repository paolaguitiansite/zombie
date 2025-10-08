import "./style.css";
import { Game } from "./game";

// Get or create canvas element
let canvas = document.querySelector<HTMLCanvasElement>("#gameCanvas");

if (!canvas) {
  // Create canvas if it doesn't exist
  canvas = document.createElement("canvas");
  canvas.id = "gameCanvas";
  document.body.appendChild(canvas);
}

// Initialize and start the game
new Game(canvas);
