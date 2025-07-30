// === js/fog.js ===

let fogCanvas, fogCtx, fogParticles = [];

export function initFog() {
  fogCanvas = document.getElementById("fog");
  fogCtx = fogCanvas.getContext("2d");

  fogCanvas.width = window.innerWidth;
  fogCanvas.height = window.innerHeight;

  fogParticles = [];

  for (let i = 0; i < 25; i++) {
    fogParticles.push({
      x: Math.random() * fogCanvas.width,
      y: Math.random() * fogCanvas.height,
      radius: Math.random() * 40 + 20,
      speedX: Math.random() * 0.5 - 0.25,
      speedY: Math.random() * 0.5 - 0.25,
      alpha: Math.random() * 0.08 + 0.02
    });
  }

  animateFog();
}

function animateFog() {
  fogCtx.clearRect(0, 0, fogCanvas.width, fogCanvas.height);

  fogParticles.forEach(p => {
    fogCtx.beginPath();
    fogCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    fogCtx.fillStyle = `rgba(255,255,255,${p.alpha})`;
    fogCtx.fill();

    p.x += p.speedX;
    p.y += p.speedY;

    // Wrap fog particles
    if (p.x < -p.radius) p.x = fogCanvas.width + p.radius;
    if (p.x > fogCanvas.width + p.radius) p.x = -p.radius;
    if (p.y < -p.radius) p.y = fogCanvas.height + p.radius;
    if (p.y > fogCanvas.height + p.radius) p.y = -p.radius;
  });

  requestAnimationFrame(animateFog);
}
