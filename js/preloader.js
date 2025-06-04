export function setupPreloader2() {
  window.addEventListener("load", () => {
    const preloader = document.getElementById("preloader2");
    if (preloader) {
      preloader.style.opacity = "0";
      preloader.style.transition = "opacity 0.5s ease";
      setTimeout(() => {
        preloader.style.display = "none";
      }, 500);
    }
  });
}

export function setupPreloader(loadersPromise) {
  const preloader = document.getElementById("preloader");

  loadersPromise.then(() => {
    if (preloader) {
      preloader.style.opacity = "0";
      preloader.style.transition = "opacity 0.5s ease";
      setTimeout(() => {
        preloader.style.display = "none";
      }, 500);
    }
  });
}