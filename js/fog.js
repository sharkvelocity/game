/*****************************************************
 * === PHASMA-PHONEY v2.9 — FOG SYSTEM ===
 * Animated rolling mist for foggy weather
 *****************************************************/
import { game } from "./state.js";

const fogCanvas = document.getElementById("fog-layer");
const fogCtx = fogCanvas.getContext("2d");
let fogParticles = [];

export function initFog() {
  fogCanvas.width = window.innerWidth;
  fogCanvas.height = window.innerHeight;
  fogParticles = [];
  for (let i = 0; i < 20; i++) {
    fogParticles.push({
      x: Math.random() * fogCanvas.width,
      y: Math.random() * fogCanvas.height,
      radius: 300 + Math.random() * 200,
      speedX: -0.05 + Math.random() * 0.1,
      speedY: -0.03 + Math.random() * 0.06,
      opacity: 0.05 + Math.random() * 0.08
    });
  }
}

export function animateFog() {
  fogCtx.clearRect(0, 0, fogCanvas.width, fogCanvas.height);
  if (game.weather === "Foggy") {
    fogParticles.forEach(p => {
      fogCtx.beginPath();
      const g = fogCtx.createRadialGradient(p.x, p.y, p.radius * 0.2, p.x, p.y, p.radius);
      g.addColorStop(0, `rgba(200,200,200,${p.opacity})`);
      g.addColorStop(1, "rgba(200,200,200,0)");
      fogCtx.fillStyle = g;
      fogCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      fogCtx.fill();
      p.x += p.speedX; p.y += p.speedY;
      if (p.x > fogCanvas.width + p.radius) p.x = -p.radius;
      if (p.x < -p.radius) p.x = fogCanvas.width + p.radius;
      if (p.y > fogCanvas.height + p.radius) p.y = -p.radius;
      if (p.y < -p.radius) p.y = fogCanvas.height + p.radius;
    });
  }
  requestAnimationFrame(animateFog);
}

window.addEventListener("resize", initFog);
