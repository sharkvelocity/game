/*****************************************************
 * === PHASMA-PHONEY v2.9 — VAN MONITOR MODULE (FINAL FIXED) ===
 * Dynamic camera feeds, boot animation, orb animation,
 * notebook sync, and safe cleanup.
 *****************************************************/
import { game } from "./state.js";
import { logToGame, showNotebookUpdateBadge } from "./ui.js";
import { ghostProfiles, roomVisuals } from "./state.js";
import { playMonitorBoot, } from "./audioManager.js";

let vanMonitorBooted = false;
let vanMonitorInterval = null;

/***********************
 === OPEN & CLOSE MONITOR ===
************************/
export function openVanMonitor() {
  if (document.getElementById("van-monitor")) return;

  const monitor = document.createElement("div");
  monitor.id = "van-monitor";
  Object.assign(monitor.style, {
    position: "fixed", top: "0", left: "0",
    width: "100vw", height: "100vh",
    background: "#000", color: "#0f0",
    fontFamily: "monospace", fontSize: "16px",
    zIndex: "4000", display: "flex",
    flexDirection: "column", justifyContent: "center",
    alignItems: "center", overflow: "hidden"
  });
  document.body.appendChild(monitor);

  if (!vanMonitorBooted) {
    vanMonitorBooted = true;
playMonitorBoot();
    runVanBootSequence(monitor);
  } else {
    renderCameraGrid(monitor);
  }
}

export function closeVanMonitor() {
  const m = document.getElementById("van-monitor");
  if (m) document.body.removeChild(m);
  if (vanMonitorInterval) {
    clearInterval(vanMonitorInterval);
    vanMonitorInterval = null;
  }
}
import { showNotebookUpdateBadge } from './ui.js';

/***********************
 === BOOT SEQUENCE ===
************************/
function runVanBootSequence(monitor) {
  monitor.innerHTML = `
    <img src="logo.png" alt="Logo" style="max-width:200px;margin-bottom:20px;opacity:0.9;">
    <div id="boot-text" style="width:80%;text-align:left;margin-bottom:10px;">
    </div>
    <div id="boot-bar-container" style="width:80%;height:20px;background:#111;border:1px solid #0f0;">
      <div id="boot-bar" style="width:0%;height:100%;background:#0f0;transition:width 0.3s linear;">
      </div>
    </div>
  `;
  const lines = [
    ">C:/boot ghost.os",
    "Loading modules...",
    "Initializing ghost detection services...",
    "Connecting to spectral network...",
    "Starting Phasma‑Phoney Monitoring Service..."
  ];

  let i = 0, progress = 0;
  const bootText = document.getElementById("boot-text");
  const bootBar = document.getElementById("boot-bar");

  function addLine() {
    if (!document.getElementById("van-monitor")) return;
    if (i < lines.length) {
      bootText.innerHTML += `<div>${lines[i++]}</div>`;
      progress += 100 / lines.length;
      bootBar.style.width = progress + "%";
      setTimeout(addLine, 600 + Math.random() * 400);
    } else {
      setTimeout(() => showLogin(monitor), 1000);
    }
  }
  addLine();
}

function showLogin(monitor) {
  if (!document.getElementById("van-monitor")) return;
  monitor.innerHTML = `
    <div style="background:#111;padding:20px;border:2px solid #0f0;width:300px;text-align:left;">
      <h3 style="color:#0f0;text-align:center;">System Login</h3>
      <div id="login-output" style="color:#0f0;min-height:60px;"></div>
    </div>`;
  const out = document.getElementById("login-output");
  const username = "sharkvelocity", password = "********";
  let step = 0;

  function typeLogin() {
    if (!document.getElementById("van-monitor")) return;
    if (step === 0) {
      out.innerHTML += `<div>Username: <span id="user-type"></span></div>`;
      autoType("user-type", username, () => { step = 1; setTimeout(typeLogin, 500); });
    } else if (step === 1) {
      out.innerHTML += `<div>Password: <span id="pass-type"></span></div>`;
      autoType("pass-type", password, () => {
        setTimeout(() => {
          if (!document.getElementById("van-monitor")) return;
          out.innerHTML += `<div>Access Granted.</div>`;
          setTimeout(() => renderCameraGrid(monitor), 800);
        }, 400);
      }, 150);
    }
  }
  typeLogin();
}

function autoType(elId, text, cb, delay = 100) {
  const el = document.getElementById(elId);
  let i = 0;
  function t() {
    if (!document.getElementById("van-monitor")) return;
    if (i < text.length) {
      el.textContent += text[i++];
      setTimeout(t, delay);
    } else if (cb) cb();
  }
  t();
}

/***********************
 === CAMERA FEEDS ===
************************/
function generateCameraFeeds() {
  const activeFeeds = game.cameraPlacements.slice(-4);
  if (activeFeeds.length === 0) {
    return `<p style="color:#0f0;opacity:0.7;">No cameras placed.</p>`;
  }

  return activeFeeds.map((room, idx) => {
    const hasCamera = (game.roomItems[room] || []).includes("Video Camera");
    let imgSrc = "nosignal.gif", label = "NO SIGNAL";

    if (hasCamera) {
      imgSrc = roomVisuals[room]?.N || "nosignal.gif";
      label = `${room} — ACTIVE`;
      if (room === game.ghostRoom) {
        if (game.ghost === "TheMimic") {
          label = `${room} — FAKE ORBS DETECTED`;
        } else if (ghostProfiles[game.ghost]?.evidence.includes("Orbs")) {
          label = `${room} — ORBS DETECTED`;
        }
      }
    }

    return `
      <div class="camera-feed" style="position:relative;border:1px solid #0f0;overflow:hidden;">
        <img src="${imgSrc}" style="width:100%;height:100%;object-fit:cover;">
        <canvas id="camera-orbs-${room}-${idx}" style="position:absolute;top:0;left:0;width:100%;height:100%;"></canvas>
        <div style="position:absolute;bottom:0;width:100%;text-align:center;font-size:11px;background:rgba(0,0,0,0.5);color:#0f0;">
          ${label}
        </div>
      </div>`;
  }).join("");
}

function renderCameraGrid(monitor) {
  monitor.innerHTML = `
    <h3 style="color:#0f0;margin-top:0;">Camera Feed</h3>
    <div style="display:grid;grid-template-columns:repeat(2,200px);grid-gap:8px;">
      ${generateCameraFeeds()}
    </div>
    <button id="close-monitor-btn" style="margin-top:12px;background:#111;color:#0f0;border:1px solid #0f0;">
      Close Monitor
    </button>`;

  const closeBtn = document.getElementById("close-monitor-btn");
  closeBtn.addEventListener("click", closeVanMonitor);

  if (vanMonitorInterval) clearInterval(vanMonitorInterval);
  vanMonitorInterval = setInterval(() => animateAllCameraOrbs(), 1000);

  showNotebookUpdateBadge();
}

/***********************
 === ORB ANIMATION ===
************************/
function drawCameraOrbs(room, idx) {
  const canvas = document.getElementById(`camera-orbs-${room}-${idx}`);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const active =
    (game.roomItems[room] || []).includes("Video Camera") &&
    room === game.ghostRoom &&
    (ghostProfiles[game.ghost]?.evidence.includes("Orbs") || game.ghost === "TheMimic");

  if (!active) return;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0,255,0,${0.2 + Math.random() * 0.3})`;
    ctx.fill();
  }
}

function animateAllCameraOrbs() {
  const activeFeeds = game.cameraPlacements.slice(-4);
  activeFeeds.forEach((room, idx) => drawCameraOrbs(room, idx));
}
