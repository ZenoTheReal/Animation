import { Component, input } from '@angular/core';
import { IMAGE_1_URL } from '../../constants/scene.constants';

@Component({
  selector: 'app-image-mask',
  standalone: true,
  template: `
    <div class="image-mask-container" [class.active]="active()">
      <img [src]="imgUrl" alt="Structure Details" class="masked-image" />
      <div class="slice-overlay"></div>
    </div>
  `,
  styles: [`
    .image-mask-container {
      position: relative;
      width: 280px;
      height: 380px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
      border: 1px solid rgba(255, 243, 230, 0.15);
      border-radius: 4px;
      transform: translate3d(50px, 0, 0);
      opacity: 0;
      transition: transform 1.2s cubic-bezier(0.25, 1, 0.5, 1) 0.3s,
                  opacity 1.2s cubic-bezier(0.25, 1, 0.5, 1) 0.3s;
    }
    .image-mask-container.active {
      transform: translate3d(0, 0, 0);
      opacity: 1;
    }
    .masked-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      clip-path: polygon(100% 0, 100% 0, 100% 100%, 100% 100%);
      transition: clip-path 1.4s cubic-bezier(0.25, 1, 0.5, 1) 0.5s;
    }
    .image-mask-container.active .masked-image {
      clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
    }
    .slice-overlay {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      background: linear-gradient(135deg, #d4a373 0%, #faedcd 100%);
      transform: translate3d(-100%, 100%, 0);
      transition: transform 1.4s cubic-bezier(0.25, 1, 0.5, 1) 0.4s;
      mix-blend-mode: color-dodge;
      pointer-events: none;
    }
    .image-mask-container.active .slice-overlay {
      transform: translate3d(100%, -100%, 0);
    }
    @media (max-width: 900px) {
      .image-mask-container {
        display: none;
      }
    }
  `]
})
export class ImageMaskComponent {
  active = input.required<boolean>();
  readonly imgUrl = IMAGE_1_URL;
}
