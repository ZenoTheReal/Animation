import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ScrollService } from './services/scroll.service';
import { LoaderComponent } from './components/loader/loader.component';
import { CursorComponent } from './components/cursor/cursor.component';
import { HeaderComponent } from './components/header/header.component';
import { SlideComponent } from './components/slide/slide.component';
import { ImageMaskComponent } from './components/image-mask/image-mask.component';
import { GridOverlayComponent } from './components/grid-overlay/grid-overlay.component';
import { WebglCanvasComponent } from './components/webgl-canvas/webgl-canvas.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    LoaderComponent,
    CursorComponent,
    HeaderComponent,
    SlideComponent,
    ImageMaskComponent,
    GridOverlayComponent,
    WebglCanvasComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly scrollService = inject(ScrollService);

  readonly slide1Active = this.scrollService.slide1Active;
  readonly slide2Active = this.scrollService.slide2Active;
  readonly slide3Active = this.scrollService.slide3Active;
  readonly slide4Active = this.scrollService.slide4Active;
}
