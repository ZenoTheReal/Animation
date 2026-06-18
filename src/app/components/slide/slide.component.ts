import { Component, input } from '@angular/core';
import { CharSplitPipe } from '../../pipes/char-split.pipe';

@Component({
  selector: 'app-slide',
  standalone: true,
  imports: [CharSplitPipe],
  template: `
    <section class="slide-section" [class.active]="active()">
      <div class="slide-container">
        <div class="slide-text">
          <div class="slide-meta">
            <span class="line"></span>
            <span class="number">{{ slideNumber() }}</span>
          </div>
          
          <h2 class="slide-title">
            @for (tok of heading() | charSplit; track $index) {
              @if (tok.isBr) {
                <br>
              } @else if (tok.isSpace) {
                <span class="space">&nbsp;</span>
              } @else {
                <span class="char-animate" [style.transition-delay.s]="tok.delay">{{ tok.char }}</span>
              }
            }
          </h2>

          <p class="slide-description">
            @for (tok of description() | charSplit; track $index) {
              @if (tok.isBr) {
                <br>
              } @else if (tok.isSpace) {
                <span class="space">&nbsp;</span>
              } @else {
                <span class="char-animate" [style.transition-delay.s]="tok.delay * 0.4">{{ tok.char }}</span>
              }
            }
          </p>
        </div>

        <div class="slide-content-slot">
          <ng-content></ng-content>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .slide-section {
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      display: flex; align-items: center;
      padding-left: 10vw;
      padding-top: 80px; /* Prevent header overlap on shorter viewports */
      box-sizing: border-box;
      color: #fff3e6;
      font-family: 'Outfit', sans-serif;
      z-index: 10;
      pointer-events: none;
      opacity: 0;
      transition: opacity 1.0s cubic-bezier(0.25, 1, 0.5, 1);
    }
    .slide-section.active {
      opacity: 1;
      pointer-events: all;
    }
    .slide-container {
      display: flex;
      align-items: center;
      gap: 6vw;
      width: 80vw;
      max-width: 1200px;
      position: relative;
    }
    .slide-text {
      max-width: 500px;
      flex-shrink: 0;
    }
    .slide-meta {
      display: flex; align-items: center;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
      opacity: 0;
      transform: translate3d(0, 10px, 0);
      transition: opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s;
    }
    .slide-section.active .slide-meta {
      opacity: 0.6;
      transform: translate3d(0, 0, 0);
    }
    .slide-meta .line {
      width: 40px; height: 1px;
      background: #fff3e6;
    }
    .slide-meta .number {
      font-size: 0.75rem;
      font-weight: 500;
      letter-spacing: 0.2rem;
    }
    .slide-title {
      font-family: 'Italiana', serif;
      font-size: 4rem;
      line-height: 1.15;
      font-weight: 400;
      letter-spacing: 0.1rem;
      margin: 0 0 2rem 0;
    }
    .slide-description {
      font-size: 0.95rem;
      line-height: 1.7;
      opacity: 0.8;
      font-weight: 300;
      letter-spacing: 0.05rem;
      margin: 0;
    }
    
    /* Blur-up letters animations */
    .char-animate {
      display: inline-block;
      opacity: 0;
      filter: blur(12px);
      transform: translate3d(0, 12px, 0) scale(0.95);
      transition: opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1),
                  filter 0.8s cubic-bezier(0.25, 1, 0.5, 1),
                  transform 0.8s cubic-bezier(0.25, 1, 0.5, 1);
      transition-delay: inherit;
    }
    .slide-section.active .char-animate {
      opacity: 1;
      filter: blur(0px);
      transform: translate3d(0, 0, 0) scale(1);
    }
    
    .slide-content-slot {
      opacity: 0;
      transform: translate3d(0, 15px, 0);
      transition: opacity 0.8s ease 0.6s, transform 0.8s ease 0.6s;
    }
    .slide-section.active .slide-content-slot {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }

    @media (max-width: 900px) {
      .slide-section {
        padding-left: 5vw;
        padding-right: 5vw;
        padding-top: 60px;
      }
      .slide-container {
        width: 100%;
        flex-direction: column;
        align-items: flex-start;
      }
      .slide-title {
        font-size: 2.8rem;
      }
    }
  `]
})
export class SlideComponent {
  active      = input.required<boolean>();
  slideNumber = input.required<string>();
  heading     = input.required<string>();
  description = input.required<string>();
}
