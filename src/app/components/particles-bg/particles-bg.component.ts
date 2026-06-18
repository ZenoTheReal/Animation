import { Component, ElementRef, viewChild, afterNextRender, DestroyRef, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  alpha: number;
  decay: number;
  color: string;
  phase: number;
  swaySpeed: number;
}

@Component({
  selector: 'app-particles-bg',
  standalone: true,
  template: `
    <canvas #canvas class="particles-canvas"></canvas>
  `,
  styles: [`
    .particles-canvas {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      z-index: 0;
      pointer-events: none;
      opacity: 0.8;
    }
  `]
})
export class ParticlesBgComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser  = isPlatformBrowser(this.platformId);
  private readonly destroyRef = inject(DestroyRef);
  readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private rafId = 0;
  private width = 800;
  private height = 600;
  private mouse = { x: -1000, y: -1000 };

  constructor() {
    if (this.isBrowser) {
      afterNextRender(() => {
        const canvas = this.canvasRef().nativeElement;
        const context = canvas.getContext('2d');
        if (!context) return;
        this.ctx = context;

        this.resize();
        window.addEventListener('resize', this.resize);
        window.addEventListener('mousemove', this.onMouseMove);

        // Populate initial particles
        for (let i = 0; i < 40; i++) {
          this.particles.push(this.createParticle(true));
        }

        this.startLoop();

        this.destroyRef.onDestroy(() => {
          window.removeEventListener('resize', this.resize);
          window.removeEventListener('mousemove', this.onMouseMove);
          if (this.rafId) cancelAnimationFrame(this.rafId);
        });
      });
    }
  }

  private readonly resize = () => {
    const canvas = this.canvasRef().nativeElement;
    const parent = canvas.parentElement || document.body;
    this.width = parent.clientWidth;
    this.height = parent.clientHeight;
    
    // Support High-DPI screens
    const dpr = window.devicePixelRatio || 1;
    canvas.width = this.width * dpr;
    canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
    
    canvas.style.width = `${this.width}px`;
    canvas.style.height = `${this.height}px`;
  };

  private readonly onMouseMove = (e: MouseEvent) => {
    const canvas = this.canvasRef().nativeElement;
    const rect = canvas.getBoundingClientRect();
    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;
  };

  private createParticle(randomY = false): Particle {
    const colors = [
      'rgba(212, 163, 115, ',  // Bronze/gold
      'rgba(255, 110, 20, ',   // Hot Amber
      'rgba(255, 243, 230, ',  // Warm White
      'rgba(230, 95, 30, '     // Deep Ember
    ];
    const baseColor = colors[Math.floor(Math.random() * colors.length)];
    return {
      x: Math.random() * this.width,
      y: randomY ? Math.random() * this.height : this.height + 10,
      size: Math.random() * 2.2 + 0.6,
      speedY: -(Math.random() * 0.9 + 0.4),
      speedX: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.3,
      decay: Math.random() * 0.0012 + 0.0006,
      color: baseColor,
      phase: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.02 + 0.01
    };
  }

  private startLoop(): void {
    const loop = () => {
      this.tick();
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  private tick(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Update and draw particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      
      // Float upward & sway
      p.phase += p.swaySpeed;
      p.y += p.speedY;
      p.x += p.speedX + Math.sin(p.phase) * 0.15;
      
      // Interactive mouse repel
      const dx = p.x - this.mouse.x;
      const dy = p.y - this.mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        const force = (100 - dist) / 100;
        const angle = Math.atan2(dy, dx);
        p.x += Math.cos(angle) * force * 1.5;
        p.y += Math.sin(angle) * force * 0.8; // subtle vertical push too
      }

      // Age particle
      p.alpha -= p.decay;

      // Reset when particle goes off-screen or fades
      if (p.alpha <= 0 || p.y < -10 || p.x < -10 || p.x > this.width + 10) {
        this.particles[i] = this.createParticle(false);
        continue;
      }

      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `${p.color}${p.alpha.toFixed(2)})`;
      
      // Add subtle glow to larger amber particles
      if (p.size > 2 && p.color.includes('255, 110')) {
        this.ctx.shadowColor = '#ff6e14';
        this.ctx.shadowBlur = 6;
      } else {
        this.ctx.shadowBlur = 0;
      }
      
      this.ctx.fill();
    }
    this.ctx.shadowBlur = 0; // reset
  }
}
