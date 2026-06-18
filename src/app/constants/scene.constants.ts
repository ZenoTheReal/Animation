export const MODEL_URL    = '/buster_drone.glb';
export const IMAGE_1_URL  = '/2.png';

// Scroll active windows [start, end]
export const SLIDE_RANGES = [
  [-0.10, 0.12],   // slide-1
  [ 0.28, 0.40],   // slide-2
  [ 0.56, 0.68],   // slide-3
  [ 0.84, 1.05],   // slide-4
] as const;

// Nav click → target scroll fraction
export const NAV_TARGETS = [0.0, 0.34, 0.62, 0.94] as const;

// Three.js constants
export const SPARK_COUNT        = 450;
export const MODEL_TARGET_SCALE = 3.5;
export const PIVOT_Y_OFFSET     = -0.4;
export const CAMERA_START       = { x: 0, y: 0.2, z: 3.0 } as const;
export const TONE_MAPPING_EXPOSURE = 2.2;

// Material
export const BRONZE_ROUGHNESS  = 0.42;
export const BRONZE_METALNESS  = 0.92;
export const MAP_ANISOTROPY    = 16;

// Lerp factors
export const LERP_SCROLL       = 0.025;
export const LERP_MOUSE        = 0.05;
export const LERP_OUTER_CURSOR = 0.2;
export const LERP_CAMERA       = 0.025;
