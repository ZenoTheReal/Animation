import { Component, inject, signal, effect } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ThreeSceneService } from '../../services/three-scene.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  template: `
    <div class="loader-overlay" [class.fade-out]="fade()" [class.hidden]="hidden()">
      <div class="loader-content">
        <h1 class="loader-title">LAOCOÖN</h1>
        <p class="loader-subtitle">BRONZE & TIME</p>
        <div class="progress-container">
          <div class="progress-bar" [style.width.%]="progress()"></div>
        </div>
        <div class="progress-text">{{ progress() }}%</div>
      </div>
    </div>
  `,
  styles: [`
    .loader-overlay {
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      background: #080504;
      display: flex; align-items: center; justify-content: center;
      z-index: 9999;
      transition: opacity 1.2s cubic-bezier(0.25, 1, 0.5, 1);
      pointer-events: all;
    }
    .loader-overlay.fade-out {
      opacity: 0;
      pointer-events: none;
    }
    .loader-overlay.hidden {
      display: none;
    }
    .loader-content {
      text-align: center;
      color: #fff3e6;
      font-family: 'Outfit', sans-serif;
    }
    .loader-title {
      font-family: 'Italiana', serif;
      font-size: 3.5rem;
      letter-spacing: 0.5rem;
      margin: 0;
      color: #d4a373;
      text-shadow: 0 0 20px rgba(212, 163, 115, 0.2);
      animation: pulse 2s infinite ease-in-out;
    }
    .loader-subtitle {
      font-size: 0.85rem;
      letter-spacing: 0.3rem;
      margin: 0.5rem 0 2rem 0;
      opacity: 0.6;
      text-transform: uppercase;
    }
    .progress-container {
      width: 200px;
      height: 2px;
      background: rgba(255, 255, 255, 0.1);
      margin: 0 auto 0.75rem auto;
      border-radius: 2px;
      overflow: hidden;
    }
    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #d4a373, #faedcd);
      width: 0;
      transition: width 0.3s ease-out;
    }
    .progress-text {
      font-size: 0.8rem;
      letter-spacing: 0.1rem;
      opacity: 0.8;
    }
    @keyframes pulse {
      0%, 100% { opacity: 0.8; }
      50% { opacity: 1; transform: scale(1.02); }
    }
  `]
})
export class LoaderComponent {
  private readonly sceneService = inject(ThreeSceneService);
  private readonly router = inject(Router);

  readonly progress = this.sceneService.loadingProgress;
  readonly fade = signal(false);
  readonly hidden = signal(false);

  constructor() {
    const currentUrl = signal(this.router.url);
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        currentUrl.set(event.urlAfterRedirects || event.url);
      }
    });

    effect(() => {
      const url = currentUrl();
      const isLanding = url.includes('/landing') || url === '/';

      if (!isLanding || this.sceneService.isLoaded()) {
        this.fade.set(true);
        setTimeout(() => {
          this.hidden.set(true);
        }, 1200);
      } else {
        this.fade.set(false);
        this.hidden.set(false);
      }
    });
  }
}
