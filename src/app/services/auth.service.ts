import { Injectable, signal, computed } from '@angular/core';

export interface UserSession {
  name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _currentUser = signal<UserSession | null>(null);
  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn = computed(() => this._currentUser() !== null);

  // A local storage fallback so refresh works nicely if user wants
  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('laocoon_session');
      if (stored) {
        try {
          this._currentUser.set(JSON.parse(stored));
        } catch {
          // ignore
        }
      }
    }
  }

  register(name: string, email: string): void {
    const session: UserSession = { name: name || 'Artisanal Seeker', email };
    this._currentUser.set(session);
    if (typeof window !== 'undefined') {
      localStorage.setItem('laocoon_session', JSON.stringify(session));
    }
  }

  login(email: string): void {
    const name = email.split('@')[0];
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
    const session: UserSession = { name: formattedName || 'Connoisseur', email };
    this._currentUser.set(session);
    if (typeof window !== 'undefined') {
      localStorage.setItem('laocoon_session', JSON.stringify(session));
    }
  }

  logout(): void {
    this._currentUser.set(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('laocoon_session');
    }
  }
}
