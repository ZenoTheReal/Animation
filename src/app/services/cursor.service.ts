import { Injectable, signal, inject, DestroyRef, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class CursorService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser  = isPlatformBrowser(this.platformId);

  // Pixel positions
  private readonly _innerX = signal(0);
  private readonly _innerY = signal(0);
  private readonly _outerX = signal(0);
  private readonly _outerY = signal(0);

  // Normalised mouse [-1..1] for Three.js
  private readonly _mouseNormX = signal(0);
  private readonly _mouseNormY = signal(0);

  // Smoothed normalised mouse (lerped in tick)
  private _smoothMouseX = 0;
  private _smoothMouseY = 0;

  readonly innerX     = this._innerX.asReadonly();
  readonly innerY     = this._innerY.asReadonly();
  readonly outerX     = this._outerX.asReadonly();
  readonly outerY     = this._outerY.asReadonly();
  readonly smoothMouseX = () => this._smoothMouseX;
  readonly smoothMouseY = () => this._smoothMouseY;

  private rafId = 0;

  constructor() {
    if (this.isBrowser) {
      // Set initial values to middle of screen
      this._innerX.set(window.innerWidth  / 2);
      this._innerY.set(window.innerHeight / 2);
      this._outerX.set(window.innerWidth  / 2);
      this._outerY.set(window.innerHeight / 2);

      const onMove = (e: MouseEvent) => {
        this._innerX.set(e.clientX);
        this._innerY.set(e.clientY);
        this._mouseNormX.set((e.clientX / window.innerWidth)  * 2 - 1);
        this._mouseNormY.set((e.clientY / window.innerHeight) * 2 - 1);
      };
      window.addEventListener('mousemove', onMove);

      const tickLoop = () => {
        this.tick(0.2, 0.05); // LERP_OUTER_CURSOR = 0.2, LERP_MOUSE = 0.05
        this.rafId = requestAnimationFrame(tickLoop);
      };
      this.rafId = requestAnimationFrame(tickLoop);

      this.destroyRef.onDestroy(() => {
        window.removeEventListener('mousemove', onMove);
        if (this.rafId) {
          cancelAnimationFrame(this.rafId);
        }
      });
    }
  }

  /** Called every rAF tick. Lerps the outer ring and smooths mouse. */
  tick(lerpOuter: number, lerpMouse: number): void {
    if (!this.isBrowser) return;
    const ix = this._innerX(), iy = this._innerY();
    this._outerX.set(this._outerX() + (ix - this._outerX()) * lerpOuter);
    this._outerY.set(this._outerY() + (iy - this._outerY()) * lerpOuter);
    this._smoothMouseX += (this._mouseNormX() - this._smoothMouseX) * lerpMouse;
    this._smoothMouseY += (this._mouseNormY() - this._smoothMouseY) * lerpMouse;
  }
}
