import { biomasData } from './biomasData.js';

export function setupBiomaPanel() {

  const img = document.getElementById("mapaBiomas");
  const canvas = document.getElementById("canvasColorDetect");
  const ctx = canvas.getContext("2d");

  const infoPanel = document.createElement("div");
  infoPanel.id = "infoPanel";
  Object.assign(infoPanel.style, {
    position: "fixed",
    top: "30%",
    right: "20%",
    width: "320px",
    padding: "20px",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    color: "white",
    borderRadius: "10px",
    display: "none",
    fontFamily: "'Press Start 2P', sans-serif",
    zIndex: "10000",
    backdropFilter: "blur(5px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    transition: "opacity 0.5s ease-in-out, transform 0.5s ease-in-out",
    opacity: "0",
    transform: "translateX(50px)"
  });
  document.body.appendChild(infoPanel);

  img.addEventListener("click", (e) => {
    const rect = img.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (img.naturalWidth / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (img.naturalHeight / rect.height));
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const key = `${pixel[0]},${pixel[1]},${pixel[2]}`;
    const bioma = biomasData[key];

    if (bioma) {
      const cor = `rgb(${key})`;

      infoPanel.innerHTML = `
        <div class="bioma-nome-container" style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px;">
          <div class="cor-bioma" style="width: 16px; height: 16px; background: ${cor}; border-radius: 2px;"></div>
          <h2 style="margin: 0; font-size: 14px;">${bioma.nome}</h2>
        </div>
        <p class="bioma-description" style="font-size: 10px; margin-bottom: 16px; line-height: 1.5;">
          ${bioma.descricao}
        </p>
        <div class="bioma-content">
          <ul style="list-style: none; padding: 0; margin: 0;">
            ${bioma.missoes.map((missao, index) => `
              <li style="display: flex; align-items: center; gap: 10px; background-color: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 6px 10px; margin-bottom: 8px; font-size: 9px;">
                <input type="checkbox" id="missao-${index}" style="accent-color: #2ecc71; width: 14px; height: 14px;">
                <label for="missao-${index}" style="cursor: pointer;">${missao}</label>
              </li>`).join('')}
          </ul>
        </div>
        <div class="bioma-footer" style="display: flex; justify-content: space-between; align-items: center; margin-top: 30px; font-size: 10px;">
          <span class="bioma-contador" id="contadorMissoes" style="color: white; font-weight: bold;">0/${bioma.missoes.length} animais salvos</span>
          <button class="btn-entrar" style="background-color: #2ecc71; color: black; font-size: 10px; font-weight: bold; padding: 6px 12px; border: none; border-radius: 6px; cursor: pointer; font-family: 'Press Start 2P', sans-serif;">Entrar</button>
        </div>
      `;
      
      const btnEntrar = infoPanel.querySelector(".btn-entrar");
btnEntrar.addEventListener("click", () => {
  if (bioma.url) {
    // Cria sobreposição de transição
    const transitionOverlay = document.createElement("div");
    Object.assign(transitionOverlay.style, {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "black",
      zIndex: 99999,
      pointerEvents: "none",
      opacity: "0",
      transition: "opacity 0.8s ease-in-out",
    });
    document.body.appendChild(transitionOverlay);

    // Aplica animação de zoom out no body
    document.body.style.transition = "transform 0.8s ease-in-out, opacity 0.8s ease-in-out";
    document.body.style.transform = "scale(0.95)";
    document.body.style.opacity = "0";

    // Mostra a tela preta
    setTimeout(() => {
      transitionOverlay.style.opacity = "1";
    }, 10);

    // Redireciona após a animação
    setTimeout(() => {
      window.location.href = bioma.url;
    }, 800);
  } else {
    alert("Este bioma ainda não tem uma tela definida.");
  }
});

      infoPanel.style.display = "block";
      setTimeout(() => {
        infoPanel.style.opacity = "1";
        infoPanel.style.transform = "translateX(0)";
      }, 10);
    }
  });
}


