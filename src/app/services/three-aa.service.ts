import {
  RGBAFormat,
  WebGLRenderer,
  WebGLRenderTarget,
  PerspectiveCamera,
  Scene,
} from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';

export interface AARendering {
  composer: EffectComposer;
  renderTarget?: WebGLRenderTarget;
}

export function createAARendering(
  renderer: WebGLRenderer,
  scene: Scene,
  camera: PerspectiveCamera,
  width: number,
  height: number,
): AARendering {
  const pixelRatio = renderer.getPixelRatio();
  let renderTarget: WebGLRenderTarget | undefined;

  if (renderer.capabilities.isWebGL2) {
    renderTarget = new WebGLRenderTarget(
      Math.floor(width * pixelRatio),
      Math.floor(height * pixelRatio),
    );
    renderTarget.samples = Math.min(4, renderer.capabilities.maxSamples || 4);
    renderTarget.texture.format = RGBAFormat;
  }

  const composer = new EffectComposer(renderer, renderTarget);
  composer.setSize(width, height);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new SMAAPass());

  return { composer, renderTarget };
}

export function resizeAARendering(
  aa: AARendering,
  renderer: WebGLRenderer,
  width: number,
  height: number,
): void {
  const pixelRatio = renderer.getPixelRatio();
  if (aa.renderTarget) {
    aa.renderTarget.setSize(
      Math.floor(width * pixelRatio),
      Math.floor(height * pixelRatio),
    );
  }
  aa.composer.setSize(width, height);
}

export function renderAARendering(aa: AARendering): void {
  aa.composer.render();
}

export function disposeAARendering(aa: AARendering): void {
  aa.composer.dispose();
  if (aa.renderTarget) {
    aa.renderTarget.dispose();
  }
}
