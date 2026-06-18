import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ScrollService } from '../../services/scroll.service';
import { SlideComponent } from '../slide/slide.component';
import { ImageMaskComponent } from '../image-mask/image-mask.component';
import { GridOverlayComponent } from '../grid-overlay/grid-overlay.component';
import { WebglCanvasComponent } from '../webgl-canvas/webgl-canvas.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    SlideComponent,
    ImageMaskComponent,
    GridOverlayComponent,
    WebglCanvasComponent,
  ],
  template: `
    <app-grid-overlay></app-grid-overlay>
    <app-webgl-canvas></app-webgl-canvas>

    <main class="editorial-content">
      <!-- Slide 1: Origin -->
      <app-slide
        [active]="slide1Active()"
        slideNumber="01 / ORIGIN"
        heading="BRONZE <br>AND TIME"
        description="The heat of the forge meets the weight of history. <br>A monument frozen in state, waiting to dissolve."
      ></app-slide>

      <!-- Slide 2: Structure -->
      <app-slide
        [active]="slide2Active()"
        slideNumber="02 / STRUCTURE"
        heading="THE SPIRAL <br>OF ANGUISH"
        description="Every muscle strained against the serpent's coils. <br>A physical tension that echoes through centuries."
      >
        <app-image-mask [active]="slide2Active()"></app-image-mask>
      </app-slide>

      <!-- Slide 3: Fluidity -->
      <app-slide
        [active]="slide3Active()"
        slideNumber="03 / FLUIDITY"
        heading="LIQUID <br>METAMORPHOSIS"
        description="Molten metal flows like blood. The solid horse dissolves <br>into a fluid wave, turning form into pure energy."
      ></app-slide>

      <!-- Slide 4: Endless -->
      <app-slide
        [active]="slide4Active()"
        slideNumber="04 / ENDLESS"
        heading="THE ETERNAL <br>RETURN"
        description="Time loops, the fire cools, and the cycle repeats. <br>A digital monument to the persistence of bronze."
      ></app-slide>
    </main>

    <!-- Outer container that enables scrolling -->
    <div class="scroll-container">
      <div class="scroll-spacer"></div>
    </div>
  `,
  styles: [`
    .editorial-content {
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      z-index: 10;
      pointer-events: none;
    }

    .scroll-container {
      position: relative;
      width: 100%;
      z-index: 2;
      pointer-events: none;
    }

    .scroll-spacer {
      height: 900vh;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent {
  private readonly scrollService = inject(ScrollService);

  readonly slide1Active = this.scrollService.slide1Active;
  readonly slide2Active = this.scrollService.slide2Active;
  readonly slide3Active = this.scrollService.slide3Active;
  readonly slide4Active = this.scrollService.slide4Active;
}
