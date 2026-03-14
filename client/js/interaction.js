/**
 * Mouse/pointer interaction: pick the nearest rope node and drag it.
 */

import * as THREE from "three";
import { InteractionConfig } from "./config.js";

export class RopeInteraction {
  /**
   * @param {THREE.Camera} camera
   * @param {HTMLCanvasElement} canvas
   * @param {function(): number[][]} getNodes - returns current node positions
   * @param {import('./ws.js').RopeSocket} socket
   */
  constructor(camera, canvas, getNodes, socket) {
    this.camera = camera;
    this.canvas = canvas;
    this.getNodes = getNodes;
    this.socket = socket;
    this.raycaster = new THREE.Raycaster();
    this.dragIndex = null;    // index of the node being dragged
    this.dragPlane = new THREE.Plane();
    this.dragPoint = new THREE.Vector3();

    canvas.addEventListener("pointerdown", (e) => this._onPointerDown(e));
    canvas.addEventListener("pointermove", (e) => this._onPointerMove(e));
    canvas.addEventListener("pointerup",   () => this._onPointerUp());
  }

  // ------------------------------------------------------------------

  _ndc(event) {
    const rect = this.canvas.getBoundingClientRect();
    return new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width)  * 2 - 1,
      -((event.clientY - rect.top)  / rect.height) * 2 + 1
    );
  }

  _nearestNode(ndc) {
    this.raycaster.setFromCamera(ndc, this.camera);
    const nodes = this.getNodes();
    let bestIndex = -1;
    let bestDist = Infinity;
    nodes.forEach(([x, y, z], i) => {
      const p = new THREE.Vector3(x, y, z);
      const d = this.raycaster.ray.distanceToPoint(p);
      if (d < bestDist) { bestDist = d; bestIndex = i; }
    });
    return bestDist < InteractionConfig.pickRadius ? bestIndex : -1;
  }

  _onPointerDown(event) {
    const ndc = this._ndc(event);
    const idx = this._nearestNode(ndc);
    if (idx === -1) return;

    this.dragIndex = idx;
    this.canvas.setPointerCapture(event.pointerId);

    // Build a drag plane facing the camera at the node position
    const nodes = this.getNodes();
    const [x, y, z] = nodes[idx];
    const normal = new THREE.Vector3().subVectors(
      this.camera.position,
      new THREE.Vector3(x, y, z)
    ).normalize();
    this.dragPlane.setFromNormalAndCoplanarPoint(normal, new THREE.Vector3(x, y, z));

    this.socket.pinNode(idx);
  }

  _onPointerMove(event) {
    if (this.dragIndex === null) return;
    const ndc = this._ndc(event);
    this.raycaster.setFromCamera(ndc, this.camera);
    if (this.raycaster.ray.intersectPlane(this.dragPlane, this.dragPoint)) {
      const { x, y, z } = this.dragPoint;
      this.socket.moveNode(this.dragIndex, [x, y, z]);
    }
  }

  _onPointerUp() {
    if (this.dragIndex !== null) {
      this.socket.unpinNode(this.dragIndex);
      this.dragIndex = null;
    }
  }
}
