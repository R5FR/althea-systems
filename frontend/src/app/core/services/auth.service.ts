import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResult, LoginDto, RegisterDto, User } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly base = `${environment.apiUrl}/auth`;

  // Signals
  private _user = signal<User | null>(this.loadUser());
  private _token = signal<string | null>(localStorage.getItem('access_token'));

  readonly user = this._user.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isLoggedIn = computed(() => !!this._token());
  readonly isAdmin = computed(() => this._user()?.role === 'Admin');

  login(dto: LoginDto) {
    return this.http.post<AuthResult>(`${this.base}/login`, dto).pipe(
      tap(res => this.storeSession(res, dto.rememberMe))
    );
  }

  register(dto: RegisterDto) {
    return this.http.post<AuthResult>(`${this.base}/register`, dto).pipe(
      tap(res => this.storeSession(res))
    );
  }

  logout() {
    this.http.post(`${this.base}/logout`, {}).subscribe({ error: () => {} });
    this.clearSession();
    this.router.navigate(['/']);
  }

  refreshToken() {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) return throwError(() => new Error('No refresh token'));
    return this.http.post<AuthResult>(`${this.base}/refresh`, { refreshToken: refresh }).pipe(
      tap(res => this.storeSession(res))
    );
  }

  confirmEmail(token: string) {
    return this.http.post(`${this.base}/confirm-email`, { token });
  }

  forgotPassword(email: string) {
    return this.http.post(`${this.base}/forgot-password`, { email });
  }

  resetPassword(token: string, password: string) {
    return this.http.post(`${this.base}/reset-password`, { token, password });
  }

  private storeSession(res: AuthResult, remember = false) {
    const storage = remember ? localStorage : sessionStorage;
    localStorage.setItem('access_token', res.accessToken);
    if (res.refreshToken) localStorage.setItem('refresh_token', res.refreshToken);
    localStorage.setItem('user', JSON.stringify(res.user));
    this._token.set(res.accessToken);
    this._user.set(res.user);
  }

  private clearSession() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    this._token.set(null);
    this._user.set(null);
  }

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  updateUserCache(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
    this._user.set(user);
  }
}
