import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-primary-100 flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <a routerLink="/" class="inline-flex items-center gap-3 mb-6">
            <div class="w-10 h-10 bg-navy rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H14V0H10V3H5C3.9 3 3 3.9 3 5V10H0V14H3V19C3 20.1 3.9 21 5 21H10V24H14V21H19C20.1 21 21 20.1 21 19V14H24V10H21V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z"/>
              </svg>
            </div>
            <div class="leading-none text-left">
              <span class="font-display font-semibold text-navy text-xl tracking-tight block">Althea</span>
              <span class="text-xs font-medium text-primary tracking-widest uppercase">Systems</span>
            </div>
          </a>
          <h1 class="text-2xl font-bold text-navy">Connexion</h1>
          <p class="text-gray-500 mt-1">Bienvenue ! Connectez-vous à votre espace.</p>
        </div>

        <div class="card p-8">
          @if (error()) {
            <div class="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex gap-2">
              <svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              {{ error() }}
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Adresse e-mail</label>
              <input formControlName="email" type="email" autocomplete="email"
                class="input-field" [class.input-error]="f['email'].invalid && f['email'].touched"
                placeholder="vous@exemple.com" />
              @if (f['email'].invalid && f['email'].touched) {
                <p class="text-red-500 text-xs mt-1">Email invalide</p>
              }
            </div>

            <div>
              <div class="flex justify-between mb-1.5">
                <label class="text-sm font-medium text-gray-700">Mot de passe</label>
                <a routerLink="/forgot-password" class="text-xs text-primary hover:underline">Mot de passe oublié ?</a>
              </div>
              <div class="relative">
                <input formControlName="password" [type]="showPwd() ? 'text' : 'password'" autocomplete="current-password"
                  class="input-field pr-10" [class.input-error]="f['password'].invalid && f['password'].touched" />
                <button type="button" (click)="showPwd.set(!showPwd())"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  @if (showPwd()) {
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                  } @else {
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  }
                </button>
              </div>
            </div>

            <label class="flex items-center gap-2 cursor-pointer">
              <input formControlName="rememberMe" type="checkbox" class="rounded text-primary" />
              <span class="text-sm text-gray-700">Se souvenir de moi</span>
            </label>

            <button type="submit" [disabled]="loading()" class="btn-primary w-full justify-center py-3 text-base">
              @if (loading()) {
                <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Connexion...
              } @else {
                Se connecter
              }
            </button>
          </form>

          <p class="text-center text-sm text-gray-600 mt-6">
            Pas encore de compte ?
            <a routerLink="/register" class="text-primary font-semibold hover:underline ml-1">S'inscrire</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  showPwd = signal(false);
  loading = signal(false);
  error = signal('');

  form = this.fb.group({
    email:      ['', [Validators.required, Validators.email]],
    password:   ['', Validators.required],
    rememberMe: [false],
  });

  get f() { return this.form.controls; }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');
    const { email, password, rememberMe } = this.form.value;
    this.auth.login({ email: email!, password: password!, rememberMe: rememberMe ?? false }).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.error || 'Email ou mot de passe incorrect.');
      }
    });
  }
}
