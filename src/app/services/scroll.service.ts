import {
  Injectable, signal, computed, inject, DestroyRef, PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SLIDE_RANGES } from '../constants/scene.constants';

@Injectable({ providedIn: 'root' })
export class ScrollService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser  = isPlatformBrowser(this.platformId);

  // ── Raw & smoothed progress [0..1] ──────────────────────────────────────
  private readonly _targetScroll  = signal(0);
  private readonly _currentScroll = signal(0);

  readonly targetScroll  = this._targetScroll.asReadonly();
  readonly currentScroll = this._currentScroll.asReadonly();

  // ── Scroll velocity (for spark turbulence) ───────────────────────────────
  readonly scrollVelocity = computed(() =>
    Math.abs(this._targetScroll() - this._currentScroll()));

  // ── Per-slide active flags ───────────────────────────────────────────────
  readonly slide1Active = computed(() => {
    const s = this._currentScroll();
    return s >= SLIDE_RANGES[0][0] && s <= SLIDE_RANGES[0][1];
  });
  readonly slide2Active = computed(() => {
    const s = this._currentScroll();
    return s >= SLIDE_RANGES[1][0] && s <= SLIDE_RANGES[1][1];
  });
  readonly slide3Active = computed(() => {
    const s = this._currentScroll();
    return s >= SLIDE_RANGES[2][0] && s <= SLIDE_RANGES[2][1];
  });
  readonly slide4Active = computed(() => {
    const s = this._currentScroll();
    return s >= SLIDE_RANGES[3][0] && s <= SLIDE_RANGES[3][1];
  });

  // ── Active index computed signal for nav links ──────────────────────────
  readonly activeIndex = computed(() => {
    const s = this._currentScroll();
    if (s < 0.20) return 0;
    if (s < 0.48) return 1;
    if (s < 0.76) return 2;
    return 3;
  });

  // ── Per-dash fill heights [0..1] ─────────────────────────────────────────
  readonly dashProgress = computed<[number, number, number, number]>(() => {
    const s = this._currentScroll();
    return [0, 1, 2, 3].map(i => {
      const start = i * 0.25, end = (i + 1) * 0.25;
      return Math.max(0, Math.min(1, (s - start) / (end - start)));
    }) as [number, number, number, number];
  });

  constructor() {
    if (this.isBrowser) {
      const onScroll = () => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        this._targetScroll.set(maxScroll > 0 ? window.scrollY / maxScroll : 0);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      this.destroyRef.onDestroy(() =>
        window.removeEventListener('scroll', onScroll));
    }
  }

  /** Called every rAF tick (from ThreeSceneService animation loop). */
  tick(lerp: number): void {
    if (!this.isBrowser) return;
    const t = this._targetScroll();
    const c = this._currentScroll();
    this._currentScroll.set(c + (t - c) * lerp);
  }
}
