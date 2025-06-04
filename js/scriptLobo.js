import { showPopupL } from './popup.js';

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.height = window.innerHeight * 0.85;
canvas.width = canvas.height * (4 / 3);

const treeImg = new Image();
treeImg.src = "imagens/arvore-ype.png";

const treeBurnedImg = new Image();
treeBurnedImg.src = "imagens/arvore-ype-queimada.png";

const loboImg = new Image();
loboImg.src = "imagens/lobo-pixel.png"; // ajuste o caminho se necessário

let currentTreeImg = treeImg;

const timeDisplay = document.getElementById("time");
const firesDoneDisplay = document.getElementById("firesDone");
const message = document.getElementById("message");

const popupLose = document.getElementById("popupLose");
const popupLoseContent = popupLose.querySelector('.popup-content');

const popupWin = document.getElementById("popupWin");
const popupWinContent = popupWin.querySelector('.popup-content');

const fireSound = document.getElementById("fireSound");
const winSound = document.getElementById("winSound");
const loseSound = document.getElementById("loseSound");
const bgMusic = document.getElementById("bgMusic");
bgMusic.volume = 0.15;

bgMusic.play().catch(() => {
  document.body.addEventListener("click", () => {
    bgMusic.play();
  }, { once: true });
});

let timeLeft = 60;
let totalFiresDone = 0;
let gameOver = false;

const baseRadius = 30;
const targetFiresToWin = 15;

const trees = [
  { xRatio: 0.08, yRatio: 0.38, scale: 0.17 },
  { xRatio: 0.28, yRatio: 0.62, scale: 0.29 },
  { xRatio: 0.46, yRatio: 0.34, scale: 0.15 },
  { xRatio: 0.7,  yRatio: 0.75, scale: 0.20 },
  { xRatio: 0.86, yRatio: 0.4,  scale: 0.29 }
];

const fires = [];

const loboGuara = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: canvas.width * 0.10,
  speed: 1.2,
  direction: { x: 1, y: 0 },
  changeDirectionInterval: 2000,
  lastDirectionChange: Date.now()
};

function isNearFire(lobo) {
  const dangerRadius = 100;
  return fires.some(fire => {
    const fireX = fire.xRatio * canvas.width;
    const fireY = fire.yRatio * canvas.height;
    const dx = lobo.x - fireX;
    const dy = lobo.y - fireY;
    return Math.sqrt(dx * dx + dy * dy) < dangerRadius;
  });
}

function updateLobo() {
  const now = Date.now();

  if (now - loboGuara.lastDirectionChange > loboGuara.changeDirectionInterval || isNearFire(loboGuara)) {
    let angle = Math.random() * 2 * Math.PI;
    loboGuara.direction.x = Math.cos(angle);
    loboGuara.direction.y = Math.sin(angle);
    loboGuara.lastDirectionChange = now;
  }

  loboGuara.x += loboGuara.direction.x * loboGuara.speed;
  loboGuara.y += loboGuara.direction.y * loboGuara.speed;

  if (loboGuara.x < 0 || loboGuara.x + loboGuara.size > canvas.width) loboGuara.direction.x *= -1;
  if (loboGuara.y < 0 || loboGuara.y + loboGuara.size > canvas.height) loboGuara.direction.y *= -1;
}

function drawTrees() {
  trees.forEach(tree => {
    const x = tree.xRatio * canvas.width;
    const y = tree.yRatio * canvas.height;
    const size = tree.scale * canvas.width;
    ctx.drawImage(currentTreeImg, x - size / 2, y - size / 2, size, size);
  });
}

