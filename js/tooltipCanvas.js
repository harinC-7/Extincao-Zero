export function setupBiomaTooltipAndCanvas() {
  const img = document.getElementById("mapaBiomas");
  const tooltip = document.getElementById("tooltip");
  const canvas = document.getElementById("canvasColorDetect");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  function carregarCanvas() {
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  ctx.drawImage(img, 0, 0);
}

if (img.complete) {
  carregarCanvas();
} else {
  img.onload = carregarCanvas;
}
  img.addEventListener("mousemove", (e) => {
  const rect = img.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) * (img.naturalWidth / rect.width));
  const y = Math.floor((e.clientY - rect.top) * (img.naturalHeight / rect.height));

  if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) {
    tooltip.style.display = "none";
    return;
  }

  const pixel = ctx.getImageData(x, y, 1, 1).data;
  const key = `${pixel[0]},${pixel[1]},${pixel[2]}`;

  const biomas = window.biomasData;
  if (biomas && biomas[key]) {
    tooltip.style.left = `${e.pageX + 10}px`;
    tooltip.style.top = `${e.pageY + 10}px`;
    tooltip.innerText = biomas[key].nome;
    tooltip.style.display = "block";
  } else {
    tooltip.style.display = "none";
  }
});
}
