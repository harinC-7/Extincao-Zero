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

  const restartButtons = document.querySelectorAll(".popup-btn.recomecar");
  restartButtons.forEach((btn) => {
  
    btn.replaceWith(btn.cloneNode(true));
  });

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

