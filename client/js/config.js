/**
 * Client-side configuration.
 * Adjust these values to tune rendering and interaction feel.
 */

export const RopeConfig = {
  tubeRadius: 0.05,
  tubeRadialSegments: 8,
  curveSamplesPerNode: 3,   // TubeGeometry segments = nodes * this
  color: 0xe8c97a,
};

export const SceneConfig = {
  background: 0x1a1a2e,
  cameraFov: 60,
  cameraNear: 0.01,
  cameraFar: 100,
  cameraPosition: [0, 1, 8],
  ambientIntensity: 0.5,
  dirLightIntensity: 1.0,
  dirLightPosition: [5, 10, 5],
};

export const InteractionConfig = {
  pickRadius: 0.3,   // world-unit distance threshold for node picking
};
