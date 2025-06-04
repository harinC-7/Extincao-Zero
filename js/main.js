// main.js
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { setupPreloader } from './preloader.js';

let object, brasilMesh = null, highlightMesh = null;

// Cena e fundo
const scene = new THREE.Scene();
const video = document.getElementById("bgVideoEspaço");
const videoTexture = new THREE.VideoTexture(video);
scene.background = videoTexture;

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container3D").appendChild(renderer.domElement);

// Luzes
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(500, 500, 500);
scene.add(directionalLight);
scene.add(new THREE.AmbientLight(0x333333, 5));

// Canvas e imagem do Brasil
const brasilImg = new Image();
brasilImg.src = "./modelos/globo/textures/brasil.png";
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

brasilImg.onload = () => {
  canvas.width = brasilImg.width;
  canvas.height = brasilImg.height;
  ctx.drawImage(brasilImg, 0, 0);
};

// Função para comparar cores
function colorMatches(r, g, b) {
  const colors = [
    { r: 46, g: 178, b: 61 },
    { r: 51, g: 66,  b: 178 },
    { r: 245, g: 217, b: 57 }
  ];
  const tolerance = 20;
  return colors.some(c =>
    Math.abs(r - c.r) <= tolerance &&
    Math.abs(g - c.g) <= tolerance &&
    Math.abs(b - c.b) <= tolerance
  );
}

// Promessas para GLTF e textura
function loadGLTF(url) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(url, resolve, undefined, reject);
  });
}

function loadTexture(url) {
  return new Promise((resolve, reject) => {
    new THREE.TextureLoader().load(url, resolve, undefined, reject);
  });
}

// Iniciar preloader
const gltfPromise = loadGLTF("./modelos/globo/globo.gltf");
const texturePromise = loadTexture("./modelos/globo/textures/brasil.png");
setupPreloader(Promise.all([gltfPromise, texturePromise]));

// Carregar e montar cena
Promise.all([gltfPromise, texturePromise]).then(([gltf, texture]) => {
  object = gltf.scene;
  object.rotation.y = 6.5;
  scene.add(object);

  const brasilMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  });

  const brasilOverlay = new THREE.Mesh(
    new THREE.SphereGeometry(50.05, 64, 64),
    brasilMaterial
  );
  brasilOverlay.renderOrder = 1;
  brasilOverlay.rotation.y = -1.58;
  brasilOverlay.rotation.x = -0.01;
  object.add(brasilOverlay);
  brasilMesh = brasilOverlay;

  const highlightMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  highlightMesh = new THREE.Mesh(
    new THREE.SphereGeometry(50.1, 64, 64),
    highlightMaterial
  );
  highlightMesh.rotation.copy(brasilOverlay.rotation);
  highlightMesh.visible = false;
  object.add(highlightMesh);
});

// Controles
camera.position.z = 100;
const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 60;
controls.maxDistance = 150;
controls.maxPolarAngle = Math.PI - 0.1;
controls.minPolarAngle = 0.1;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const audio = new Audio("audios/clique-unico.mp3");
audio.volume = 0.3;

// Clique
window.addEventListener("click", (event) => {
  if (!brasilMesh) return;
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(brasilMesh, true);

  if (intersects.length > 0) {
    const uv = intersects[0].uv;
    if (!uv) return;
    const x = Math.floor(uv.x * canvas.width);
    const y = Math.floor((1 - uv.y) * canvas.height);
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    if (colorMatches(pixel[0], pixel[1], pixel[2])) {
  audio.currentTime = 0; // Reinicia o som se já estiver tocando
  audio.play().then(() => {
    // Espera ~500ms para deixar o som tocar antes de redirecionar
    setTimeout(() => {
      window.location.href = "biomas.html";
    }, 500); 
  }).catch((error) => {
    console.error("Erro ao tocar o som:", error);
    window.location.href = "biomas.html"; // fallback
  });
}
  }
});

// Hover
window.addEventListener("mousemove", (event) => {
  if (!brasilMesh || !highlightMesh) return;
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(brasilMesh, true);
  let found = false;

  if (intersects.length > 0) {
    const uv = intersects[0].uv;
    if (uv) {
      const x = Math.floor(uv.x * canvas.width);
      const y = Math.floor((1 - uv.y) * canvas.height);
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      if (colorMatches(pixel[0], pixel[1], pixel[2])) {
        found = true;
      }
    }
  }

  highlightMesh.visible = found;
  document.body.style.cursor = found ? "pointer" : "default";
});

// Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});



// Animação
function animate() {
  requestAnimationFrame(animate);
  if (object) object.rotation.y += 0.001;
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Botão extra
window.addEventListener("DOMContentLoaded", () => {
  const botao = document.getElementById("btn1");
  if (botao) {
    botao.addEventListener("click", function () {
      window.open("https://linktr.ee/Criadores_EZ", "_blank");
    });
  }
});
