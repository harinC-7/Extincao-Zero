import {
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
  resetGame as resetGameModule,
} from './scriptTartaruga2.js';

import { showPopupT } from './popup.js';

const popupLose = document.getElementById("popupLose");
const popupLoseContent = popupLose.querySelector('.popup-content');

const popupWin = document.getElementById("popupWin");
const popupWinContent = popupWin.querySelector('.popup-content');

const message = document.getElementById("message");
const winSound = document.getElementById("winSound");
const loseSound = document.getElementById("loseSound");
const bgMusic = document.getElementById("bgMusic");

const timeDisplay = document.getElementById("time");

moveSound.volume = 0.10;
bgMusic.volume = 0.05;
bgMusic.play().catch(() => {
  document.body.addEventListener("click", () => {
    bgMusic.play();
  }, { once: true });
});

canvas.height = window.innerHeight * 0.85;
canvas.width = canvas.height * (4 / 3);

const keysPressed = {};
let isMovingSoundPlaying = false;

document.addEventListener("keydown", (e) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault();
    keysPressed[e.key] = true;
  }
}, { passive: false });

document.addEventListener("keyup", (e) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    keysPressed[e.key] = false;
  }
});

function updateTurtlePosition() {
  let moved = false;
  turtle.speed = 2; 

  if (keysPressed["ArrowLeft"] && turtle.x > 0) {
    turtle.x -= turtle.speed;
    moved = true;
  }
  if (keysPressed["ArrowRight"] && turtle.x + turtle.size < canvas.width) {
    turtle.x += turtle.speed;
    moved = true;
  }
  if (keysPressed["ArrowUp"] && turtle.y > 0) {
    turtle.y -= turtle.speed;
    moved = true;
  }
  if (keysPressed["ArrowDown"] && turtle.y + turtle.size < canvas.height) {
    turtle.y += turtle.speed;
    moved = true;
  }

  if (moved && moveSound.paused) {
    moveSound.play();
  }

  requestAnimationFrame(updateTurtlePosition);
}

updateTurtlePosition();



document.addEventListener("keyup", e => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    keyHeld[e.key] = false;
  }
});

document.addEventListener("visibilitychange", () => {
  gameState.paused = document.hidden;
});

let timerInterval;

timerInterval = setInterval(() => {
  if (gameState.gameOver) {
    clearInterval(timerInterval);
  
    endGame(false);
    return;
  }
  
  if (!gameState.paused && gameState.timeLeft > 0) {
    gameState.timeLeft--;
    updateInfo();

    if (gameState.timeLeft <= 0) {
      clearInterval(timerInterval);
    
      endGame(true);
    }
  }
}, 1000);

function resetGame() {
  resetGameModule();

  gameState.timeLeft = 20;   
  gameState.gameOver = false; 
  gameState.paused = false;  

  turtle.x = canvas.width / 2 - turtle.size / 2;
  turtle.y = canvas.height / 2 - turtle.size / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updateInfo();

  popupWin.style.display = "none";
  popupLose.style.display = "none";
  popupWinContent.classList.remove("show");
  popupLoseContent.classList.remove("show");
}

function startGame() {
  resetGame();

  bgMusic.currentTime = 0;
  bgMusic.play();

  spawnTrash();
  spawnHeart();
  spawnNet();
  gameLoop();
  startTimer();  
}

function endGame(win) {
  gameState.gameOver = true;

  showPopupT(
    win,
    message,
    popupWin,
    popupLose,
    popupWinContent,
    popupLoseContent,
    winSound,
    loseSound,
    bgMusic,
    startGame 
  );
}

Promise.all([
  sacolaImg.decode(),
  tartarugaImg.decode(),
  aguaVivaImg.decode(),
  redeImg.decode()
]).then(() => {
});

document.getElementById('startBtn').addEventListener('click', function () {
      document.getElementById('popup').style.display = 'none';
      startGame();
      timerInterval();
    });
