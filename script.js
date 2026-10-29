const themeToggle = document.querySelector(".theme-toggle");
const dialog = document.querySelector("#gameplay-dialog");
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const tr = (key, fallback) => (window.gemriftT ? window.gemriftT(key, fallback) : fallback);

function updateThemeLabel() {
  if (!themeToggle) return;
  const dark = document.documentElement.dataset.theme === "dark";
  themeToggle.setAttribute(
    "aria-label",
    dark ? tr("js.themeLight", "Switch to light theme") : tr("js.themeDark", "Switch to dark theme")
  );
  document.querySelector('meta[name="theme-color"]')?.setAttribute(
    "content",
    getComputedStyle(document.documentElement).getPropertyValue("--cp-bg").trim()
  );
}
document.addEventListener("gemrift:lang", updateThemeLabel);

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.documentElement.dataset.theme =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    updateThemeLabel();
    document.dispatchEvent(new CustomEvent("gemrift:theme"));
  });
  updateThemeLabel();
}

if (dialog) {
  const video = dialog.querySelector("video");
  const closeButton = dialog.querySelector(".close-dialog");
  const errorMessage = document.querySelector("#video-error");

  document.querySelectorAll("[data-watch]").forEach((button) => {
    button.addEventListener("click", () => {
      dialog.showModal();
      video.load();
      closeButton.focus();
    });
  });

  closeButton.addEventListener("click", () => dialog.close());
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && dialog.open) {
      dialog.close();
    }
  });
  dialog.addEventListener("click", (event) => {
    const bounds = dialog.getBoundingClientRect();
    if (
      event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom
    ) {
      dialog.close();
    }
  });
  dialog.addEventListener("close", () => video.pause());
  video.addEventListener("error", () => {
    if (errorMessage) errorMessage.hidden = false;
  });
  const source = video.querySelector("source");
  if (source) {
    source.addEventListener("error", () => {
      if (errorMessage) errorMessage.hidden = false;
    });
  }
}

/* ==========================================================================
   TOP-OF-PAGE "MILO - COPPERCAP" LIVE CAVE PLAYGROUND ANIMATION
   Digging • Collecting • Running • Pushing — Having Real Fun!
   ========================================================================== */
