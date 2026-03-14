/**
 * Entry point: sets up the Three.js scene and wires everything together.
 */

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RopeSocket } from "./ws.js";
import { RopeRenderer } from "./rope.js";
import { RopeInteraction } from "./interaction.js";
import { SceneConfig } from "./config.js";

// ------------------------------------------------------------------
// Scene
// ------------------------------------------------------------------

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(SceneConfig.background);

const camera = new THREE.PerspectiveCamera(
  SceneConfig.cameraFov,
  window.innerWidth / window.innerHeight,
  SceneConfig.cameraNear,
  SceneConfig.cameraFar
);
camera.position.set(...SceneConfig.cameraPosition);

const ambientLight = new THREE.AmbientLight(0xffffff, SceneConfig.ambientIntensity);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, SceneConfig.dirLightIntensity);
dirLight.position.set(...SceneConfig.dirLightPosition);
scene.add(dirLight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ------------------------------------------------------------------
// Simulation state
// ------------------------------------------------------------------

let currentNodes = [];

const socket = new RopeSocket(
  `ws://${location.host}/ws`,
  (state) => {
    currentNodes = state.nodes;
    ropeRenderer.update(currentNodes);
  }
);

const ropeRenderer = new RopeRenderer(scene);

const interaction = new RopeInteraction(
  camera,
  renderer.domElement,
  () => currentNodes,
  socket
);

// Disable orbit while dragging a node
renderer.domElement.addEventListener("pointerdown", (e) => {
  if (interaction.dragIndex !== null) controls.enabled = false;
});
renderer.domElement.addEventListener("pointerup", () => {
  controls.enabled = true;
});

socket.connect();

// ------------------------------------------------------------------
// Render loop
// ------------------------------------------------------------------

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
