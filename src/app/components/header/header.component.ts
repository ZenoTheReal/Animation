import { Component, inject, ElementRef, viewChildren, effect, signal } from '@angular/core';
import { ScrollService } from '../../services/scroll.service';
import { NAV_TARGETS } from '../../constants/scene.constants';

@Component({
  selector: 'app-header',
  standalone: true,
  template: `
    <header class="editorial-header">
      <div class="brand" (click)="scrollTo(0)">LAOCOÖN</div>
      <nav class="nav-links">
        <a #navLink (click)="scrollTo(0)" [class.active]="activeIndex() === 0">I. FORGE</a>
        <a #navLink (click)="scrollTo(1)" [class.active]="activeIndex() === 1">II. SCULPT</a>
        <a #navLink (click)="scrollTo(2)" [class.active]="activeIndex() === 2">III. METAMORPHOSIS</a>
        <a #navLink (click)="scrollTo(3)" [class.active]="activeIndex() === 3">IV. TIME</a>
        <span class="active-indicator" [style.transform]="indicatorTransform()"></span>
      </nav>
      <button class="contact-btn">CONTACT</button>
    </header>
  `,
  styles: [`
    .editorial-header {
      position: fixed;
      top: 0; left: 0; width: 100%;
      height: 90px;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 4rem;
      box-sizing: border-box;
      z-index: 1000;
      font-family: 'Outfit', sans-serif;
      pointer-events: all;
    }
    .brand {
      font-family: 'Italiana', serif;
      font-size: 1.8rem;
      letter-spacing: 0.35rem;
      color: #fff3e6;
      cursor: pointer;
      user-select: none;
      transition: color 0.3s ease;
    }
    .brand:hover {
      color: #d4a373;
    }
    .nav-links {
      display: flex;
      gap: 3.5rem;
      position: relative;
      align-items: center;
      height: 100%;
    }
    .nav-links a {
      color: #fff3e6;
      font-size: 0.75rem;
      font-weight: 500;
      letter-spacing: 0.25rem;
      text-transform: uppercase;
      text-decoration: none;
      cursor: pointer;
      opacity: 0.55;
      padding: 0.75rem 0;
      transition: opacity 0.4s ease, color 0.4s ease;
      user-select: none;
    }
    .nav-links a:hover {
      opacity: 0.95;
      color: #faedcd;
    }
    .nav-links a.active {
      opacity: 1;
      color: #d4a373;
    }
    .active-indicator {
      position: absolute;
      bottom: 0px;
      left: 0;
      width: 1px;
      height: 2px;
      background: #d4a373;
      transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1);
      transform-origin: left center;
      pointer-events: none;
    }
    .contact-btn {
      background: transparent;
      border: 1px solid rgba(255, 243, 230, 0.25);
      color: #fff3e6;
      font-size: 0.7rem;
      font-weight: 500;
      letter-spacing: 0.2rem;
      padding: 0.75rem 1.75rem;
      border-radius: 0;
      cursor: pointer;
      transition: background 0.4s ease, border-color 0.4s ease, color 0.4s ease;
    }
    .contact-btn:hover {
      background: #fff3e6;
      color: #080504;
      border-color: #fff3e6;
    }
    @media (max-width: 900px) {
      .editorial-header {
        padding: 0 2rem;
        height: 70px;
      }
      .nav-links {
        display: none;
      }
    }
  `]
})
export class HeaderComponent {
  private readonly scrollService = inject(ScrollService);
  readonly activeIndex = this.scrollService.activeIndex;

  readonly navLinks = viewChildren<ElementRef<HTMLAnchorElement>>('navLink');
  readonly indicatorTransform = signal('translateX(0px) scaleX(0)');

  constructor() {
    effect(() => {
      const links = this.navLinks();
      const idx = this.activeIndex();
      if (links.length > 0 && idx >= 0 && idx < links.length) {
        const el = links[idx].nativeElement;
        const left = el.offsetLeft;
        const width = el.offsetWidth;
        this.indicatorTransform.set(`translateX(${left}px) scaleX(${width})`);
      } else {
        this.indicatorTransform.set('translateX(0px) scaleX(0)');
      }
    });
  }

  scrollTo(index: number): void {
    const targetFraction = NAV_TARGETS[index];
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({
      top: targetFraction * maxScroll,
      behavior: 'smooth'
    });
  }
}
