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

// Elementos DOM do popup e UI
const popupLose = document.getElementById("popupLose");
const popupLoseContent = popupLose.querySelector('.popup-content');

const popupWin = document.getElementById("popupWin");
const popupWinContent = popupWin.querySelector('.popup-content');

const message = document.getElementById("message");
const winSound = document.getElementById("winSound");
const loseSound = document.getElementById("loseSound");
const bgMusic = document.getElementById("bgMusic");

const timeDisplay = document.getElementById("time");

// Ajuste volume e autoplay da música de fundo
moveSound.volume = 0.10;
bgMusic.volume = 0.05;
bgMusic.play().catch(() => {
  document.body.addEventListener("click", () => {
    bgMusic.play();
  }, { once: true });
});

// Define tamanho do canvas com proporção fixa
canvas.height = window.innerHeight * 0.85;
canvas.width = canvas.height * (4 / 3);

// Controle do movimento da tartaruga com setas
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

updateTurtlePosition(); // Inicia o loop



document.addEventListener("keyup", e => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    keyHeld[e.key] = false;
  }
});


// Pausa o jogo quando a aba perde foco
document.addEventListener("visibilitychange", () => {
  gameState.paused = document.hidden;
});

// Variável para o timer do jogo
let timerInterval;

// Função para iniciar o timer do jogo
timerInterval = setInterval(() => {
  if (gameState.gameOver) {
    clearInterval(timerInterval);
    // Mostra o popup de perder, porque gameOver = true e vidas zeradas
    endGame(false);
    return;
  }
  
  if (!gameState.paused && gameState.timeLeft > 0) {
    gameState.timeLeft--;
    updateInfo();

    if (gameState.timeLeft <= 0) {
      clearInterval(timerInterval);
      // Quando o tempo acabar, o usuário ganhou
      endGame(true);
    }
  }
}, 1000);

// Função para reiniciar o jogo, usa reset do módulo principal
function resetGame() {
  resetGameModule();

  gameState.timeLeft = 20;     // Reseta o tempo para 60 segundos
  gameState.gameOver = false;  // Reativa o jogo
  gameState.paused = false;    // Não pausado

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
  startTimer();  // Inicia o timer corretamente
}

// Função que termina o jogo e mostra popup, com som e controle de reset
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
    startGame // Passa a função de restart
  );
}

// Inicializa o jogo quando imagens estiverem carregadas
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
