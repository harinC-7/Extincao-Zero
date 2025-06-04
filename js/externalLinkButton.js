export function setupExternalLinkButton() {
  window.addEventListener("DOMContentLoaded", () => {
    const botao = document.getElementById("btn2");
    if (botao) {
      botao.addEventListener("click", () => {
        window.open("https://linktr.ee/Criadores_EZ", "_blank");
      });
    }
  });
}