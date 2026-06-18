import { Component, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CursorService } from '../../services/cursor.service';

@Component({
  selector: 'app-cursor',
  standalone: true,
  template: `
    @if (isBrowser) {
      <div class="cursor-inner" [style.transform]="innerTransform()"></div>
      <div class="cursor-outer" [style.transform]="outerTransform()"></div>
    }
  `,
  styles: [`
    .cursor-inner {
      position: fixed;
      width: 6px; height: 6px;
      background-color: #d4a373;
      border-radius: 50%;
      pointer-events: none;
      z-index: 99999;
      transform: translate3d(-50%, -50%, 0);
      mix-blend-mode: difference;
    }
    .cursor-outer {
      position: fixed;
      width: 38px; height: 38px;
      border: 1px solid rgba(212, 163, 115, 0.4);
      border-radius: 50%;
      pointer-events: none;
      z-index: 99999;
      transform: translate3d(-50%, -50%, 0);
      mix-blend-mode: difference;
    }
  `]
})
export class CursorComponent {
  private readonly cursorService = inject(CursorService);
  private readonly platformId    = inject(PLATFORM_ID);
  readonly isBrowser              = isPlatformBrowser(this.platformId);

  readonly innerTransform = () =>
    `translate3d(${this.cursorService.innerX()}px, ${this.cursorService.innerY()}px, 0) translate3d(-50%, -50%, 0)`;

  readonly outerTransform = () =>
    `translate3d(${this.cursorService.outerX()}px, ${this.cursorService.outerY()}px, 0) translate3d(-50%, -50%, 0)`;
}
