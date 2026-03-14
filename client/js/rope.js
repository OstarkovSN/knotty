/**
 * Three.js rope renderer.
 * Maintains a TubeGeometry built from the node positions received from the server.
 * Render parameters are read from the *renderSettings* object on every update,
 * so changes made via the settings panel take effect immediately.
 */

import * as THREE from "three";
import { RopeConfig } from "./config.js";

export class RopeRenderer {
  /**
   * @param {THREE.Scene} scene
   * @param {Object} renderSettings - mutable object with {ropeColor, tubeRadius}
   */
  constructor(scene, renderSettings) {
    this.scene = scene;
    this.renderSettings = renderSettings;
    this.mesh = null;
  }

  /**
   * Update (or create) the rope mesh from a list of node positions.
   * @param {number[][]} nodes - array of [x, y, z] positions
   */
  update(nodes) {
    if (nodes.length < 2) return;

    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
    }

    const points = nodes.map(([x, y, z]) => new THREE.Vector3(x, y, z));
    const curve = new THREE.CatmullRomCurve3(points);

    const geometry = new THREE.TubeGeometry(
      curve,
      nodes.length * RopeConfig.curveSamplesPerNode,
      this.renderSettings.tubeRadius,
      RopeConfig.tubeRadialSegments,
      false
    );

    const color = new THREE.Color(this.renderSettings.ropeColor);
    const material = new THREE.MeshStandardMaterial({ color });
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);
  }

  dispose() {
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
    }
  }
}
