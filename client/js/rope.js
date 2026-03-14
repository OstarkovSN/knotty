/**
 * Three.js rope renderer.
 * Maintains a TubeGeometry built from the node positions received from the server.
 */

import * as THREE from "three";
import { RopeConfig } from "./config.js";

export class RopeRenderer {
  /**
   * @param {THREE.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
    this.mesh = null;
  }

  /**
   * Update (or create) the rope mesh from a list of node positions.
   * @param {number[][]} nodes - array of [x, y, z] positions
   */
  update(nodes) {
    if (nodes.length < 2) return;

    // Remove old mesh
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
    }

    const points = nodes.map(([x, y, z]) => new THREE.Vector3(x, y, z));
    const curve = new THREE.CatmullRomCurve3(points);

    const geometry = new THREE.TubeGeometry(
      curve,
      nodes.length * RopeConfig.curveSamplesPerNode,
      RopeConfig.tubeRadius,
      RopeConfig.tubeRadialSegments,
      false
    );

    const material = new THREE.MeshStandardMaterial({ color: RopeConfig.color });
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
