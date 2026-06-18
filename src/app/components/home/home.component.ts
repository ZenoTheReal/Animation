import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ParticlesBgComponent } from '../particles-bg/particles-bg.component';
import { CommonModule } from '@angular/common';

interface SculptureCard {
  number: string;
  name: string;
  year: string;
  status: string;
  desc: string;
  roughness: number;
  metalness: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ParticlesBgComponent, CommonModule],
  template: `
    <div class="home-wrapper">
      <app-particles-bg></app-particles-bg>

      <main class="home-container">
        <!-- Hero Welcome Header -->
        <section class="hero-section">
          <div class="meta-badge">LAOCOÖN DIRECTORY / VERIFIED ACCESS</div>
          <h1 class="welcome-title">
            WELCOME, <span class="highlight">{{ userName() | uppercase }}</span>
          </h1>
          <p class="welcome-desc">
            You are now connected to the primary monument workspace. From here, you can audit sculpture assets, calibrate simulated physical parameters, and review active logs.
          </p>
        </section>

        <!-- Main Workspace Grid -->
        <div class="workspace-grid">
          
          <!-- Left Column: Calibrator Panel -->
          <section class="workspace-panel calibrator-panel">
            <h3 class="panel-title">PARAMETER CALIBRATION</h3>
            <p class="panel-subtitle">Calibrate simulated materials and environment variables.</p>
            
            <div class="sculpture-selector">
              <span class="label">ACTIVE TARGET</span>
              <div class="active-selection">{{ selectedSculpture().number }} // {{ selectedSculpture().name }}</div>
            </div>

            <!-- Parameters Sliders -->
            <div class="calibration-controls">
              <div class="slider-group">
                <div class="slider-header">
                  <span>BRONZE ROUGHNESS</span>
                  <span class="value">{{ roughnessVal().toFixed(2) }}</span>
                </div>
                <input 
                  type="range" 
                  min="0.1" 
                  max="0.9" 
                  step="0.01" 
                  [value]="roughnessVal()" 
                  (input)="updateRoughness($event)" 
                  class="glowing-slider"
                />
                <span class="slider-desc">Calibrates standard microfacet surface scattering.</span>
              </div>

              <div class="slider-group">
                <div class="slider-header">
                  <span>METALNESS COEFFICIENT</span>
                  <span class="value">{{ metalnessVal().toFixed(2) }}</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="1.0" 
                  step="0.01" 
                  [value]="metalnessVal()" 
                  (input)="updateMetalness($event)" 
                  class="glowing-slider"
                />
                <span class="slider-desc">Determines conductor vs dielectric Fresnel reflectance.</span>
              </div>

              <div class="slider-group">
                <div class="slider-header">
                  <span>FOG EXPONENTIAL DENSITY</span>
                  <span class="value">{{ fogVal().toFixed(3) }}</span>
                </div>
                <input 
                  type="range" 
                  min="0.001" 
                  max="0.05" 
                  step="0.001" 
                  [value]="fogVal()" 
                  (input)="updateFog($event)" 
                  class="glowing-slider"
                />
                <span class="slider-desc">Governs spatial absorption and light dispersion.</span>
              </div>
            </div>

            <!-- Calibration Actions -->
            <div class="panel-actions">
              <button class="primary-action-btn" (click)="saveCalibration()">
                {{ saveStatus() }}
              </button>
              <button class="secondary-action-btn" (click)="resetCalibration()">RESET</button>
            </div>
          </section>

          <!-- Right Column: Interactive Assets Grid -->
          <section class="workspace-panel assets-panel">
            <h3 class="panel-title">DIGITAL COLLECTION</h3>
            <p class="panel-subtitle">Select a digital asset node to load into the calibration buffer.</p>

            <div class="cards-grid">
              @for (item of sculptures; track item.number) {
                <div 
                  class="asset-card" 
                  [class.selected]="selectedSculptureIndex() === $index"
                  (click)="selectSculpture($index)"
                >
                  <div class="card-meta">
                    <span class="num">{{ item.number }}</span>
                    <span class="status-indicator" [class.stable]="item.status === 'ONLINE'">{{ item.status }}</span>
                  </div>
                  <h4 class="card-name">{{ item.name }}</h4>
                  <p class="card-desc">{{ item.desc }}</p>
                  <div class="card-footer">
                    <span>LAUNCHED: {{ item.year }}</span>
                    <span class="select-label">{{ selectedSculptureIndex() === $index ? 'ACTIVE' : 'SELECT' }}</span>
                  </div>
                </div>
              }
            </div>
          </section>

        </div>

        <!-- System Status Bar -->
        <footer class="system-status">
          <div class="status-item">
            <span class="dot pulse"></span>
            <span>SYSTEM STATE: STABLE</span>
          </div>
          <div class="status-item">
            <span>CALIBRATION CACHE: 0x7FF09C</span>
          </div>
          <div class="status-item logout-link" (click)="onLogout()">
            <span>[ DISCONNECT SESSION ]</span>
          </div>
        </footer>
      </main>
    </div>
  `,
  styles: [`
    .home-wrapper {
      position: relative;
      width: 100vw;
      min-height: 100vh;
      background-color: #080504;
      color: #fff3e6;
      padding: 120px 4rem 40px;
      box-sizing: border-box;
      overflow-x: hidden;
    }

    .home-container {
      max-width: 1200px;
      margin: 0 auto;
      position: relative;
      z-index: 10;
    }

    /* Hero Section */
    .hero-section {
      margin-bottom: 4rem;
      max-width: 800px;
    }

    .meta-badge {
      display: inline-block;
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 0.15rem;
      color: #d4a373;
      border: 1px solid rgba(212, 163, 115, 0.25);
      padding: 0.35rem 0.75rem;
      margin-bottom: 1.5rem;
    }

    .welcome-title {
      font-family: 'Italiana', serif;
      font-size: 3.5rem;
      font-weight: 400;
      letter-spacing: 0.15rem;
      margin: 0 0 1.5rem 0;
      line-height: 1.1;
    }

    .welcome-title .highlight {
      color: #d4a373;
      text-shadow: 0 0 15px rgba(212, 163, 115, 0.15);
    }

    .welcome-desc {
      font-size: 1rem;
      font-weight: 300;
      opacity: 0.65;
      line-height: 1.7;
      margin: 0;
    }

    /* Workspace Layout */
    .workspace-grid {
      display: grid;
      grid-template-columns: 1.1fr 1.9fr;
      gap: 3rem;
      margin-bottom: 4rem;
    }

    .workspace-panel {
      background: rgba(15, 11, 9, 0.7);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 243, 230, 0.08);
      padding: 3rem;
      box-sizing: border-box;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      transition: border-color 0.4s ease;
    }

    .workspace-panel:hover {
      border-color: rgba(212, 163, 115, 0.2);
    }

    .panel-title {
      font-family: 'Italiana', serif;
      font-size: 1.4rem;
      letter-spacing: 0.15rem;
      margin: 0 0 0.5rem 0;
      font-weight: 400;
    }

    .panel-subtitle {
      font-size: 0.8rem;
      opacity: 0.45;
      margin: 0 0 2.5rem 0;
      font-weight: 300;
    }

    /* Calibrator Panel Specifics */
    .sculpture-selector {
      border: 1px solid rgba(255, 243, 230, 0.12);
      padding: 1rem;
      margin-bottom: 2.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .sculpture-selector .label {
      font-size: 0.6rem;
      font-weight: 600;
      letter-spacing: 0.1rem;
      opacity: 0.4;
    }

    .sculpture-selector .active-selection {
      font-size: 0.85rem;
      font-weight: 500;
      letter-spacing: 0.05rem;
      color: #d4a373;
    }

    .calibration-controls {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .slider-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .slider-header {
      display: flex;
      justify-content: space-between;
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.1rem;
      opacity: 0.8;
    }

    .slider-header .value {
      color: #d4a373;
    }

    .slider-desc {
      font-size: 0.65rem;
      opacity: 0.35;
      font-weight: 300;
    }

    .glowing-slider {
      -webkit-appearance: none;
      width: 100%;
      height: 2px;
      background: rgba(255, 243, 230, 0.1);
      outline: none;
      margin: 0.5rem 0;
      transition: background 0.3s ease;
    }

    .glowing-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #d4a373;
      cursor: pointer;
      box-shadow: 0 0 10px #d4a373;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .glowing-slider::-webkit-slider-thumb:hover {
      transform: scale(1.3);
      box-shadow: 0 0 15px #ff6e14;
    }

    .panel-actions {
      display: flex;
      gap: 1.5rem;
    }

    .primary-action-btn {
      flex: 1;
      background: transparent;
      border: 1px solid rgba(212, 163, 115, 0.4);
      color: #d4a373;
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.15rem;
      padding: 0.9rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .primary-action-btn:hover {
      background: #d4a373;
      color: #080504;
      border-color: #d4a373;
    }

    .secondary-action-btn {
      background: transparent;
      border: 1px solid rgba(255, 243, 230, 0.15);
      color: #fff3e6;
      font-size: 0.7rem;
      font-weight: 500;
      letter-spacing: 0.15rem;
      padding: 0.9rem 1.5rem;
      cursor: pointer;
      opacity: 0.6;
      transition: all 0.3s ease;
    }

    .secondary-action-btn:hover {
      opacity: 1;
      border-color: #fff3e6;
    }

    /* Cards Grid */
    .cards-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .asset-card {
      border: 1px solid rgba(255, 243, 230, 0.08);
      background: rgba(255, 255, 255, 0.01);
      padding: 1.75rem;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
    }

    .asset-card:hover {
      background: rgba(255, 243, 230, 0.02);
      border-color: rgba(212, 163, 115, 0.25);
      transform: translateY(-4px);
    }

    .asset-card.selected {
      border-color: #d4a373;
      background: rgba(212, 163, 115, 0.04);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }

    .card-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
    }

    .card-meta .num {
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 0.1rem;
      opacity: 0.45;
    }

    .status-indicator {
      font-size: 0.55rem;
      font-weight: 700;
      letter-spacing: 0.05rem;
      color: #ff6e14;
      opacity: 0.7;
    }

    .status-indicator.stable {
      color: #a3cc9c;
    }

    .card-name {
      font-family: 'Italiana', serif;
      font-size: 1.2rem;
      font-weight: 400;
      letter-spacing: 0.08rem;
      margin: 0 0 0.75rem 0;
      transition: color 0.3s ease;
    }

    .asset-card.selected .card-name {
      color: #d4a373;
    }

    .card-desc {
      font-size: 0.75rem;
      opacity: 0.5;
      font-weight: 300;
      line-height: 1.5;
      margin: 0 0 1.5rem 0;
      height: 44px;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      font-size: 0.6rem;
      letter-spacing: 0.05rem;
      font-weight: 500;
      opacity: 0.4;
      border-top: 1px solid rgba(255, 243, 230, 0.05);
      padding-top: 0.75rem;
    }

    .asset-card.selected .card-footer {
      border-color: rgba(212, 163, 115, 0.15);
      opacity: 0.8;
      color: #d4a373;
    }

    /* System Status Footer */
    .system-status {
      display: flex;
      justify-content: space-between;
      border-top: 1px solid rgba(255, 243, 230, 0.08);
      padding-top: 2rem;
      font-size: 0.7rem;
      font-weight: 500;
      letter-spacing: 0.15rem;
      opacity: 0.6;
    }

    .status-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .status-item .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: #a3cc9c;
    }

    .dot.pulse {
      animation: pulse-green 2s infinite;
    }

    @keyframes pulse-green {
      0% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(163, 204, 156, 0.7);
      }
      70% {
        transform: scale(1);
        box-shadow: 0 0 0 6px rgba(163, 204, 156, 0);
      }
      100% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(163, 204, 156, 0);
      }
    }

    .logout-link {
      cursor: pointer;
      color: #fff3e6;
      transition: color 0.3s ease;
    }

    .logout-link:hover {
      color: #ff6e14;
    }

    /* Responsive adjustments */
    @media (max-width: 1024px) {
      .workspace-grid {
        grid-template-columns: 1fr;
        gap: 2.5rem;
      }
      .home-wrapper {
        padding: 110px 2rem 40px;
      }
    }

    @media (max-width: 680px) {
      .cards-grid {
        grid-template-columns: 1fr;
      }
      .welcome-title {
        font-size: 2.5rem;
      }
    }
  `]
})
export class HomeComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly userName = computed(() => this.authService.currentUser()?.name || 'Artisanal Seeker');
  readonly selectedSculptureIndex = signal(0);
  readonly roughnessVal = signal(0.42);
  readonly metalnessVal = signal(0.92);
  readonly fogVal = signal(0.01);
  readonly saveStatus = signal('APPLY CALIBRATION');

  readonly sculptures: SculptureCard[] = [
    {
      number: 'ASSET // 01',
      name: 'BRONZE & TIME',
      year: '2026.04.12',
      status: 'ONLINE',
      desc: 'High-density physical simulation testing microfacet bronze deformation over centuries.',
      roughness: 0.42,
      metalness: 0.92
    },
    {
      number: 'ASSET // 02',
      name: 'SPIRAL OF ANGUISH',
      year: '2026.05.02',
      status: 'ONLINE',
      desc: 'Calibrated anatomical mesh exhibiting mechanical stress fields and dynamic tension nodes.',
      roughness: 0.35,
      metalness: 0.88
    },
    {
      number: 'ASSET // 03',
      name: 'LIQUID METAMORPHOSIS',
      year: '2026.05.28',
      status: 'STANDBY',
      desc: 'Metamorphic liquid bronze wave generator undergoing fluid specular coefficient calibrations.',
      roughness: 0.22,
      metalness: 0.98
    },
    {
      number: 'ASSET // 04',
      name: 'THE ETERNAL RETURN',
      year: '2026.06.15',
      status: 'ONLINE',
      desc: 'Closed temporal animation loop measuring micro-mesh degradation parameters under heat load.',
      roughness: 0.48,
      metalness: 0.80
    }
  ];

  readonly selectedSculpture = computed(() => this.sculptures[this.selectedSculptureIndex()]);

  selectSculpture(index: number): void {
    this.selectedSculptureIndex.set(index);
    // Preset values based on chosen sculpture
    const s = this.sculptures[index];
    this.roughnessVal.set(s.roughness);
    this.metalnessVal.set(s.metalness);
  }

  updateRoughness(e: Event): void {
    const val = parseFloat((e.target as HTMLInputElement).value);
    this.roughnessVal.set(val);
  }

  updateMetalness(e: Event): void {
    const val = parseFloat((e.target as HTMLInputElement).value);
    this.metalnessVal.set(val);
  }

  updateFog(e: Event): void {
    const val = parseFloat((e.target as HTMLInputElement).value);
    this.fogVal.set(val);
  }

  saveCalibration(): void {
    this.saveStatus.set('TRANSMITTING...');
    setTimeout(() => {
      this.saveStatus.set('PARAMETERS STORED');
      setTimeout(() => {
        this.saveStatus.set('APPLY CALIBRATION');
      }, 1500);
    }, 1000);
  }

  resetCalibration(): void {
    const s = this.selectedSculpture();
    this.roughnessVal.set(s.roughness);
    this.metalnessVal.set(s.metalness);
    this.fogVal.set(0.01);
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
