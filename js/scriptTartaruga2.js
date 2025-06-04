const sacolaImg = document.getElementById("imgSacola");
const tartarugaImg = document.getElementById("imgTartaruga");
const aguaVivaImg = document.getElementById("imgAguaViva");
const redeImg = document.getElementById("imgRede");

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const info = document.getElementById("info");
const timeDisplay = document.getElementById("time");
const moveSound = document.getElementById("moveSound");

const objScale = 1.5;
const trashSize = 50 * objScale;
const heartSize = 40 * objScale;
const netWidth = 110 * objScale;
const netHeight = 66 * objScale;

const turtle = {
  x: 0,
  y: 0,
  size: 50 * objScale,
  speed: 8 * objScale
};

const gameState = {
  lives: 3,
  timeLeft: 60,
  gameOver: false,
  invulnerable: false,
  hasShield: false,
  flashTimer: 0,
  paused: false,
  shieldEndTime: null,
  blueFlash: false,
  blueFlashTimer: 0,
  trash: [],
  hearts: [],
  nets: [],
  particles: [],
  trashInterval: 500,
  trashSpeedMultiplier: 1
};


function createParticles(x, y, color = "white") {
  for (let i = 0; i < 10; i++) {
    gameState.particles.push({
      x,
      y,
      radius: 2 + Math.random() * 2,
      dx: (Math.random() - 0.5) * 4,
      dy: (Math.random() - 0.5) * 4,
      alpha: 1,
      color
    });
  }
}

