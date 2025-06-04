// videoBackground.js

export function setupGifBackground() {
  const gif = document.getElementById('bgGifOceano');
  if (!gif) {
    console.warn("GIF de fundo não encontrado. Pulando setupVideoBackground.");
    return;
  }

  gif.style.display = 'block';
}

