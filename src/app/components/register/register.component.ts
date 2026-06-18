import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ParticlesBgComponent } from '../particles-bg/particles-bg.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, ParticlesBgComponent],
  template: `
    <div class="auth-wrapper">
      <app-particles-bg></app-particles-bg>

      <div class="auth-card">
        <div class="auth-header">
          <button 
            type="button" 
            class="tab-btn" 
            [class.active]="isRegister()" 
            (click)="setTab(true)"
          >
            REGISTER
          </button>
          <button 
            type="button" 
            class="tab-btn" 
            [class.active]="!isRegister()" 
            (click)="setTab(false)"
          >
            SIGN IN
          </button>
        </div>

        <div class="auth-body">
          <h2 class="auth-title">
            {{ isRegister() ? 'JOIN THE INNER CIRCLE' : 'ENTER THE WORKSPACE' }}
          </h2>
          <p class="auth-subtitle">
            {{ isRegister() ? 'Obtain access to premium digital collections & interactive modules.' : 'Reconnect to your sculpture archives and parameters.' }}
          </p>

          <form (submit)="onSubmit($event)">
            @if (isRegister()) {
              <div class="form-group">
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  [(ngModel)]="name" 
                  required 
                  placeholder=" " 
                  autocomplete="off"
                />
                <label for="name">FULL NAME</label>
              </div>
            }

            <div class="form-group">
              <input 
                type="email" 
                id="email" 
                name="email" 
                [(ngModel)]="email" 
                required 
                placeholder=" " 
                autocomplete="off"
              />
              <label for="email">EMAIL ADDRESS</label>
            </div>

            <div class="form-group">
              <input 
                type="password" 
                id="password" 
                name="password" 
                [(ngModel)]="password" 
                required 
                placeholder=" "
              />
              <label for="password">PASSWORD</label>
            </div>

            @if (isRegister()) {
              <div class="form-group">
                <input 
                  type="password" 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  [(ngModel)]="confirmPassword" 
                  required 
                  placeholder=" "
                />
                <label for="confirmPassword">CONFIRM PASSWORD</label>
              </div>
            }

            @if (errorMessage()) {
              <div class="error-msg">
                {{ errorMessage() }}
              </div>
            }

            <button type="submit" class="submit-btn" [disabled]="loading()">
              @if (loading()) {
                <span class="spinner"></span>
                <span>{{ loadingText() }}</span>
              } @else {
                <span>{{ isRegister() ? 'CREATE ACCOUNT' : 'ACCESS WORKSPACE' }}</span>
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      position: relative;
      width: 100vw;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #080504;
      padding: 100px 20px 40px;
      box-sizing: border-box;
      overflow: hidden;
    }

    .auth-card {
      position: relative;
      z-index: 10;
      width: 100%;
      max-width: 460px;
      background: rgba(15, 11, 9, 0.7);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(212, 163, 115, 0.15);
      padding: 3.5rem 3rem;
      box-sizing: border-box;
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4), 
                  inset 0 1px 0 rgba(255, 255, 255, 0.05);
      transition: border-color 0.5s ease, transform 0.5s ease;
    }

    .auth-card:hover {
      border-color: rgba(212, 163, 115, 0.3);
    }

    .auth-header {
      display: flex;
      gap: 2rem;
      margin-bottom: 2.5rem;
      border-bottom: 1px solid rgba(255, 243, 230, 0.08);
      padding-bottom: 0.75rem;
    }

    .tab-btn {
      background: transparent;
      border: none;
      color: #fff3e6;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.2rem;
      opacity: 0.4;
      padding: 0.5rem 0;
      position: relative;
      transition: opacity 0.3s ease, color 0.3s ease;
    }

    .tab-btn:hover {
      opacity: 0.8;
    }

    .tab-btn.active {
      opacity: 1;
      color: #d4a373;
    }

    .tab-btn.active::after {
      content: '';
      position: absolute;
      bottom: -13px;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: #d4a373;
    }

    .auth-title {
      font-family: 'Italiana', serif;
      font-size: 1.8rem;
      letter-spacing: 0.15rem;
      color: #fff3e6;
      margin: 0 0 0.75rem;
      font-weight: 400;
      line-height: 1.2;
    }

    .auth-subtitle {
      font-size: 0.85rem;
      color: #fff3e6;
      opacity: 0.5;
      line-height: 1.5;
      margin: 0 0 2.5rem;
      font-weight: 300;
    }

    /* Floating Labels Form */
    .form-group {
      position: relative;
      margin-bottom: 2rem;
      width: 100%;
    }

    .form-group input {
      width: 100%;
      background: transparent;
      border: none;
      border-bottom: 1px solid rgba(255, 243, 230, 0.15);
      padding: 0.75rem 0;
      color: #fff3e6;
      font-size: 0.9rem;
      font-family: inherit;
      font-weight: 300;
      letter-spacing: 0.05rem;
      outline: none;
      transition: border-color 0.3s ease;
    }

    .form-group input:focus {
      border-color: #d4a373;
    }

    .form-group label {
      position: absolute;
      top: 0.75rem;
      left: 0;
      color: #fff3e6;
      opacity: 0.35;
      font-size: 0.7rem;
      font-weight: 500;
      letter-spacing: 0.15rem;
      pointer-events: none;
      transition: transform 0.3s ease, opacity 0.3s ease, color 0.3s ease;
      transform-origin: left top;
    }

    /* Floating input label behavior */
    .form-group input:focus + label,
    .form-group input:not(:placeholder-shown) + label {
      transform: translateY(-1.4rem) scale(0.85);
      opacity: 0.85;
      color: #d4a373;
    }

    .error-msg {
      font-size: 0.75rem;
      color: #e65f1e;
      letter-spacing: 0.05rem;
      margin-bottom: 1.5rem;
      font-weight: 400;
    }

    .submit-btn {
      width: 100%;
      background: transparent;
      border: 1px solid rgba(212, 163, 115, 0.3);
      color: #d4a373;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.2rem;
      padding: 1rem;
      margin-top: 1rem;
      transition: all 0.4s ease;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.75rem;
    }

    .submit-btn:hover:not(:disabled) {
      background: #d4a373;
      color: #080504;
      border-color: #d4a373;
      box-shadow: 0 10px 20px rgba(212, 163, 115, 0.15);
    }

    .submit-btn:disabled {
      opacity: 0.6;
      border-color: rgba(255, 243, 230, 0.1);
      color: rgba(255, 243, 230, 0.3);
    }

    /* Spinner animation */
    .spinner {
      width: 14px;
      height: 14px;
      border: 1px solid rgba(212, 163, 115, 0.2);
      border-top-color: currentColor;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 500px) {
      .auth-card {
        padding: 2.5rem 2rem;
      }
    }
  `]
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isRegister = signal(true);
  readonly loading = signal(false);
  readonly loadingText = signal('INITIATING TRANSITION...');
  readonly errorMessage = signal<string | null>(null);

  name = '';
  email = '';
  password = '';
  confirmPassword = '';

  setTab(register: boolean): void {
    this.isRegister.set(register);
    this.errorMessage.set(null);
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.errorMessage.set(null);

    // Basic Validation
    if (!this.email || !this.password) {
      this.errorMessage.set('PLEASE FILL IN ALL REQUIRED FIELDS.');
      return;
    }

    if (this.isRegister()) {
      if (!this.name) {
        this.errorMessage.set('PLEASE PROVIDE YOUR NAME.');
        return;
      }
      if (this.password !== this.confirmPassword) {
        this.errorMessage.set('PASSWORDS DO NOT MATCH.');
        return;
      }
      if (this.password.length < 6) {
        this.errorMessage.set('PASSWORD MUST BE AT LEAST 6 CHARACTERS.');
        return;
      }
    }

    // Trigger simulation
    this.loading.set(true);
    
    if (this.isRegister()) {
      this.loadingText.set('FORGING ACCOUNT ARCHIVES...');
      setTimeout(() => {
        this.loadingText.set('TRANSCENDING TO THE INNER CIRCLE...');
        setTimeout(() => {
          this.authService.register(this.name, this.email);
          this.loading.set(false);
          this.router.navigate(['/home']);
        }, 1200);
      }, 1000);
    } else {
      this.loadingText.set('CONNECTING TO ARCHIVE SERVERS...');
      setTimeout(() => {
        this.loadingText.set('VERIFYING DIGITAL FOOTPRINTS...');
        setTimeout(() => {
          this.authService.login(this.email);
          this.loading.set(false);
          this.router.navigate(['/home']);
        }, 1200);
      }, 1000);
    }
  }
}
