import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  const mockAuthResult = {
    accessToken: 'fake-access-token',
    refreshToken: 'fake-refresh-token',
    user: { id: '1', firstName: 'Jean', lastName: 'Dupont', email: 'jean@test.fr', role: 'User' },
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        AuthService,
      ],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  // ── État initial ───────────────────────────────────────────────────────────

  it('isLoggedIn est false au démarrage sans token', () => {
    expect(service.isLoggedIn()).toBe(false);
  });

  it('user est null au démarrage sans token', () => {
    expect(service.user()).toBeNull();
  });

  it('isAdmin est false au démarrage', () => {
    expect(service.isAdmin()).toBe(false);
  });

  // ── login ──────────────────────────────────────────────────────────────────

  it('login envoie un POST vers /auth/login', () => {
    const dto = { email: 'jean@test.fr', password: 'pass', rememberMe: false };
    service.login(dto).subscribe();
    const req = http.expectOne(r => r.url.includes('/auth/login'));
    expect(req.request.method).toBe('POST');
    req.flush(mockAuthResult);
  });

  it('login stocke le token dans localStorage', () => {
    service.login({ email: 'jean@test.fr', password: 'pass', rememberMe: false }).subscribe();
    http.expectOne(r => r.url.includes('/auth/login')).flush(mockAuthResult);
    expect(localStorage.getItem('access_token')).toBe('fake-access-token');
  });

  it('login met à jour le signal isLoggedIn', () => {
    service.login({ email: 'jean@test.fr', password: 'pass', rememberMe: false }).subscribe();
    http.expectOne(r => r.url.includes('/auth/login')).flush(mockAuthResult);
    expect(service.isLoggedIn()).toBe(true);
  });

  it('login met à jour le signal user', () => {
    service.login({ email: 'jean@test.fr', password: 'pass', rememberMe: false }).subscribe();
    http.expectOne(r => r.url.includes('/auth/login')).flush(mockAuthResult);
    expect(service.user()?.email).toBe('jean@test.fr');
  });

  // ── register ───────────────────────────────────────────────────────────────

  it('register envoie un POST vers /auth/register', () => {
    const dto = { email: 'new@test.fr', password: 'pass', firstName: 'A', lastName: 'B' };
    service.register(dto as any).subscribe();
    const req = http.expectOne(r => r.url.includes('/auth/register'));
    expect(req.request.method).toBe('POST');
    req.flush(mockAuthResult);
  });

  // ── logout ─────────────────────────────────────────────────────────────────

  it('logout vide le localStorage', () => {
    localStorage.setItem('access_token', 'token');
    service.login({ email: 'jean@test.fr', password: 'pass', rememberMe: false }).subscribe();
    http.expectOne(r => r.url.includes('/auth/login')).flush(mockAuthResult);

    service.logout();
    http.expectOne(r => r.url.includes('/auth/logout')).flush({});

    expect(localStorage.getItem('access_token')).toBeNull();
  });

  it('logout remet isLoggedIn à false', () => {
    service.login({ email: 'jean@test.fr', password: 'pass', rememberMe: false }).subscribe();
    http.expectOne(r => r.url.includes('/auth/login')).flush(mockAuthResult);

    service.logout();
    http.expectOne(r => r.url.includes('/auth/logout')).flush({});

    expect(service.isLoggedIn()).toBe(false);
  });

  // ── isAdmin ────────────────────────────────────────────────────────────────

  it('isAdmin est true si le rôle est Admin', () => {
    const adminResult = { ...mockAuthResult, user: { ...mockAuthResult.user, role: 'Admin' } };
    service.login({ email: 'admin@test.fr', password: 'pass', rememberMe: false }).subscribe();
    http.expectOne(r => r.url.includes('/auth/login')).flush(adminResult);
    expect(service.isAdmin()).toBe(true);
  });

  // ── refreshToken ───────────────────────────────────────────────────────────

  it('refreshToken envoie un POST vers /auth/refresh', () => {
    localStorage.setItem('refresh_token', 'old-refresh');
    service.refreshToken().subscribe();
    const req = http.expectOne(r => r.url.includes('/auth/refresh'));
    expect(req.request.method).toBe('POST');
    req.flush(mockAuthResult);
  });
});
