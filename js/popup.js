export function showPopupL(win, messageElement, popupWin, popupLose, popupWinContent, popupLoseContent, winSound, loseSound, bgMusic, fires) {
  const message = win ? "🎉 Você salvou a floresta!" : "💀 A floresta queimou!";
  messageElement.textContent = message;

  (win ? winSound : loseSound).play();
  bgMusic.pause();
  bgMusic.currentTime = 0;

  fires.forEach(f => f.element.remove());

  if (win) {
    popupWin.style.display = "flex";
    popupWinContent.classList.add("show");
  } else {
    popupLose.style.display = "flex";
    popupLoseContent.classList.add("show");
  }


}

// popup.js

export function showPopupT(
  win,
  messageElement,
  popupWin,
  popupLose,
  popupWinContent,
  popupLoseContent,
  winSound,
  loseSound,
  bgMusic,
  resetGame
) {
  const message = win
    ? ""
    : "";
  messageElement.textContent = message;

  (win ? winSound : loseSound).play();
  bgMusic.pause();
  bgMusic.currentTime = 0;

  if (win) {
    popupWin.style.display = "flex";
    popupWinContent.classList.add("show");
  } else {
    popupLose.style.display = "flex";
    popupLoseContent.classList.add("show");
  }

  // Configura os botões "Recomeçar"
  const restartButtons = document.querySelectorAll(".popup-btn.recomecar");
  restartButtons.forEach((btn) => {
    // Remove listeners anteriores para evitar múltiplos acionamentos
    btn.replaceWith(btn.cloneNode(true));
  });

  // Re-obtem os botões clonados (sem listeners)
  const freshRestartButtons = document.querySelectorAll(".popup-btn.recomecar");
  freshRestartButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      popupWin.style.display = "none";
      popupLose.style.display = "none";
      popupWinContent.classList.remove("show");
      popupLoseContent.classList.remove("show");

      resetGame();
    });
  });
}

