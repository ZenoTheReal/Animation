import { Component, inject } from '@angular/core';
import { ScrollService } from '../../services/scroll.service';

@Component({
  selector: 'app-grid-overlay',
  standalone: true,
  template: `
    <div class="grid-overlay">
      <!-- 5 Vertical Lines -->
      <div class="grid-line" style="left: 0%;"></div>
      <div class="grid-line" style="left: 20%;">
        <div class="drift-dot speed-slow"></div>
      </div>
      <div class="grid-line" style="left: 40%;">
        <div class="drift-dot speed-medium"></div>
        <div class="drift-dot speed-slow offset-1"></div>
      </div>
      <div class="grid-line" style="left: 60%;">
        <div class="drift-dot speed-fast"></div>
      </div>
      <div class="grid-line" style="left: 80%;">
        <div class="drift-dot speed-medium offset-2"></div>
      </div>
      <div class="grid-line" style="left: 100%;"></div>

      <!-- Segmented Scroll Progress indicators on the right -->
      <div class="stories-progress">
        @for (progress of dashProgress(); track $index) {
          <div class="progress-segment">
            <div class="progress-fill" [style.transform]="'scaleY(' + progress + ')'"></div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .grid-overlay {
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      pointer-events: none;
      z-index: 5;
    }
    .grid-line {
      position: absolute;
      top: 0; bottom: 0;
      width: 1px;
      background: linear-gradient(to bottom, 
        rgba(255, 243, 230, 0) 0%, 
        rgba(255, 243, 230, 0.05) 15%, 
        rgba(255, 243, 230, 0.05) 85%, 
        rgba(255, 243, 230, 0) 100%
      );
    }
    
    /* Drifting dots along lines */
    .drift-dot {
      position: absolute;
      left: -2px;
      width: 5px; height: 5px;
      border-radius: 50%;
      background: #d4a373;
      box-shadow: 0 0 10px #d4a373, 0 0 20px #d4a373;
      opacity: 0.35;
      animation: drift 25s infinite linear;
    }
    
    .drift-dot.speed-slow { animation-duration: 35s; }
    .drift-dot.speed-medium { animation-duration: 25s; }
    .drift-dot.speed-fast { animation-duration: 15s; }
    
    .drift-dot.offset-1 { animation-delay: -8s; }
    .drift-dot.offset-2 { animation-delay: -14s; }

    @keyframes drift {
      0% {
        top: -10px;
        opacity: 0;
      }
      10% {
        opacity: 0.6;
      }
      90% {
        opacity: 0.6;
      }
      100% {
        top: 100%;
        opacity: 0;
      }
    }

    /* Segmented vertical scroll indicators */
    .stories-progress {
      position: absolute;
      right: 4rem;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      z-index: 100;
      pointer-events: all;
    }
    
    .progress-segment {
      width: 2px;
      height: 45px;
      background: rgba(255, 243, 230, 0.1);
      position: relative;
      overflow: hidden;
      border-radius: 1px;
    }
    
    .progress-fill {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      background: #d4a373;
      transform-origin: top center;
      transform: scaleY(0);
      transition: transform 0.1s linear;
    }

    @media (max-width: 900px) {
      .stories-progress {
        right: 2rem;
      }
      .grid-line:nth-child(2), .grid-line:nth-child(4) {
        display: none;
      }
    }
  `]
})
export class GridOverlayComponent {
  private readonly scrollService = inject(ScrollService);
  readonly dashProgress = this.scrollService.dashProgress;
}
