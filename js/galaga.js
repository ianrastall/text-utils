/* Galaga arcade remake for Text Utils */
"use strict";

(() => {
  const WIDTH = 960;
  const HEIGHT = 720;
  const SHIP_SPEED = 6;
  const BULLET_SPEED = 13;
  const ENEMY_STEP_BASE = 3.8;
  const ENEMY_EDGE_MARGIN = 60;
  const RESPAWN_FRAMES = 90;
  const FIRE_COOLDOWN = 10;
  const STAR_COUNT = 70;
  const WAVE_DELAY_FRAMES = 90;

  const keysDown = new Set();
  const pointerControls = new Map();

  const state = {
    assets: null,
    ship: null,
    bullets: [],
    enemies: [],
    direction: 1,
    enemyStep: ENEMY_STEP_BASE,
    score: 0,
    wave: 1,
    pendingWave: 0,
    starfield: [],
  };

  let canvas;
  let ctx;
  let scoreElement;
  let announcerElement;
  let tapOverlay;

  function init() {
    canvas = document.getElementById("galaga-canvas");
    if (!canvas) {
      return;
    }

    ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.imageSmoothingEnabled = false;

    scoreElement = document.getElementById("score-value");
    announcerElement = document.getElementById("sr-announcer");
    tapOverlay = document.querySelector(".tap-overlay");

    state.assets = createAssets();

    setupKeyboard();
    setupTouchControls();

    const newGameButton = document.getElementById("new-game-button");
    if (newGameButton) {
      newGameButton.addEventListener("click", () => {
        resetGame();
        announce("New game. Ready player one.");
      });
    }

    canvas.addEventListener("pointerdown", focusCanvas);
    canvas.addEventListener("focus", hideOverlay);
    canvas.addEventListener("click", hideOverlay);

    resetGame({ announce: false });
    announce("Galaga ready. Use the arrow keys to move and press space to fire.");
    requestAnimationFrame(tick);
  }

  function focusCanvas(event) {
    if (event) {
      event.preventDefault();
    }
    hideOverlay();
    if (canvas) {
      canvas.focus({ preventScroll: true });
    }
  }

  function hideOverlay() {
    if (tapOverlay) {
      tapOverlay.classList.add("hidden");
    }
  }

  function setupKeyboard() {
    window.addEventListener("keydown", (event) => {
      if (event.defaultPrevented) {
        return;
      }

      if (event.code === "ArrowLeft" || event.code === "ArrowRight") {
        keysDown.add(event.code);
        focusCanvas();
        event.preventDefault();
      }

      if (event.code === "Space" && !event.repeat) {
        spawnBullet();
        focusCanvas();
        event.preventDefault();
      }
    });

    window.addEventListener("keyup", (event) => {
      if (event.code === "ArrowLeft" || event.code === "ArrowRight") {
        keysDown.delete(event.code);
        event.preventDefault();
      }
    });

    window.addEventListener("blur", () => {
      keysDown.clear();
      pointerControls.clear();
    });
  }

  function setupTouchControls() {
    const root = document.querySelector(".touch-controls");
    if (!root) {
      return;
    }

    const buttons = root.querySelectorAll("button[data-control]");
    buttons.forEach((button) => {
      button.addEventListener("pointerdown", handlePointerDown);
      button.addEventListener("pointerup", handlePointerUp);
      button.addEventListener("pointercancel", handlePointerUp);
      button.addEventListener("pointerleave", handlePointerUp);
    });

    function handlePointerDown(event) {
      const control = event.currentTarget.dataset.control;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      focusCanvas();

      if (control === "left") {
        keysDown.add("ArrowLeft");
        pointerControls.set(event.pointerId, "ArrowLeft");
      } else if (control === "right") {
        keysDown.add("ArrowRight");
        pointerControls.set(event.pointerId, "ArrowRight");
      } else if (control === "fire") {
        spawnBullet();
        pointerControls.set(event.pointerId, "fire");
      }
    }

    function handlePointerUp(event) {
      const control = pointerControls.get(event.pointerId);
      if (control === "ArrowLeft" || control === "ArrowRight") {
        keysDown.delete(control);
      }
      pointerControls.delete(event.pointerId);
    }
  }

  function resetGame(options = {}) {
    const { announce: shouldAnnounce = true } = options;
    keysDown.clear();
    pointerControls.clear();
    state.direction = 1;
    state.enemyStep = ENEMY_STEP_BASE;
    state.bullets = [];
    state.enemies = createEnemies(state.assets.enemy);
    state.ship = createShip(state.assets.ship);
    state.score = 0;
    state.wave = 1;
    state.pendingWave = 0;
    state.starfield = createStarfield();
    updateScore(0);
    focusCanvas();
    if (shouldAnnounce) {
      announce("New game. Ready player one.");
    }
  }

  function createShip(image) {
    return {
      image,
      width: image.width,
      height: image.height,
      x: WIDTH / 2,
      y: HEIGHT - 80,
      dead: false,
      countdown: RESPAWN_FRAMES,
      cooldown: 0,
    };
  }

  function createEnemies(image) {
    const enemies = [];
    const columns = 8;
    const rows = 4;
    const spacingX = 84;
    const spacingY = 70;
    const startX = WIDTH / 2 - ((columns - 1) * spacingX) / 2;
    const startY = 120;

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        enemies.push({
          image,
          width: image.width,
          height: image.height,
          x: startX + column * spacingX,
          y: startY + row * spacingY,
        });
      }
    }
    return enemies;
  }

  function createStarfield() {
    const stars = [];
    for (let index = 0; index < STAR_COUNT; index += 1) {
      stars.push({
        x: Math.random() * WIDTH,
        y: Math.random() * HEIGHT,
        speed: 0.6 + Math.random() * 1.2,
        size: 1 + Math.random() * 2.5,
        alpha: 0.45 + Math.random() * 0.4,
        color: Math.random() > 0.8 ? "#7dd3fc" : "#ffffff",
      });
    }
    return stars;
  }

  function tick() {
    update();
    draw();
    requestAnimationFrame(tick);
  }

  function update() {
    const { ship } = state;
    if (!ship) {
      return;
    }

    updateShip(ship);
    updateBullets();
    updateEnemies();
    updateStarfield();

    if (state.pendingWave > 0) {
      state.pendingWave -= 1;
      if (state.pendingWave === 0) {
        startNextWave();
      }
    }
  }

  function updateShip(ship) {
    if (!ship.dead) {
      if (keysDown.has("ArrowLeft")) {
        ship.x -= SHIP_SPEED;
      }
      if (keysDown.has("ArrowRight")) {
        ship.x += SHIP_SPEED;
      }

      const margin = 36;
      const half = ship.width / 2;
      ship.x = Math.max(half + margin, Math.min(WIDTH - half - margin, ship.x));

      if (ship.cooldown > 0) {
        ship.cooldown -= 1;
      }
    } else {
      ship.countdown -= 1;
      if (ship.countdown <= 0) {
        ship.dead = false;
        ship.countdown = RESPAWN_FRAMES;
        ship.x = WIDTH / 2;
        announce("Ship restored.");
      }
    }
  }

  function spawnBullet() {
    const { ship, assets } = state;
    if (!ship || !assets || ship.dead) {
      return;
    }
    if (ship.cooldown > 0) {
      return;
    }

    const bulletImage = assets.bullet;
    state.bullets.push({
      image: bulletImage,
      width: bulletImage.width,
      height: bulletImage.height,
      x: ship.x,
      y: ship.y - ship.height / 2 - bulletImage.height / 2,
    });
    ship.cooldown = FIRE_COOLDOWN;
  }

  function updateBullets() {
    for (let index = state.bullets.length - 1; index >= 0; index -= 1) {
      const bullet = state.bullets[index];
      bullet.y -= BULLET_SPEED;
      if (bullet.y + bullet.height / 2 < 0) {
        state.bullets.splice(index, 1);
      }
    }
  }

  function updateEnemies() {
    const { enemies } = state;
    if (enemies.length === 0) {
      return;
    }

    let leftEdge = Number.POSITIVE_INFINITY;
    let rightEdge = Number.NEGATIVE_INFINITY;
    enemies.forEach((enemy) => {
      leftEdge = Math.min(leftEdge, enemy.x - enemy.width / 2);
      rightEdge = Math.max(rightEdge, enemy.x + enemy.width / 2);
    });

    let edgeHit = false;
    if (rightEdge > WIDTH - ENEMY_EDGE_MARGIN || leftEdge < ENEMY_EDGE_MARGIN) {
      edgeHit = true;
      state.direction *= -1;
    }

    for (let enemyIndex = enemies.length - 1; enemyIndex >= 0; enemyIndex -= 1) {
      const enemy = enemies[enemyIndex];
      enemy.x += state.enemyStep * state.direction;
      if (edgeHit) {
        const minX = ENEMY_EDGE_MARGIN + enemy.width / 2;
        const maxX = WIDTH - ENEMY_EDGE_MARGIN - enemy.width / 2;
        enemy.x = Math.max(minX, Math.min(maxX, enemy.x));
      }

      let enemyRemoved = false;
      for (let bulletIndex = state.bullets.length - 1; bulletIndex >= 0; bulletIndex -= 1) {
        const bullet = state.bullets[bulletIndex];
        if (intersects(enemy, bullet)) {
          state.bullets.splice(bulletIndex, 1);
          enemies.splice(enemyIndex, 1);
          enemyRemoved = true;
          addScore(150);
          if (state.pendingWave === 0 && enemies.length === 0) {
            state.pendingWave = WAVE_DELAY_FRAMES;
            announce("Formation cleared. New wave incoming.");
          }
          break;
        }
      }

      if (enemyRemoved) {
        continue;
      }

      const { ship } = state;
      if (ship && !ship.dead && intersects(enemy, ship)) {
        ship.dead = true;
        ship.countdown = RESPAWN_FRAMES;
        announce("Ship hit! Respawning.");
      }
    }
  }

  function startNextWave() {
    state.wave += 1;
    state.direction = 1;
    state.enemyStep = ENEMY_STEP_BASE + (state.wave - 1) * 0.5;
    state.enemies = createEnemies(state.assets.enemy);
    state.pendingWave = 0;
    addScore(500);
    announce(`Wave ${state.wave} ready.`);
  }

  function updateStarfield() {
    for (const star of state.starfield) {
      star.y += star.speed;
      if (star.y > HEIGHT) {
        star.y = -star.size;
        star.x = Math.random() * WIDTH;
      }
    }
  }

  function draw() {
    drawBackdrop();

    for (const bullet of state.bullets) {
      drawSprite(bullet);
    }

    for (const enemy of state.enemies) {
      drawSprite(enemy);
    }

    const { ship } = state;
    if (ship) {
      if (!ship.dead) {
        drawSprite(ship);
      } else if (ship.countdown % 12 < 6) {
        ctx.globalAlpha = 0.4;
        drawSprite(ship);
        ctx.globalAlpha = 1;
      }
    }

    if (ship && ship.dead) {
      ctx.save();
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.font = '12px "Press Start 2P", monospace';
      ctx.fillText("RESPAWNING", WIDTH / 2, HEIGHT - 72);
      ctx.restore();
    }
  }

  function drawBackdrop() {
    ctx.fillStyle = "#040106";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    for (const star of state.starfield) {
      ctx.globalAlpha = star.alpha;
      ctx.fillStyle = star.color;
      ctx.fillRect(star.x, star.y, star.size, star.size);
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.font = '16px "Press Start 2P", monospace';
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.fillText(String(state.score).padStart(6, "0"), 16, 16);

    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillText(`WAVE ${state.wave}`, 16, 44);
  }

  function drawSprite(sprite) {
    ctx.drawImage(
      sprite.image,
      sprite.x - sprite.width / 2,
      sprite.y - sprite.height / 2
    );
  }

  function intersects(a, b) {
    return (
      Math.abs(a.x - b.x) < (a.width + b.width) / 2 &&
      Math.abs(a.y - b.y) < (a.height + b.height) / 2
    );
  }

  function addScore(amount) {
    updateScore(state.score + amount);
  }

  function updateScore(nextScore) {
    state.score = Math.max(0, Math.round(nextScore));
    if (scoreElement) {
      scoreElement.textContent = String(state.score).padStart(6, "0");
    }
  }

  function announce(message) {
    if (announcerElement) {
      announcerElement.textContent = message;
    }
  }

  function createAssets() {
    return {
      ship: createShipSprite(),
      enemy: createEnemySprite(),
      bullet: createBulletSprite(),
    };
  }

  function createShipSprite() {
    return createSpriteCanvas(48, 48, (context, width, height) => {
      context.clearRect(0, 0, width, height);
      const midX = width / 2;

      context.fillStyle = "#1f8eed";
      context.beginPath();
      context.moveTo(midX, 4);
      context.lineTo(width - 8, height - 12);
      context.lineTo(midX, height - 20);
      context.lineTo(8, height - 12);
      context.closePath();
      context.fill();

      context.fillStyle = "#0ea5e9";
      context.fillRect(midX - 10, height - 32, 20, 6);

      context.fillStyle = "#ffffff";
      context.fillRect(midX - 3, height - 30, 6, 18);

      context.fillStyle = "#f43f5e";
      context.fillRect(midX - 2, height - 12, 4, 10);
    });
  }

  function createEnemySprite() {
    return createSpriteCanvas(40, 36, (context, width, height) => {
      context.clearRect(0, 0, width, height);
      const midX = width / 2;
      const bodyHeight = height - 6;

      context.fillStyle = "#3fde5d";
      context.beginPath();
      context.moveTo(midX, 4);
      context.quadraticCurveTo(width - 4, bodyHeight / 2, midX, bodyHeight);
      context.quadraticCurveTo(4, bodyHeight / 2, midX, 4);
      context.fill();

      context.fillStyle = "#1b4332";
      context.fillRect(midX - 6, bodyHeight / 2 - 6, 12, 12);

      context.fillStyle = "#f9dc5c";
      context.fillRect(midX - 3, bodyHeight / 2 - 3, 6, 6);
    });
  }

  function createBulletSprite() {
    return createSpriteCanvas(6, 18, (context, width, height) => {
      context.clearRect(0, 0, width, height);
      context.fillStyle = "#facc15";
      context.fillRect(0, 0, width, height);
      context.fillStyle = "#ffffff";
      context.fillRect(1, 2, width - 2, height - 4);
    });
  }

  function createSpriteCanvas(width, height, draw) {
    const spriteCanvas = document.createElement("canvas");
    spriteCanvas.width = width;
    spriteCanvas.height = height;
    const context = spriteCanvas.getContext("2d");
    if (context) {
      context.imageSmoothingEnabled = false;
      draw(context, width, height);
    }
    return spriteCanvas;
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (window.ComponentLoader && typeof window.ComponentLoader.loadAll === "function") {
      window.ComponentLoader.loadAll().catch((error) => {
        console.error("Failed to load shared components:", error);
      });
    }
    init();
  });
})();
