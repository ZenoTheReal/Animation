import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoaderComponent } from './components/loader/loader.component';
import { CursorComponent } from './components/cursor/cursor.component';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    LoaderComponent,
    CursorComponent,
    HeaderComponent,
    RouterOutlet,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  constructor() {
    if (typeof window !== 'undefined') {
      const logToOnscreen = (msg: string, color = '#00ff00') => {
        const consoleEl = document.getElementById('debug-console');
        if (consoleEl) {
          const div = document.createElement('div');
          div.style.color = color;
          div.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
          div.style.padding = '4px 0';
          div.style.wordBreak = 'break-all';
          div.innerText = msg;
          consoleEl.appendChild(div);
          while (consoleEl.children.length > 50) {
            if (consoleEl.children[1]) {
              consoleEl.removeChild(consoleEl.children[1]);
            } else {
              break;
            }
          }
          consoleEl.scrollTop = consoleEl.scrollHeight;
        }
      };

      const originalLog = console.log;
      console.log = (...args) => {
        originalLog.apply(console, args);
        logToOnscreen(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '), '#a2ffd0');
      };

      const originalError = console.error;
      console.error = (...args) => {
        originalError.apply(console, args);
        logToOnscreen(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '), '#ff6b6b');
      };

      const originalWarn = console.warn;
      console.warn = (...args) => {
        originalWarn.apply(console, args);
        logToOnscreen(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '), '#ffd266');
      };

      window.addEventListener('error', (event) => {
        logToOnscreen(`Runtime Error: ${event.message} at ${event.filename}:${event.lineno}`, '#ff6b6b');
      });

      window.addEventListener('unhandledrejection', (event) => {
        logToOnscreen(`Unhandled Promise: ${event.reason}`, '#ff6b6b');
      });
    }
  }
}