function drawParticles() {
  gameState.particles.forEach(p => {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function updateParticles() {
  gameState.particles.forEach(p => {
    p.x += p.dx;
    p.y += p.dy;
    p.alpha -= 0.02;
  });
  for (let i = gameState.particles.length - 1; i >= 0; i--) {
    if (gameState.particles[i].alpha <= 0) gameState.particles.splice(i, 1);
  }
}

function drawTurtle() {
  gameState.flashTimer++;

  if (gameState.blueFlash) {
    gameState.blueFlashTimer--;
    if (gameState.blueFlashTimer <= 0) gameState.blueFlash = false;
  }

  const isBlueVisible = gameState.blueFlash && gameState.flashTimer % 10 < 5;
  const shouldSkip = gameState.invulnerable && !gameState.blueFlash && gameState.flashTimer % 20 < 10;

  if (shouldSkip) return;

  ctx.save();

  if (isBlueVisible) {
    ctx.globalAlpha = 0.8;
    ctx.filter = "hue-rotate(220deg) brightness(1.5)";
  } else if (gameState.hasShield && gameState.invulnerable) {
    ctx.globalAlpha = 0.5;
  }

  ctx.drawImage(tartarugaImg, turtle.x, turtle.y, turtle.size, turtle.size);
  ctx.restore();

  if (gameState.hasShield) {
    let flash = true;
    if (gameState.shieldEndTime) {
      const remaining = gameState.shieldEndTime - Date.now();
      if (remaining < 2000) {
        flash = Math.floor(Date.now() / 200) % 2 === 0;
      }
    }
    if (flash) {
      ctx.strokeStyle = "deepskyblue";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(
        turtle.x + turtle.size / 2,
        turtle.y + turtle.size / 2,
        turtle.size / 1.8,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
  }
}

function drawTrash() {
  gameState.trash.forEach(item => ctx.drawImage(sacolaImg, item.x, item.y, trashSize, trashSize));
}

function drawHearts() {
  gameState.hearts.forEach(item => ctx.drawImage(aguaVivaImg, item.x, item.y, heartSize, heartSize));
}

function drawNets() {
  gameState.nets.forEach(net => ctx.drawImage(redeImg, net.x, net.y, netWidth, netHeight));
}

function moveTrash() {
  gameState.trash.forEach(item => item.y += item.speed);
  gameState.hearts.forEach(item => item.y += item.speed);
  gameState.nets.forEach(net => {
    net.y += net.vy;
    net.x += net.vx;
    if (net.x <= 0 || net.x + netWidth >= canvas.width) net.vx *= -1;
  });
}

function isColliding(x, y, w, h) {
  const dx = (turtle.x + turtle.size / 2) - (x + w / 2);
  const dy = (turtle.y + turtle.size / 2) - (y + h / 2);
  return Math.hypot(dx, dy) < turtle.size / 1.5;
}

function detectCollision() {
  if (!gameState.invulnerable) {
    for (let i = 0; i < gameState.trash.length; i++) {
      if (isColliding(gameState.trash[i].x, gameState.trash[i].y, trashSize, trashSize)) {
        gameState.trash.splice(i, 1);
        applyDamage();
        break;
      }
    }
    for (let i = 0; i < gameState.nets.length; i++) {
      if (isColliding(gameState.nets[i].x, gameState.nets[i].y, netWidth, netHeight)) {
        gameState.nets.splice(i, 1);
        applyDamage();
        break;
      }
    }
  }
  for (let i = 0; i < gameState.hearts.length; i++) {
    if (isColliding(gameState.hearts[i].x, gameState.hearts[i].y, heartSize, heartSize)) {
  gameState.hearts.splice(i, 1);
  heartSound.currentTime = 0;
  heartSound.play();
  
  if (gameState.lives < 3) {
    gameState.lives++;
  } else {
    activateShield();
  }
  updateInfo();
  break;
}
  }
}


const collisionSound = document.getElementById("collisionSound");
const heartSound = document.getElementById("heartSound");

function applyDamage() {
  collisionSound.currentTime = 0;
  collisionSound.play();

  const particleColor = gameState.hasShield ? "deepskyblue" : "white";
  createParticles(turtle.x + turtle.size / 2, turtle.y + turtle.size / 2, particleColor);

  if (gameState.hasShield) {
    gameState.hasShield = false;
    gameState.shieldEndTime = null;
    gameState.blueFlash = true;
    gameState.blueFlashTimer = 20;
  } else {
    gameState.lives--;

    if (gameState.lives === 0) {
      gameState.gameOver = true;
  
    } else {
      triggerInvulnerability();
    }
  }
  updateInfo();
}

function triggerInvulnerability() {
  gameState.invulnerable = true;
  gameState.flashTimer = 0;
  setTimeout(() => {
    gameState.invulnerable = false;
  }, 2000);
}

function activateShield() {
  gameState.hasShield = true;
  gameState.shieldEndTime = Date.now() + 10000;
  setTimeout(() => {
    gameState.hasShield = false;
    gameState.shieldEndTime = null;
  }, 10000);
}

function updateInfo() {
  info.innerHTML = `Vidas: ${"❤️".repeat(gameState.lives)} ${gameState.hasShield ? "🛡️" : ""} | Tempo: <span id="time">${gameState.timeLeft}</span>s`;
}


function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawTurtle();
  drawTrash();
  drawHearts();
  drawNets();
  drawParticles();
}

function update() {
  if (!gameState.gameOver && !gameState.paused) {
    moveTrash();
    detectCollision();
    updateParticles();
    draw();
  }
}

function spawnTrash() {
  if (!gameState.gameOver && !gameState.paused) {
    if (Math.random() < 0.2) {
      gameState.trash.push({
        x: Math.random() * (canvas.width - trashSize),
        y: -trashSize,
        speed: (2 + Math.random() * 2) * gameState.trashSpeedMultiplier
      });
    }
  }
  setTimeout(spawnTrash, gameState.trashInterval);
}

function spawnHeart() {
  if (!gameState.gameOver && !gameState.paused) {
    gameState.hearts.push({
      x: Math.random() * (canvas.width - heartSize),
      y: -heartSize,
      speed: 1.5
    });
  }
  setTimeout(spawnHeart, 30000);
}

function spawnNet() {
  if (!gameState.gameOver && !gameState.paused) {
    gameState.nets.push({
      x: Math.random() * (canvas.width - netWidth),
      y: -netHeight,
      vx: Math.random() < 0.5 ? 1 : -1,
      vy: 0.5 + Math.random() * 0.5
    });
  }
  setTimeout(spawnNet, 8000);
}

function gameLoop() {
  update();
  if (!gameState.gameOver) requestAnimationFrame(gameLoop);
}


function resetGame() {
  gameState.lives = 3;
  gameState.timeLeft = 60;
  gameState.gameOver = false;
  gameState.invulnerable = false;
  gameState.hasShield = false;
  gameState.flashTimer = 0;
  gameState.paused = false;
  gameState.shieldEndTime = null;
  gameState.blueFlash = false;
  gameState.blueFlashTimer = 0;

  gameState.trash.length = 0;
  gameState.hearts.length = 0;
  gameState.nets.length = 0;
  gameState.particles.length = 0;

  gameState.trashInterval = 500;
  gameState.trashSpeedMultiplier = 1;

  turtle.x = canvas.width / 2 - turtle.size / 2;
  turtle.y = canvas.height - 100 * objScale;

  updateInfo();

  spawnTrash();
  spawnHeart();
  spawnNet();

  gameLoop();
}

export {
  turtle,
  canvas,
  ctx,
  moveSound,
  sacolaImg,
  tartarugaImg,
  aguaVivaImg,
  redeImg,
  spawnTrash,
  spawnHeart,
  spawnNet,
  gameLoop,
  updateInfo,
  gameState,
  objScale,
  resetGame
};
