document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas?.getContext('2d');
    const scoreBadge = document.getElementById('scoreBadge');
    const livesBadge = document.getElementById('livesBadge');
    const waveBadge = document.getElementById('waveBadge');
    const startButton = document.getElementById('startButton');
    const pauseButton = document.getElementById('pauseButton');
    const muteButton = document.getElementById('muteButton');
    const touchControls = document.getElementById('touchControls');
    const powerupLog = document.getElementById('powerupLog');
    const announcer = document.getElementById('sr-announcer');

    if (!canvas || !ctx) {
        console.warn('Space Invaders tool: canvas not available.');
        return;
    }

    const WORLD = {
        width: canvas.width,
        height: canvas.height,
    };

    const PLAYER = {
        width: 44,
        height: 24,
        speed: 240, // px per second
        cooldown: 0.35,
        color: '#6cf1ff',
    };

    const ENEMY = {
        rowsBase: 4,
        colsBase: 8,
        spacingX: 58,
        spacingY: 40,
        width: 40,
        height: 28,
        color: '#ffb347',
        descendStep: 30,
    };

    const ENEMY_TYPE_CONFIG = {
        fighter: {
            hp: 1,
            points: 120,
        },
        bomber: {
            hp: 3,
            points: 200,
        },
        scout: {
            hp: 1,
            points: 160,
        },
    };

    const ENEMY_TYPE_ORDER = ['fighter', 'scout', 'bomber'];

    const PROJECTILE = {
        width: 4,
        height: 12,
        speedPlayer: 330,
        speedEnemy: 170,
        colorPlayer: '#b1f2ff',
        colorEnemy: '#ff4f6d',
    };

    const POWERUPS = ['Shield Boost', 'Rapid Fire', 'Score Multiplier'];

    let audioEnabled = true;
    let audioCtx;

    function announce(message) {
        if (!announcer) return;
        announcer.textContent = '';
        setTimeout(() => { announcer.textContent = message; }, 60);
    }

    function playTone(frequency = 440, duration = 0.1) {
        if (!audioEnabled) return;
        try {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            const oscillator = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            oscillator.type = 'square';
            oscillator.frequency.value = frequency;
            gain.gain.value = 0.08;
            oscillator.connect(gain);
            gain.connect(audioCtx.destination);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + duration);
        } catch (error) {
            console.warn('Audio playback failed', error);
            audioEnabled = false;
        }
    }

    const state = {
        running: false,
        paused: false,
        lastFrame: 0,
        score: 0,
        lives: 3,
        wave: 1,
        combo: 0,
        player: {
            x: WORLD.width / 2 - PLAYER.width / 2,
            y: WORLD.height - PLAYER.height - 16,
            cooldown: 0,
            angle: 0,
            thruster: false,
        },
        bullets: [],
        enemyBullets: [],
        enemies: [],
        direction: 1,
        dropTimer: 0,
        touchActive: { left: false, right: false, fire: false },
    };

    function resetState() {
        state.running = true;
        state.paused = false;
        state.lastFrame = performance.now();
        state.score = 0;
        state.combo = 0;
        state.lives = 3;
        state.wave = 1;
        state.bullets = [];
        state.enemyBullets = [];
        state.player.x = WORLD.width / 2 - PLAYER.width / 2;
        state.player.cooldown = 0;
    state.player.angle = 0;
    state.player.thruster = false;
        addPowerupLog('Mission ready. Good luck, pilot!');
        spawnWave();
        updateHUD();
        announce('Game started. Defend the sector.');
        requestAnimationFrame(gameLoop);
    }

    function spawnWave() {
        const rows = ENEMY.rowsBase + Math.min(3, state.wave - 1);
        const cols = ENEMY.colsBase;
        const offsetX = (WORLD.width - (cols - 1) * ENEMY.spacingX) / 2 - ENEMY.width / 2;
        const offsetY = 40;
        state.enemies = [];
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const type = ENEMY_TYPE_ORDER[(row + col) % ENEMY_TYPE_ORDER.length];
                const config = ENEMY_TYPE_CONFIG[type] || ENEMY_TYPE_CONFIG.fighter;
                const hpBonus = Math.max(0, Math.floor((state.wave - 1) / 3));
                state.enemies.push({
                    x: offsetX + col * ENEMY.spacingX,
                    y: offsetY + row * ENEMY.spacingY,
                    width: ENEMY.width,
                    height: ENEMY.height,
                    hp: config.hp + hpBonus,
                    type,
                    points: config.points,
                    phase: Math.random() * Math.PI * 2,
                });
            }
        }
        state.direction = 1;
        state.dropTimer = 0;
    }

    function updateHUD() {
        if (scoreBadge) scoreBadge.textContent = `Score: ${state.score}`;
        if (livesBadge) livesBadge.textContent = `Lives: ${state.lives}`;
        if (waveBadge) waveBadge.textContent = `Wave: ${state.wave}`;
    }

    function addPowerupLog(message) {
        if (!powerupLog) return;
        const item = document.createElement('li');
        item.textContent = message;
        powerupLog.insertBefore(item, powerupLog.firstChild);
        while (powerupLog.children.length > 6) {
            powerupLog.removeChild(powerupLog.lastChild);
        }
    }

    const keys = new Set();

    function handleKeyDown(event) {
        if (event.repeat) return;
        keys.add(event.key.toLowerCase());
        if (event.key === ' ') {
            shootPlayer();
            event.preventDefault();
        } else if (event.key.toLowerCase() === 'p') {
            togglePause();
        }
    }

    function handleKeyUp(event) {
        keys.delete(event.key.toLowerCase());
    }

    function shootPlayer() {
        if (!state.running || state.paused) return;
        if (state.player.cooldown > 0) return;
        state.bullets.push({
            x: state.player.x + PLAYER.width / 2 - PROJECTILE.width / 2,
            y: state.player.y - PROJECTILE.height,
            width: PROJECTILE.width,
            height: PROJECTILE.height,
            dir: -1,
        });
        state.player.cooldown = PLAYER.cooldown;
        playTone(720, 0.08);
    }

    function togglePause() {
        if (!state.running) return;
        state.paused = !state.paused;
        pauseButton?.classList.toggle('btn-warning', state.paused);
        pauseButton?.classList.toggle('btn-secondary', !state.paused);
        pauseButton.textContent = state.paused ? 'Resume' : 'Pause';
        const icon = document.createElement('span');
        icon.className = 'material-icons me-1';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = state.paused ? 'play_arrow' : 'pause';
        pauseButton.prepend(icon);
        announce(state.paused ? 'Game paused.' : 'Game resumed.');
        if (!state.paused) {
            state.lastFrame = performance.now();
            requestAnimationFrame(gameLoop);
        }
    }

    function update(delta) {
        const moveLeft = keys.has('arrowleft') || keys.has('a') || state.touchActive.left;
        const moveRight = keys.has('arrowright') || keys.has('d') || state.touchActive.right;
        if (moveLeft) {
            state.player.x = Math.max(8, state.player.x - PLAYER.speed * delta);
        } else if (moveRight) {
            state.player.x = Math.min(WORLD.width - PLAYER.width - 8, state.player.x + PLAYER.speed * delta);
        }
        const tiltTarget = moveRight ? 0.18 : moveLeft ? -0.18 : 0;
        state.player.angle += (tiltTarget - state.player.angle) * 0.2;
        if (Math.abs(state.player.angle) < 0.005 && tiltTarget === 0) {
            state.player.angle = 0;
        }
        state.player.thruster = moveLeft || moveRight || state.touchActive.left || state.touchActive.right;
        if ((keys.has(' ') || keys.has('space')) || state.touchActive.fire) {
            shootPlayer();
        }

        if (state.player.cooldown > 0) {
            state.player.cooldown = Math.max(0, state.player.cooldown - delta);
        }

        state.bullets = state.bullets.filter(bullet => {
            bullet.y += bullet.dir * PROJECTILE.speedPlayer * delta;
            return bullet.y + bullet.height >= 0;
        });

        state.enemyBullets = state.enemyBullets.filter(bullet => {
            bullet.y += PROJECTILE.speedEnemy * delta;
            if (bullet.y > WORLD.height) return false;
            if (rectIntersect(bullet, state.player)) {
                damagePlayer();
                return false;
            }
            return true;
        });

        let reachedEdge = false;
        state.enemies.forEach(enemy => {
            enemy.x += state.direction * (40 + state.wave * 4) * delta;
            if (enemy.x < 16 || enemy.x + enemy.width > WORLD.width - 16) {
                reachedEdge = true;
            }
        });

        state.dropTimer += delta;
        if (state.dropTimer > Math.max(0.6 - state.wave * 0.05, 0.2)) {
            state.dropTimer = 0;
            fireEnemy();
        }

        if (reachedEdge) {
            state.direction *= -1;
            state.enemies.forEach(enemy => {
                enemy.y += ENEMY.descendStep;
                if (enemy.y + enemy.height >= state.player.y) {
                    state.lives = 0;
                }
            });
        }

        resolveCollisions();

        if (state.enemies.length === 0) {
            state.wave += 1;
            state.combo = 0;
            spawnWave();
            addPowerupLog(`Wave ${state.wave} incoming. Formation detected.`);
            announce(`Wave ${state.wave} ready.`);
        }
    }

    function resolveCollisions() {
        state.bullets = state.bullets.filter(bullet => {
            let hit = false;
            for (let i = state.enemies.length - 1; i >= 0; i--) {
                const enemy = state.enemies[i];
                if (rectIntersect(bullet, enemy)) {
                    enemy.hp -= 1;
                    if (enemy.hp <= 0) {
                        state.enemies.splice(i, 1);
                        state.combo += 1;
                        const basePoints = enemy.points || 100;
                        const bonus = basePoints + state.combo * 10 * state.wave;
                        state.score += bonus;
                        if (Math.random() < 0.1) {
                            const power = POWERUPS[Math.floor(Math.random() * POWERUPS.length)];
                            addPowerupLog(`Power-up collected: ${power}`);
                            handlePowerup(power);
                        }
                        playTone(540, 0.12);
                    }
                    hit = true;
                    break;
                }
            }
            return !hit;
        });

        if (state.lives <= 0) {
            gameOver();
        }
    }

    function handlePowerup(power) {
        switch (power) {
            case 'Shield Boost':
                state.lives = Math.min(5, state.lives + 1);
                announce('Shield boosted. Extra life secured.');
                break;
            case 'Rapid Fire':
                state.player.cooldown = Math.max(0, state.player.cooldown - 0.15);
                PLAYER.cooldown = Math.max(0.15, PLAYER.cooldown - 0.05);
                announce('Rapid fire engaged.');
                break;
            case 'Score Multiplier':
                state.score += 500;
                announce('Score multiplier activated. +500 points.');
                break;
            default:
                break;
        }
        updateHUD();
    }

    function fireEnemy() {
        if (state.enemies.length === 0) return;
        const shooters = state.enemies.filter(enemy => enemy.y > 0);
        if (shooters.length === 0) return;
        const shooter = shooters[Math.floor(Math.random() * shooters.length)];
        state.enemyBullets.push({
            x: shooter.x + shooter.width / 2 - PROJECTILE.width / 2,
            y: shooter.y + shooter.height,
            width: PROJECTILE.width,
            height: PROJECTILE.height,
        });
        playTone(260, 0.1);
    }

    function damagePlayer() {
        state.lives -= 1;
        state.combo = 0;
        playTone(150, 0.25);
        addPowerupLog('Hull breach detected. Shield integrity reduced.');
        state.player.x = WORLD.width / 2 - PLAYER.width / 2;
        if (state.lives <= 0) {
            gameOver();
        } else {
            announce(`Warning. Hull integrity at ${state.lives} lives.`);
        }
        updateHUD();
    }

    function gameOver() {
        state.running = false;
        state.paused = false;
        state.player.thruster = false;
        state.player.angle = 0;
        addPowerupLog(`Mission failed. Final score: ${state.score}.`);
        announce(`Game over. Final score ${state.score}. Press start to try again.`);
    }

    function draw() {
        ctx.clearRect(0, 0, WORLD.width, WORLD.height);

        // Background stars
        ctx.fillStyle = '#0a1630';
        ctx.fillRect(0, 0, WORLD.width, WORLD.height);
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        for (let i = 0; i < 45; i++) {
            const x = (i * 71 + (state.lastFrame / (i + 3))) % WORLD.width;
            const y = (i * 131 + (state.lastFrame / (i + 5))) % WORLD.height;
            ctx.fillRect(x, y, 2, 2);
        }

        // Player
        drawPlayerShip();

        // Player bullets
        ctx.fillStyle = PROJECTILE.colorPlayer;
        state.bullets.forEach(bullet => {
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });

        // Enemies
        state.enemies.forEach(enemy => {
            drawEnemyShip(enemy);
        });

        // Enemy bullets
        ctx.fillStyle = PROJECTILE.colorEnemy;
        state.enemyBullets.forEach(bullet => {
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });

        if (!state.running) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
            ctx.fillRect(0, 0, WORLD.width, WORLD.height);
            ctx.fillStyle = '#ffffff';
            ctx.font = '28px "Roboto", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Press Start to defend the sector', WORLD.width / 2, WORLD.height / 2);
        } else if (state.paused) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
            ctx.fillRect(0, 0, WORLD.width, WORLD.height);
            ctx.fillStyle = '#ffffff';
            ctx.font = '32px "Roboto", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Paused', WORLD.width / 2, WORLD.height / 2);
        }
    }

    function getEnemyTotalHp(type) {
        const base = ENEMY_TYPE_CONFIG[type]?.hp ?? 1;
        const bonus = Math.max(0, Math.floor((state.wave - 1) / 3));
        return base + bonus;
    }

    function drawPlayerShip() {
        ctx.save();
        const centerX = state.player.x + PLAYER.width / 2;
        const centerY = state.player.y + PLAYER.height / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate(state.player.angle || 0);

        const hullGradient = ctx.createLinearGradient(-18, 0, 22, 0);
        hullGradient.addColorStop(0, '#2f7ed9');
        hullGradient.addColorStop(0.5, '#6bb6ff');
        hullGradient.addColorStop(1, '#2f7ed9');

        ctx.fillStyle = hullGradient;
        ctx.beginPath();
        ctx.moveTo(22, 0);
        ctx.lineTo(6, -10);
        ctx.lineTo(-6, -6);
        ctx.lineTo(-18, -3);
        ctx.lineTo(-18, 3);
        ctx.lineTo(-6, 6);
        ctx.lineTo(6, 10);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#1f3f7a';
        ctx.beginPath();
        ctx.moveTo(6, -10);
        ctx.lineTo(-2, -22);
        ctx.lineTo(-16, -12);
        ctx.lineTo(-8, -6);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(6, 10);
        ctx.lineTo(-2, 22);
        ctx.lineTo(-16, 12);
        ctx.lineTo(-8, 6);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.ellipse(6, 0, 5, 3.8, 0, 0, Math.PI * 2);
        ctx.fill();

        if (state.player.thruster) {
            const flicker = 10 + Math.random() * 8;
            const flameGradient = ctx.createLinearGradient(-28, 0, -12, 0);
            flameGradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
            flameGradient.addColorStop(0.35, 'rgba(255, 220, 120, 0.75)');
            flameGradient.addColorStop(0.7, 'rgba(255, 120, 40, 0.55)');
            flameGradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
            ctx.fillStyle = flameGradient;
            ctx.beginPath();
            ctx.moveTo(-18, -4);
            ctx.lineTo(-18 - flicker, 0);
            ctx.lineTo(-18, 4);
            ctx.closePath();
            ctx.fill();
        }

        ctx.strokeStyle = 'rgba(15, 42, 92, 0.9)';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(14, 0);
        ctx.lineTo(-10, 0);
        ctx.moveTo(0, -5);
        ctx.lineTo(0, 5);
        ctx.stroke();

        ctx.restore();

        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = '#86c7ff';
        ctx.beginPath();
        ctx.ellipse(centerX, state.player.y + PLAYER.height, PLAYER.width * 0.22, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function drawEnemyShip(enemy) {
        const centerX = enemy.x + enemy.width / 2;
        const centerY = enemy.y + enemy.height / 2;
        ctx.save();
        ctx.translate(centerX, centerY);
        const wobble = Math.sin((state.lastFrame / 320) + enemy.phase) * 0.12;
        ctx.rotate(wobble);

        switch (enemy.type) {
            case 'bomber':
                drawBomberEnemy(enemy);
                break;
            case 'scout':
                drawScoutEnemy(enemy);
                break;
            case 'fighter':
            default:
                drawFighterEnemy(enemy);
                break;
        }

        ctx.restore();

        const hoverOpacity = 0.18 + (Math.sin((state.lastFrame / 260) + enemy.phase) + 1) * 0.12;
        ctx.save();
        ctx.globalAlpha = hoverOpacity;
        ctx.fillStyle = 'rgba(190, 220, 255, 0.65)';
        ctx.beginPath();
        ctx.ellipse(centerX, enemy.y + enemy.height + 3, enemy.width * 0.24, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        const totalHp = getEnemyTotalHp(enemy.type);
        if (enemy.hp < totalHp) {
            const ratio = Math.max(0, Math.min(1, enemy.hp / totalHp));
            const barWidth = enemy.width * 0.6;
            const barX = enemy.x + (enemy.width - barWidth) / 2;
            const barY = enemy.y - 6;
            ctx.save();
            ctx.fillStyle = 'rgba(20, 20, 20, 0.6)';
            ctx.fillRect(barX, barY, barWidth, 4);
            ctx.fillStyle = '#ffcc66';
            ctx.fillRect(barX, barY, barWidth * ratio, 4);
            ctx.restore();
        }
    }

    function drawFighterEnemy(enemy) {
        const gradient = ctx.createLinearGradient(-16, 0, 16, 0);
        gradient.addColorStop(0, '#ff3b3b');
        gradient.addColorStop(0.5, '#ff6969');
        gradient.addColorStop(1, '#ff3b3b');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(18, 0);
        ctx.lineTo(2, -12);
        ctx.lineTo(-14, -8);
        ctx.lineTo(-20, 0);
        ctx.lineTo(-14, 8);
        ctx.lineTo(2, 12);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#c91d1d';
        ctx.beginPath();
        ctx.moveTo(-6, -9);
        ctx.lineTo(-12, -18);
        ctx.lineTo(-18, -10);
        ctx.lineTo(-12, -6);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-6, 9);
        ctx.lineTo(-12, 18);
        ctx.lineTo(-18, 10);
        ctx.lineTo(-12, 6);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 80, 80, 0.85)';
        ctx.beginPath();
        ctx.arc(4, 0, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(120, 0, 0, 0.8)';
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(6, -6);
        ctx.lineTo(-10, -2);
        ctx.moveTo(6, 6);
        ctx.lineTo(-10, 2);
        ctx.stroke();
    }

    function drawBomberEnemy(enemy) {
        const gradient = ctx.createLinearGradient(-18, 0, 18, 0);
        gradient.addColorStop(0, '#7f4dff');
        gradient.addColorStop(0.5, '#a77bff');
        gradient.addColorStop(1, '#7f4dff');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(16, -2);
        ctx.lineTo(12, -12);
        ctx.lineTo(-12, -14);
        ctx.lineTo(-20, -6);
        ctx.lineTo(-20, 6);
        ctx.lineTo(-12, 14);
        ctx.lineTo(12, 12);
        ctx.lineTo(16, 2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#5e2ed3';
        ctx.fillRect(-10, -16, 10, 4);
        ctx.fillRect(-10, 12, 10, 4);

        ctx.fillStyle = '#3b158f';
        ctx.beginPath();
        ctx.arc(-16, -6, 3.5, 0, Math.PI * 2);
        ctx.arc(-16, 6, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(170, 120, 255, 0.9)';
        ctx.fillRect(4, -4, 8, 8);

        const glow = ctx.createRadialGradient(-20, 0, 0, -20, 0, 14);
        glow.addColorStop(0, 'rgba(150, 120, 255, 0.7)');
        glow.addColorStop(1, 'rgba(150, 120, 255, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.ellipse(-20, 0, 12, 6, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawScoutEnemy(enemy) {
        const gradient = ctx.createLinearGradient(-14, 0, 18, 0);
        gradient.addColorStop(0, '#3bff6a');
        gradient.addColorStop(0.5, '#6dff94');
        gradient.addColorStop(1, '#3bff6a');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(20, 0);
        ctx.bezierCurveTo(10, -5, -6, -8, -14, -4);
        ctx.lineTo(-14, 4);
        ctx.bezierCurveTo(-6, 8, 10, 5, 20, 0);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#1fb455';
        ctx.beginPath();
        ctx.moveTo(2, -4);
        ctx.lineTo(-16, -10);
        ctx.lineTo(-10, -2);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(2, 4);
        ctx.lineTo(-16, 10);
        ctx.lineTo(-10, 2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'rgba(120, 255, 170, 0.75)';
        ctx.beginPath();
        ctx.ellipse(6, 0, 4.5, 2.6, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(18, 120, 50, 0.7)';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(8, -3);
        ctx.lineTo(-6, -1);
        ctx.moveTo(8, 3);
        ctx.lineTo(-6, 1);
        ctx.stroke();
    }

    function gameLoop(timestamp) {
        if (!state.running) {
            draw();
            return;
        }
        const delta = Math.min((timestamp - state.lastFrame) / 1000, 0.033);
        state.lastFrame = timestamp;

        if (!state.paused) {
            update(delta);
            updateHUD();
            draw();
            requestAnimationFrame(gameLoop);
        } else {
            draw();
        }
    }

    function rectIntersect(a, b) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }

    function handleTouch(action, active) {
        if (action === 'left' || action === 'right' || action === 'fire') {
            state.touchActive[action] = active;
            if (action === 'fire' && active) {
                shootPlayer();
            }
        }
    }

    startButton?.addEventListener('click', () => {
        resetState();
    });

    pauseButton?.addEventListener('click', () => {
        togglePause();
    });

    muteButton?.addEventListener('click', () => {
        audioEnabled = !audioEnabled;
        muteButton.classList.toggle('btn-outline-light', !audioEnabled);
        muteButton.classList.toggle('btn-secondary', audioEnabled);
        muteButton.innerHTML = audioEnabled
            ? '<span class="material-icons" aria-hidden="true">volume_up</span> Sound On'
            : '<span class="material-icons" aria-hidden="true">volume_off</span> Sound Off';
        announce(`Sound ${audioEnabled ? 'enabled' : 'muted'}.`);
    });

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    if (touchControls) {
        touchControls.addEventListener('pointerdown', (event) => {
            const action = event.target.closest('button')?.dataset.action;
            if (action) {
                handleTouch(action, true);
                event.preventDefault();
            }
        });
        touchControls.addEventListener('pointerup', (event) => {
            const action = event.target.closest('button')?.dataset.action;
            if (action) {
                handleTouch(action, false);
                event.preventDefault();
            }
        });
        touchControls.addEventListener('pointerleave', (event) => {
            const action = event.target.closest('button')?.dataset.action;
            if (action) {
                handleTouch(action, false);
            }
        });
        touchControls.addEventListener('pointercancel', (event) => {
            const action = event.target.closest('button')?.dataset.action;
            if (action) {
                handleTouch(action, false);
            }
        });
    }

    // Render idle screen
    draw();
});