function moveLobo() {
  const nextX = loboGuara.x + loboGuara.dx * loboGuara.speed;
  const nextY = loboGuara.y + loboGuara.dy * loboGuara.speed;

  let colliding = false;
  for (let fire of fires) {
    if (fire.clicks < 3) {
      const fx = fire.xRatio * canvas.width;
      const fy = fire.yRatio * canvas.height;
      const dist = Math.hypot(fx - nextX, fy - nextY);
      if (dist < loboGuara.size + 30) {
        colliding = true;
        break;
      }
    }
  }

  if (colliding) {
    loboGuara.dx = -loboGuara.dx + (Math.random() - 0.5);
    loboGuara.dy = -loboGuara.dy + (Math.random() - 0.5);
  } else {
    loboGuara.x = nextX;
    loboGuara.y = nextY;
  }

  if (loboGuara.x < 0 || loboGuara.x > canvas.width) loboGuara.dx *= -1;
  if (loboGuara.y < 0 || loboGuara.y > canvas.height) loboGuara.dy *= -1;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawTrees();
  updateLobo();
  ctx.drawImage(
    loboImg,
    loboGuara.x - loboGuara.size / 2,
    loboGuara.y - loboGuara.size / 2,
    loboGuara.size,
    loboGuara.size
  );
  requestAnimationFrame(draw);
}

function randomPosition() {
  const marginX = baseRadius * (canvas.width / 600);
  const marginY = baseRadius * (canvas.height / 400);
  return {
    xRatio: (marginX + Math.random() * (canvas.width - 2 * marginX)) / canvas.width,
    yRatio: (marginY + Math.random() * (canvas.height - 2 * marginY)) / canvas.height
  };
}

for (let i = 0; i < 15; i++) {
  const fire = {
    ...randomPosition(),
    clicks: 0,
    element: document.createElement("img")
  };

  fire.element.src = "gifs/fogos.gif";
  fire.element.classList.add("fire");

  fire.element.addEventListener("click", () => {
    if (gameOver || fire.clicks >= 3) return;
    fire.clicks++;
    fireSound.volume = 0.3;
    fireSound.currentTime = 0;
    fireSound.play();

    fire.element.style.opacity = 1 - (fire.clicks / 3);

    if (fire.clicks >= 3) {
      fire.element.style.pointerEvents = "none";
      totalFiresDone++;
      firesDoneDisplay.textContent = totalFiresDone;
      if (totalFiresDone >= targetFiresToWin) endGame(true);
    }
  });

  document.body.appendChild(fire.element);
  fires.push(fire);
}

function positionFires() {
  fires.forEach(fire => {
    const x = fire.xRatio * canvas.width + canvas.offsetLeft;
    const y = fire.yRatio * canvas.height + canvas.offsetTop;
    fire.element.style.left = `${x - 30}px`;
    fire.element.style.top = `${y - 30}px`;
  });
}

function updateTimer() {
  if (timeLeft > 0 && !gameOver) {
    timeLeft--;
    timeDisplay.textContent = timeLeft;
    setTimeout(updateTimer, 1000);
  } else if (!gameOver) {
    endGame(false);
  }
}

function endGame(win) {
  gameOver = true;
  if (!win) {
    currentTreeImg = treeBurnedImg;
  }

  showPopupL(
    win,
    message,
    popupWin,
    popupLose,
    popupWinContent,
    popupLoseContent,
    winSound,
    loseSound,
    bgMusic,
    fires
  );
}

treeImg.onload = () => {
  positionFires();
  updateTimer();
  draw();
};

function startGame() {
  gameOver = false;
  timeLeft = 60;
  totalFiresDone = 0;
  currentTreeImg = treeImg;
  firesDoneDisplay.textContent = "0";
  timeDisplay.textContent = "60";

  fires.forEach(fire => {
    fire.clicks = 0;
    fire.element.style.opacity = 1;
    fire.element.style.pointerEvents = "auto";
    document.body.appendChild(fire.element);
  });

  positionFires();
  draw();

  const loboSound = document.getElementById("loboSound");
loboSound.volume = 0.1;

function playLoboSoundPeriodically() {
  const interval = 10000 + Math.random() * 10000;
  setTimeout(() => {
    if (!gameOver) {
      loboSound.currentTime = 0;
      loboSound.play().catch(() => {});
      playLoboSoundPeriodically(); 
    }
  }, interval);
}

playLoboSoundPeriodically();
}

document.getElementById('startBtn').addEventListener('click', function () {
  document.getElementById('popup').style.display = 'none';
  startGame();
  updateTimer();
});
