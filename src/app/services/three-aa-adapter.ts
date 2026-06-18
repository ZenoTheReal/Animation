import { WebGLRenderer, Scene, PerspectiveCamera } from 'three';
import {
  AARendering,
  createAARendering,
  resizeAARendering,
  renderAARendering,
  disposeAARendering,
} from './three-aa.service';

export class ThreeAAAdapter {
  public aa?: AARendering;

  constructor(
    private renderer: WebGLRenderer,
    private scene: Scene,
    private camera: PerspectiveCamera,
  ) {}

  enable(width: number, height: number): void {
    this.aa = createAARendering(this.renderer, this.scene, this.camera, width, height);
  }

  resize(width: number, height: number): void {
    if (!this.aa) return;
    resizeAARendering(this.aa, this.renderer, width, height);
  }

  render(): void {
    if (!this.aa) return;
    renderAARendering(this.aa);
  }

  dispose(): void {
    if (!this.aa) return;
    disposeAARendering(this.aa);
    this.aa = undefined;
  }
}
