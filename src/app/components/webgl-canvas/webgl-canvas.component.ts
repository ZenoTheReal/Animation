import { Component, inject, viewChild, ElementRef, afterNextRender, DestroyRef } from '@angular/core';
import { ThreeSceneService } from '../../services/three-scene.service';

@Component({
  selector: 'app-webgl-canvas',
  standalone: true,
  template: `
    <canvas #webglCanvas class="webgl"></canvas>
  `,
  styles: [`
    .webgl {
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      z-index: 1;
      pointer-events: none;
      outline: none;
    }
  `]
})
export class WebglCanvasComponent {
  private readonly sceneService = inject(ThreeSceneService);
  readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('webglCanvas');

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const canvas = this.canvasRef().nativeElement;
      this.sceneService.init(canvas);
    });
    destroyRef.onDestroy(() => {
      this.sceneService.teardown();
    });
  }
}