const miloCanvas = document.getElementById("milo-canvas");
if (miloCanvas) {
  const ctx = miloCanvas.getContext("2d");
  const actionReadout = document.getElementById("milo-action-readout");
  const gemCounterEl = document.getElementById("milo-gem-counter");
  const modeButtons = document.querySelectorAll("[data-milo-mode]");

  const W = miloCanvas.width;
  const H = miloCanvas.height;
  const GROUND_Y = 216;

  let mode = "auto"; // "auto" | "dig" | "collect" | "run" | "push"
  let phaseOrder = ["run", "dig", "collect", "push"];
  let phaseIndex = 0;
  let currentAction = "dig";
  let actionTimer = 0;
  let totalGems = 12;
  if (gemCounterEl) gemCounterEl.textContent = String(totalGems);

  const milo = {
    x: 240,
    y: GROUND_Y,
    vx: 2.8,
    facing: 1,
    bob: 0,
    hopY: 0,
    hopVy: 0,
    swingPhase: 0,
    joyTimer: 0,
  };

  // Interactive cave props along the stage floor
  let dirtClumps = [];
  let gems = [];
  let boulders = [];
  let particles = [];
  let popups = [];

  function resetStageObjects() {
    dirtClumps = [
      { x: 350, hp: 1, maxHp: 1, seed: 1 },
      { x: 405, hp: 1, maxHp: 1, seed: 2 },
      { x: 690, hp: 1, maxHp: 1, seed: 3 },
      { x: 745, hp: 1, maxHp: 1, seed: 4 },
    ];
    gems = [
      { x: 280, y: GROUND_Y - 26, collected: false, bobOffset: 0.2 },
      { x: 495, y: GROUND_Y - 30, collected: false, bobOffset: 1.4 },
      { x: 605, y: GROUND_Y - 26, collected: false, bobOffset: 2.6 },
      { x: 840, y: GROUND_Y - 30, collected: false, bobOffset: 3.8 },
    ];
    boulders = [
      { x: 920, r: 28, rot: 0, vx: 0 },
    ];
  }
  resetStageObjects();

  function spawnDirtBurst(x, y, dir) {
    const colors = ["#9e6b43", "#7d5130", "#c28d5e", "#e59550", "#593a22"];
    for (let i = 0; i < 14; i++) {
      particles.push({
        x,
        y,
        vx: -dir * (1.5 + Math.random() * 4.2) + (Math.random() - 0.5) * 2,
        vy: -(2.5 + Math.random() * 5.2),
        size: 3 + Math.random() * 4.5,
        color: colors[i % colors.length],
        gravity: 0.26,
        life: 1,
        decay: 0.025 + Math.random() * 0.02,
        shape: "clod",
      });
    }
  }

  function spawnGemBurst(x, y) {
    const colors = ["#ffe16a", "#fffbe6", "#fff0a8", "#ffda5c"];
    for (let i = 0; i < 18; i++) {
      const angle = (Math.PI * 2 * i) / 18 + Math.random() * 0.3;
      const speed = 1.8 + Math.random() * 4.2;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: 3.5 + Math.random() * 3.5,
        color: colors[i % colors.length],
        gravity: 0.1,
        life: 1,
        decay: 0.022 + Math.random() * 0.015,
        shape: "sparkle",
      });
    }
  }

  function spawnRunDust(x, y, dir) {
    particles.push({
      x: x - dir * 18,
      y: y - 4,
      vx: -dir * (0.8 + Math.random() * 1.4),
      vy: -(0.5 + Math.random() * 1.2),
      size: 4 + Math.random() * 4,
      color: "rgba(212, 222, 230, 0.55)",
      gravity: -0.02,
      life: 1,
      decay: 0.04,
      shape: "dust",
    });
  }

  function addPopup(text, x, y, color = "#73efd0") {
    popups.push({ text, x, y, vy: -1.1, life: 1, color });
  }

  const READOUT_LABELS = {
    dig: ["js.readout.dig", '⛏️ DIGGING EARTH — "DIG SMART! CHOP-CHOP!"'],
    collect: ["js.readout.collect", '💎 COLLECTING GEMS — "OOOH, SHINY TREASURE!"'],
    run: ["js.readout.run", '🏃 RUNNING THE RIFT — "WHEEE! CATCH ME IF YOU CAN!"'],
    push: ["js.readout.push", '🪨 PUSHING BOULDERS — "HEAVE-HO! ROLL IT!"'],
  };

  function renderReadout() {
    if (!actionReadout) return;
    const entry = READOUT_LABELS[currentAction] || READOUT_LABELS.dig;
    actionReadout.textContent = tr(entry[0], entry[1]);
  }
  document.addEventListener("gemrift:lang", renderReadout);

  function setActionState(act, announcePopup = true) {
    currentAction = act;
    actionTimer = 0;
    renderReadout();
    if (announcePopup) {
      const shout =
        act === "dig" ? tr("js.shout.dig", "⛏️ DIG! DIG!") :
        act === "collect" ? tr("js.shout.collect", "💎 SHINY GEM!") :
        act === "run" ? tr("js.shout.run", "🏃 ZOOMING!") :
        tr("js.shout.push", "🪨 HEAVE-HO!");
      addPopup(shout, milo.x, milo.y - 92, "#ffd18c");
    }
  }

  modeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      mode = btn.dataset.miloMode || "auto";
      modeButtons.forEach((b) => {
        const active = b === btn;
        b.classList.toggle("active", active);
        b.setAttribute("aria-pressed", active ? "true" : "false");
      });
      if (mode === "auto") {
        setActionState(phaseOrder[phaseIndex], true);
      } else {
        setActionState(mode, true);
      }
      if (motionPreference.matches) restartMiloRendering();
    });
  });

  miloCanvas.addEventListener("click", (e) => {
    const rect = miloCanvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * W;
    const clickY = ((e.clientY - rect.top) / rect.height) * H;
    milo.hopVy = -6.5;
    milo.joyTimer = 45;
    totalGems += 1;
    if (gemCounterEl) gemCounterEl.textContent = String(totalGems);
    spawnGemBurst(clickX, clickY);
    addPopup(tr("js.pop.fun", "🎉 HAVING REAL FUN! +1 ♦"), clickX, clickY - 14, "#ffe16a");
    if (motionPreference.matches) restartMiloRendering();
  });

  function drawCaveBackdrop(time) {
    const dark = document.documentElement.dataset.theme === "dark";
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    if (dark) {
      bgGrad.addColorStop(0, "#081219");
      bgGrad.addColorStop(1, "#122531");
    } else {
      bgGrad.addColorStop(0, "#10222c");
      bgGrad.addColorStop(1, "#1b3644");
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Subtle cave background grid tiles
    ctx.strokeStyle = "rgba(115, 239, 208, 0.05)";
    ctx.lineWidth = 1;
    for (let gx = 0; gx < W; gx += 48) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, GROUND_Y);
      ctx.stroke();
    }
    for (let gy = 0; gy < GROUND_Y; gy += 48) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(W, gy);
      ctx.stroke();
    }

    // Distant stalactites & glowing wall crystals
    for (let i = 0; i < 16; i++) {
      const sx = i * 76 + 18;
      const sh = 18 + ((i * 37) % 28);
      ctx.fillStyle = "#18313f";
      ctx.beginPath();
      ctx.moveTo(sx - 16, 0);
      ctx.lineTo(sx + 16, 0);
      ctx.lineTo(sx, sh);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = "#0b1a24";
    ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
    for (let bx = 0; bx < W; bx += 54) {
      ctx.fillStyle = "#2c4559";
      ctx.fillRect(bx + 2, GROUND_Y + 2, 50, 50);
      ctx.strokeStyle = "#dcefff";
      ctx.lineWidth = 3;
      ctx.strokeRect(bx + 5, GROUND_Y + 5, 44, 44);
      ctx.beginPath();
      ctx.moveTo(bx + 14, GROUND_Y + 14);
      ctx.lineTo(bx + 40, GROUND_Y + 40);
      ctx.moveTo(bx + 40, GROUND_Y + 14);
      ctx.lineTo(bx + 14, GROUND_Y + 40);
      ctx.stroke();
    }
  }

  function drawDirtTile(clump, time) {
    if (clump.hp <= 0) return;
    const x = clump.x;
    const y = GROUND_Y;
    const scale = 0.35 + 0.65 * clump.hp;
    const w = 48 * scale;
    const h = 46 * scale;

    ctx.save();
    ctx.translate(x, y);
    // Packed earth mound
    ctx.fillStyle = "#7d5130";
    ctx.strokeStyle = "#172936";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h, w, h, [10, 10, 3, 3]);
    ctx.fill();
    ctx.stroke();

    // Warm soil strata highlights
    ctx.fillStyle = "#9e6b43";
    ctx.beginPath();
    ctx.roundRect(-w / 2 + 5, -h + 5, w - 10, h * 0.42, 6);
    ctx.fill();

    // Copper pebbles inside soil
    ctx.fillStyle = "#c28d5e";
    ctx.beginPath();
    ctx.arc(-w * 0.18, -h * 0.35, 3.5, 0, Math.PI * 2);
    ctx.arc(w * 0.2, -h * 0.6, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawGemItem(gem, time) {
    if (gem.collected) return;
    const bob = Math.sin(time * 4.2 + gem.bobOffset) * 5;
    const x = gem.x;
    const y = gem.y + bob;

    ctx.save();
    ctx.translate(x, y);

    // Glow halo
    const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 26);
    glow.addColorStop(0, "rgba(255, 225, 106, 0.35)");
    glow.addColorStop(1, "rgba(255, 225, 106, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.fill();

    // Faceted diamond shape
    ctx.fillStyle = "#ffe16a";
    ctx.strokeStyle = "#0b1a24";
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(13, 0);
    ctx.lineTo(0, 18);
    ctx.lineTo(-13, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#fffbe6";
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(12, -1);
    ctx.lineTo(-12, -1);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#4a350a";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-12, 0);
    ctx.lineTo(12, 0);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 16);
    ctx.stroke();
    ctx.restore();
  }

  function drawBoulder(b) {
    ctx.save();
    ctx.translate(b.x, GROUND_Y - b.r);
    ctx.rotate(b.rot);

    ctx.fillStyle = "#3d4b59";
    ctx.strokeStyle = "#0b1a24";
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(-b.r * 0.95, -b.r * 0.3);
    ctx.lineTo(-b.r * 0.6, -b.r * 0.8);
    ctx.lineTo(b.r * 0.6, -b.r * 0.75);
    ctx.lineTo(b.r, b.r * 0.4);
    ctx.lineTo(b.r * 0.2, b.r * 0.8);
    ctx.lineTo(-b.r * 0.9, b.r * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#52616f";
    ctx.beginPath();
    ctx.moveTo(-b.r * 0.6, -b.r * 0.7);
    ctx.lineTo(0, -b.r * 0.65);
    ctx.lineTo(-b.r * 0.3, b.r * 0.5);
    ctx.lineTo(-b.r * 0.8, b.r * 0.5);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#c5d1dc";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-7, -16);
    ctx.lineTo(0, -3);
    ctx.lineTo(-8, 14);
    ctx.moveTo(0, -3);
    ctx.lineTo(13, -10);
    ctx.stroke();

    ctx.restore();
  }

  // Authentic Milo Coppercap procedural rig matching MiloArt.cs palette
  function drawMiloCoppercap(time) {
    ctx.save();
    ctx.translate(milo.x, milo.y + milo.hopY);

    // Shadow on cave floor
    ctx.fillStyle = "rgba(10, 20, 28, 0.45)";
    ctx.beginPath();
    ctx.ellipse(0, -milo.hopY, 24, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.scale(milo.facing, 1);

    const isRunning = currentAction === "run";
    const isDigging = currentAction === "dig";
    const isPushing = currentAction === "push";
    const isCollecting = currentAction === "collect";

    const stride = isRunning
      ? Math.sin(time * 16) * 10
      : isPushing
      ? Math.sin(time * 10) * 6
      : Math.sin(time * 8) * 4;
    const bodyBob = Math.abs(Math.sin(time * (isRunning ? 16 : 9))) * (isRunning ? 6 : 3);
    const lean = isPushing ? 0.24 : isRunning ? 0.12 : isDigging ? 0.08 * Math.sin(time * 14) : 0;

    ctx.translate(0, -bodyBob);
    ctx.rotate(lean);

    // Luminous Turquoise Headlamp Cone Beam
    const beamGrad = ctx.createLinearGradient(10, -68, 155, -35);
    beamGrad.addColorStop(0, "rgba(115, 239, 208, 0.38)");
    beamGrad.addColorStop(1, "rgba(115, 239, 208, 0)");
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(10, -68);
    ctx.lineTo(160, -98);
    ctx.lineTo(160, -14);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#172936";
    ctx.lineWidth = 2.6;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    // Honey Trousers & Slate Boots
    // Back leg
    ctx.save();
    ctx.translate(-6, -22);
    ctx.rotate(-stride * 0.05);
    ctx.fillStyle = "#e9b964";
    ctx.beginPath();
    ctx.roundRect(-6, 0, 12, 16, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#2e4b54";
    ctx.beginPath();
    ctx.roundRect(-5, 13, 15, 9, 4);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Front leg
    ctx.save();
    ctx.translate(7, -22);
    ctx.rotate(stride * 0.05);
    ctx.fillStyle = "#e9b964";
    ctx.beginPath();
    ctx.roundRect(-6, 0, 12, 16, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#2e4b54";
    ctx.beginPath();
    ctx.roundRect(-5, 13, 15, 9, 4);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Teal Miner Tunic (#29999a) & Honey Harness Straps (#f5c870)
    ctx.fillStyle = "#29999a";
    ctx.beginPath();
    ctx.roundRect(-17, -48, 34, 28, 9);
    ctx.fill();
    ctx.stroke();

    // Honey Harness Straps + Belt + Brass Buckle
    ctx.strokeStyle = "#f5c870";
    ctx.lineWidth = 4.2;
    ctx.beginPath();
    ctx.moveTo(-10, -46);
    ctx.lineTo(-7, -23);
    ctx.moveTo(10, -46);
    ctx.lineTo(7, -23);
    ctx.stroke();

    ctx.strokeStyle = "#172936";
    ctx.lineWidth = 2.4;
    ctx.fillStyle = "#734c35";
    ctx.fillRect(-17, -26, 34, 6);
    ctx.strokeRect(-17, -26, 34, 6);
    ctx.fillStyle = "#f3cf79";
    ctx.fillRect(-4, -27, 9, 8);
    ctx.strokeRect(-4, -27, 9, 8);

    // Head & Rosy Cheeks
    ctx.fillStyle = "#f5c08d";
    ctx.beginPath();
    ctx.arc(0, -56, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Bushy Brown Beard & Curled Mustache (#955334 / #74412b)
    ctx.fillStyle = "#955334";
    ctx.beginPath();
    ctx.moveTo(-15, -53);
    ctx.quadraticCurveTo(-16, -35, 0, -34);
    ctx.quadraticCurveTo(16, -35, 15, -53);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Big Joyful Smile
    ctx.fillStyle = "#fff3d8";
    ctx.beginPath();
    ctx.arc(2, -45, 5.5, 0, Math.PI);
    ctx.fill();
    ctx.stroke();

    // Curled Mustache Wings
    ctx.fillStyle = "#74412b";
    ctx.beginPath();
    ctx.moveTo(2, -47);
    ctx.quadraticCurveTo(-9, -51, -15, -45);
    ctx.quadraticCurveTo(-8, -42, 2, -46);
    ctx.moveTo(2, -47);
    ctx.quadraticCurveTo(13, -51, 18, -45);
    ctx.quadraticCurveTo(11, -42, 2, -46);
    ctx.fill();
    ctx.stroke();

    // Bright Eyes & Rosy Nose
    ctx.fillStyle = "#fff8df";
    ctx.beginPath();
    ctx.ellipse(-4, -55, 3, 4, 0, 0, Math.PI * 2);
    ctx.ellipse(7, -55, 3, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#172936";
    ctx.beginPath();
    ctx.arc(-3, -55, 1.8, 0, Math.PI * 2);
    ctx.arc(8, -55, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#e9a971";
    ctx.beginPath();
    ctx.arc(3, -51, 3.2, 0, Math.PI * 2);
    ctx.fill();

    // Copper Miner Helmet (#e59550) + Teal Band (#286571) + Brim (#e9b46d)
    ctx.fillStyle = "#e59550";
    ctx.beginPath();
    ctx.arc(0, -61, 18, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#286571";
    ctx.fillRect(-18, -64, 36, 5);
    ctx.strokeRect(-18, -64, 36, 5);

    ctx.fillStyle = "#e9b46d";
    ctx.beginPath();
    ctx.roundRect(-21, -60, 42, 5, 3);
    ctx.fill();
    ctx.stroke();

    // Turquoise Gem Headlamp on Helmet Front (#73efd0)
    ctx.fillStyle = "#f9cd75";
    ctx.beginPath();
    ctx.arc(12, -67, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#73efd0";
    ctx.beginPath();
    ctx.arc(13, -67, 4.2, 0, Math.PI * 2);
    ctx.fill();

    // Front Arm & Action Tool (Pickaxe for Digging/Running, Extended Hands for Pushing, Raised Gem for Collecting!)
    ctx.save();
    ctx.translate(6, -40);
    if (isPushing) {
      // Both arms bracing forward against boulder with strain ring
      ctx.fillStyle = "#29999a";
      ctx.beginPath();
      ctx.roundRect(0, -5, 20, 9, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#815538";
      ctx.beginPath();
      ctx.arc(21, -1, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (isCollecting && milo.joyTimer > 0) {
      // Celebratory raised arm holding a sparkling gem overhead!
      ctx.rotate(-1.15);
      ctx.fillStyle = "#29999a";
      ctx.beginPath();
      ctx.roundRect(-4, -4, 18, 9, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#815538";
      ctx.beginPath();
      ctx.arc(15, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      // Swinging Pickaxe!
      const swing = isDigging
        ? Math.sin(time * 18) * 1.15 - 0.2
        : Math.sin(time * 10) * 0.35 - 0.4;
      ctx.rotate(swing);

      // Arm + Glove
      ctx.fillStyle = "#29999a";
      ctx.beginPath();
      ctx.roundRect(-3, -4, 16, 8, 4);
      ctx.fill();
      ctx.stroke();

      // Wooden Pickaxe Handle (#bb7e49)
      ctx.fillStyle = "#bb7e49";
      ctx.beginPath();
      ctx.roundRect(10, -24, 5, 34, 2);
      ctx.fill();
      ctx.stroke();

      // Curved Steel Pickaxe Head (#aac9cf)
      ctx.fillStyle = "#aac9cf";
      ctx.beginPath();
      ctx.moveTo(0, -22);
      ctx.quadraticCurveTo(13, -32, 26, -18);
      ctx.quadraticCurveTo(13, -21, 0, -22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#815538";
      ctx.beginPath();
      ctx.arc(12, 0, 4.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();

    ctx.restore();
  }

  let lastTime = performance.now();
  let miloFrame = null;

  function updateAndRender(now) {
    const dt = motionPreference.matches ? 0 : Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    const t = motionPreference.matches ? 0 : now / 1000;

    actionTimer += dt;
    if (milo.joyTimer > 0) milo.joyTimer--;

    // Hop physics
    milo.hopY += milo.hopVy;
    milo.hopVy += 0.42;
    if (milo.hopY > 0) {
      milo.hopY = 0;
      milo.hopVy = 0;
    }

    // Auto-cycle through Running -> Digging -> Collecting -> Pushing so Milo is always having a blast
    if (mode === "auto" && actionTimer > 4.2) {
      phaseIndex = (phaseIndex + 1) % phaseOrder.length;
      setActionState(phaseOrder[phaseIndex], true);
    }

    // Behavior per state
    if (currentAction === "dig") {
      // Find nearest intact dirt clump or regenerate them
      let target = dirtClumps.find((d) => d.hp > 0);
      if (!target) {
        dirtClumps.forEach((d) => { d.hp = 1; });
        target = dirtClumps[0];
      }
      const stopX = target.x - 42;
      const dx = stopX - milo.x;
      if (Math.abs(dx) > 6) {
        milo.facing = dx >= 0 ? 1 : -1;
        milo.x += Math.sign(dx) * 3.8;
      } else {
        milo.facing = 1;
        if (Math.floor(t * 12) !== Math.floor((t - dt) * 12)) {
          spawnDirtBurst(target.x - 10, GROUND_Y - 22, 1);
          target.hp -= 0.24;
          if (target.hp <= 0) {
            target.hp = 0;
            milo.hopVy = -5.2;
            addPopup(tr("js.pop.earth", "⛏️ EARTH CLEARED!"), target.x, GROUND_Y - 64, "#ffd18c");
          }
        }
      }
    } else if (currentAction === "collect") {
      let target = gems.find((g) => !g.collected);
      if (!target) {
        gems.forEach((g) => { g.collected = false; });
        target = gems[0];
      }
      const dx = target.x - milo.x;
      milo.facing = dx >= 0 ? 1 : -1;
      milo.x += Math.sign(dx) * 4.4;
      if (Math.abs(dx) < 22) {
        target.collected = true;
        totalGems += 1;
        if (gemCounterEl) gemCounterEl.textContent = String(totalGems);
        milo.hopVy = -6.8;
        milo.joyTimer = 35;
        spawnGemBurst(target.x, target.y);
        addPopup(tr("js.pop.gem", "+1 GEM! ✨ YIPPEE!"), target.x, target.y - 24, "#73efd0");
      }
    } else if (currentAction === "run") {
      milo.x += milo.facing * 5.6;
      if (Math.random() < 0.45) {
        spawnRunDust(milo.x, GROUND_Y, milo.facing);
      }
      if (Math.random() < 0.02 && milo.hopY === 0) {
        milo.hopVy = -5.5;
        addPopup(tr("js.pop.wheee", "🏃 WHEEE!"), milo.x, GROUND_Y - 82, "#a0f4dd");
      }
      if (milo.x > W - 90) milo.facing = -1;
      if (milo.x < 90) milo.facing = 1;

      // Also snatch any gem he sprints past!
      gems.forEach((g) => {
        if (!g.collected && Math.abs(g.x - milo.x) < 24) {
          g.collected = true;
          totalGems += 1;
          if (gemCounterEl) gemCounterEl.textContent = String(totalGems);
          spawnGemBurst(g.x, g.y);
          addPopup(tr("js.pop.gemRun", "+1 GEM ON THE RUN!"), g.x, g.y - 20, "#73efd0");
        }
      });
      if (gems.every((g) => g.collected)) {
        gems.forEach((g) => { g.collected = false; });
      }
    } else if (currentAction === "push") {
      const b = boulders[0];
      const pushDir = b.x > W * 0.55 ? -1 : 1;
      const standX = b.x - pushDir * (b.r + 24);
      const dx = standX - milo.x;
      if (Math.abs(dx) > 8 && Math.sign(dx) === pushDir) {
        milo.facing = dx >= 0 ? 1 : -1;
        milo.x += Math.sign(dx) * 4.2;
      } else {
        milo.facing = pushDir;
        b.x += pushDir * 2.1;
        b.rot += pushDir * 0.075;
        milo.x = b.x - pushDir * (b.r + 22);
        if (Math.random() < 0.35) {
          spawnRunDust(b.x, GROUND_Y, -pushDir);
        }
        if (b.x < 220 || b.x > W - 160) {
          milo.hopVy = -5.5;
          addPopup(tr("js.pop.boulder", "🪨 BOULDER ROLLED!"), b.x, GROUND_Y - 78, "#ffd18c");
          b.x = b.x < 220 ? 880 : 260;
        }
      }
    }

    // Draw full cave scene
    drawCaveBackdrop(t);
    dirtClumps.forEach((d) => drawDirtTile(d, t));
    gems.forEach((g) => drawGemItem(g, t));
    boulders.forEach((b) => drawBoulder(b));
    drawMiloCoppercap(t);

    // Update & render particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.life -= p.decay;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      if (p.shape === "sparkle") {
        ctx.translate(p.x, p.y);
        ctx.rotate(t * 6);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Update & render floating joy popups
    for (let i = popups.length - 1; i >= 0; i--) {
      const pop = popups[i];
      pop.y += pop.vy;
      pop.life -= 0.018;
      if (pop.life <= 0) {
        popups.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = Math.max(0, pop.life);
      ctx.font = '800 13px "Segoe UI", Aptos, sans-serif';
      ctx.textAlign = "center";
      ctx.fillStyle = "#081219";
      ctx.fillText(pop.text, pop.x + 1, pop.y + 1);
      ctx.fillStyle = pop.color;
      ctx.fillText(pop.text, pop.x, pop.y);
      ctx.restore();
    }

    miloFrame = motionPreference.matches ? null : requestAnimationFrame(updateAndRender);
  }

  function restartMiloRendering() {
    if (miloFrame !== null) cancelAnimationFrame(miloFrame);
    lastTime = performance.now();
    updateAndRender(lastTime);
  }

  motionPreference.addEventListener("change", restartMiloRendering);
  for (const event of ["gemrift:lang", "gemrift:theme"]) {
    document.addEventListener(event, () => {
      if (motionPreference.matches) restartMiloRendering();
    });
  }
  setActionState("dig", false);
  restartMiloRendering();
}

/* Scroll-triggered fade-in */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.04 }
);
document.querySelectorAll(".fade-section").forEach((el) => observer.observe(el));

/* Particle canvas — floating cave dust and gem sparkles */
const canvas = document.getElementById("particle-canvas");
if (canvas) {
  const ctx = canvas.getContext("2d");
  let particles = [];
  let animId;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  const isDark = () => document.documentElement.dataset.theme === "dark";

  function createParticles(count) {
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: Math.random() * 0.4 + 0.1,
        opacity: Math.random() * 0.5 + 0.1,
        isGem: Math.random() < 0.15,
        gemHue: Math.random() * 12 + 43,
      });
    }
  }
  createParticles(80);

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (motionPreference.matches) return;
    const dark = isDark();
    particles.forEach((p) => {
      p.x += p.speedX;
      p.y += p.speedY;
      if (p.y > canvas.height + 5) { p.y = -5; p.x = Math.random() * canvas.width; }
      if (p.x < -5) p.x = canvas.width + 5;
      if (p.x > canvas.width + 5) p.x = -5;

      if (p.isGem) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = dark
          ? `hsla(${p.gemHue}, 80%, 70%, ${p.opacity * 0.6})`
          : `hsla(${p.gemHue}, 60%, 40%, ${p.opacity * 0.4})`;
        ctx.fill();
        ctx.shadowBlur = 8;
        ctx.shadowColor = dark
          ? `hsla(${p.gemHue}, 80%, 70%, 0.4)`
          : `hsla(${p.gemHue}, 60%, 40%, 0.3)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = dark ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.4)";
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = dark
          ? `rgba(255,255,255,${p.opacity * 0.3})`
          : `rgba(0,0,0,${p.opacity * 0.15})`;
        ctx.fill();
      }
    });
    animId = requestAnimationFrame(draw);
  }
  draw();

  function restartParticles() {
    cancelAnimationFrame(animId);
    createParticles(80);
    draw();
  }
  document.addEventListener("gemrift:theme", restartParticles);
  motionPreference.addEventListener("change", restartParticles);
}
