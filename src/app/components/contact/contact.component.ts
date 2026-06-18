import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ParticlesBgComponent } from '../particles-bg/particles-bg.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule, ParticlesBgComponent],
  template: `
    <div class="contact-wrapper">
      <app-particles-bg></app-particles-bg>

      <div class="contact-card">
        @if (success()) {
          <div class="success-screen">
            <div class="success-icon">✓</div>
            <h2 class="success-title">MESSAGE CAST</h2>
            <p class="success-description">
              Your inquiry has been sent to the forge. Our curators will respond within one solar cycle.
            </p>
            <button type="button" class="back-btn" (click)="goHome()">
              RETURN TO WORKSPACE
            </button>
          </div>
        } @else {
          <div class="contact-header">
            <h2 class="contact-title">INQUIRE & CONNECT</h2>
            <p class="contact-subtitle">
              Send a query to the Laocoön workspace curators regarding collaborations, parameter models, or physical monuments.
            </p>
          </div>

          <form (submit)="onSubmit($event)">
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
              <label for="name">YOUR NAME</label>
            </div>

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
                type="text" 
                id="subject" 
                name="subject" 
                [(ngModel)]="subject" 
                required 
                placeholder=" " 
                autocomplete="off"
              />
              <label for="subject">SUBJECT OF INQUIRY</label>
            </div>

            <div class="form-group">
              <textarea 
                id="message" 
                name="message" 
                [(ngModel)]="message" 
                required 
                placeholder=" "
                rows="4"
              ></textarea>
              <label for="message">YOUR MESSAGE</label>
            </div>

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
                <span>CAST MESSAGE</span>
              }
            </button>
          </form>
        }
      </div>
    </div>
  `,
  styles: [`
    .contact-wrapper {
      position: relative;
      width: 100vw;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #080504;
      padding: 110px 20px 40px;
      box-sizing: border-box;
      overflow: hidden;
    }

    .contact-card {
      position: relative;
      z-index: 10;
      width: 100%;
      max-width: 520px;
      background: rgba(15, 11, 9, 0.75);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(212, 163, 115, 0.15);
      padding: 4rem 3.5rem;
      box-sizing: border-box;
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4), 
                  inset 0 1px 0 rgba(255, 255, 255, 0.05);
      transition: border-color 0.5s ease;
    }

    .contact-card:hover {
      border-color: rgba(212, 163, 115, 0.3);
    }

    .contact-title {
      font-family: 'Italiana', serif;
      font-size: 1.8rem;
      letter-spacing: 0.2rem;
      color: #fff3e6;
      margin: 0 0 0.75rem;
      font-weight: 400;
    }

    .contact-subtitle {
      font-size: 0.85rem;
      color: #fff3e6;
      opacity: 0.5;
      line-height: 1.6;
      margin: 0 0 3rem;
      font-weight: 300;
    }

    /* Floating Labels Form */
    .form-group {
      position: relative;
      margin-bottom: 2rem;
      width: 100%;
    }

    .form-group input,
    .form-group textarea {
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
      resize: none;
    }

    .form-group input:focus,
    .form-group textarea:focus {
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

    /* Floating input/textarea label behavior */
    .form-group input:focus + label,
    .form-group input:not(:placeholder-shown) + label,
    .form-group textarea:focus + label,
    .form-group textarea:not(:placeholder-shown) + label {
      transform: translateY(-1.4rem) scale(0.85);
      opacity: 0.85;
      color: #d4a373;
    }

    .error-msg {
      font-size: 0.75rem;
      color: #e65f1e;
      letter-spacing: 0.05rem;
      margin-bottom: 1.5rem;
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

    /* Success state styling */
    .success-screen {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 2rem 0;
    }

    .success-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: 2px solid #d4a373;
      color: #d4a373;
      font-size: 2rem;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 2rem;
      box-shadow: 0 0 20px rgba(212, 163, 115, 0.2);
    }

    .success-title {
      font-family: 'Italiana', serif;
      font-size: 2rem;
      letter-spacing: 0.3rem;
      color: #fff3e6;
      margin: 0 0 1rem;
      font-weight: 400;
    }

    .success-description {
      font-size: 0.9rem;
      line-height: 1.7;
      opacity: 0.7;
      margin-bottom: 3rem;
      max-width: 380px;
    }

    .back-btn {
      background: #fff3e6;
      color: #080504;
      border: 1px solid #fff3e6;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.15rem;
      padding: 1rem 2rem;
      transition: all 0.3s ease;
    }

    .back-btn:hover {
      background: transparent;
      color: #fff3e6;
      border-color: #fff3e6;
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

    @media (max-width: 580px) {
      .contact-card {
        padding: 3rem 2rem;
      }
    }
  `]
})
export class ContactComponent {
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly loadingText = signal('CASTING MESSAGE...');
  readonly success = signal(false);
  readonly errorMessage = signal<string | null>(null);

  name = '';
  email = '';
  subject = '';
  message = '';

  onSubmit(event: Event): void {
    event.preventDefault();
    this.errorMessage.set(null);

    if (!this.name || !this.email || !this.subject || !this.message) {
      this.errorMessage.set('PLEASE ACCOMPLISH ALL FIELDS BEFORE CASTING.');
      return;
    }

    this.loading.set(true);
    this.loadingText.set('MELTING INQUIRY DATA...');

    setTimeout(() => {
      this.loadingText.set('TRANSMITTING TO THE DIGITAL MONUMENT...');
      setTimeout(() => {
        this.loading.set(false);
        this.success.set(true);
      }, 1200);
    }, 1000);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
