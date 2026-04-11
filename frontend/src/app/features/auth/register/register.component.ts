import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';

const passwordStrengthValidator = (ctrl: AbstractControl) => {
  const v = ctrl.value as string;
  if (!v) return null;
  const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(v);
  return strong ? null : { weakPassword: true };
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe],
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
          <h1 class="text-2xl font-display font-semibold text-navy">{{ 'auth.register_title' | translate }}</h1>
          <p class="text-gray-500 mt-1">{{ 'auth.register_subtitle' | translate }}</p>
        </div>

        <div class="card p-8">
          @if (error()) {
            <div class="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{{ error() }}</div>
          }
          @if (success()) {
            <div class="mb-5 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
              <p class="font-semibold mb-1">✓ {{ 'auth.register_success_title' | translate }}</p>
              <p>{{ 'auth.register_success_msg' | translate }} <strong>{{ registeredEmail }}</strong>. {{ 'auth.register_success_activate' | translate }}</p>
            </div>
          }

          @if (!success()) {
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ 'auth.first_name' | translate }}</label>
                  <input formControlName="firstName" type="text" autocomplete="given-name"
                    class="input-field" [class.input-error]="f['firstName'].invalid && f['firstName'].touched" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ 'auth.last_name' | translate }}</label>
                  <input formControlName="lastName" type="text" autocomplete="family-name"
                    class="input-field" [class.input-error]="f['lastName'].invalid && f['lastName'].touched" />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ 'auth.email' | translate }}</label>
                <input formControlName="email" type="email" autocomplete="email"
                  class="input-field" [class.input-error]="f['email'].invalid && f['email'].touched"
                  [placeholder]="'auth.email_placeholder' | translate" />
                @if (f['email'].errors?.['email'] && f['email'].touched) {
                  <p class="text-red-500 text-xs mt-1">{{ 'auth.invalid_email' | translate }}</p>
                }
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ 'auth.password' | translate }}</label>
                <input formControlName="password" type="password" autocomplete="new-password"
                  class="input-field" [class.input-error]="f['password'].invalid && f['password'].touched" />
                <!-- Strength indicator -->
                @if (f['password'].value) {
                  <div class="mt-2 space-y-1">
                    <div class="flex gap-1">
                      @for (s of [1,2,3,4]; track s) {
                        <div class="flex-1 h-1 rounded-full transition-colors"
                          [class.bg-red-400]="strength() <= 1 && s <= strength()"
                          [class.bg-amber-400]="strength() === 2 && s <= strength()"
                          [class.bg-green-400]="strength() >= 3 && s <= strength()"
                          [class.bg-gray-200]="s > strength()"></div>
                      }
                    </div>
                    <p class="text-xs text-gray-500">{{ 'auth.password_hint' | translate }}</p>
                  </div>
                }
                @if (f['password'].errors?.['weakPassword'] && f['password'].touched) {
                  <p class="text-red-500 text-xs mt-1">{{ 'auth.weak_password' | translate }}</p>
                }
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ 'auth.confirm_password' | translate }}</label>
                <input formControlName="confirmPassword" type="password"
                  class="input-field" [class.input-error]="form.errors?.['mismatch'] && f['confirmPassword'].touched" />
                @if (form.errors?.['mismatch'] && f['confirmPassword'].touched) {
                  <p class="text-red-500 text-xs mt-1">{{ 'auth.password_mismatch' | translate }}</p>
                }
              </div>

              <button type="submit" [disabled]="loading()" class="btn-primary w-full justify-center py-3 text-base">
                @if (loading()) {
                  <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  {{ 'auth.register_loading' | translate }}
                } @else { {{ 'auth.register_cta' | translate }} }
              </button>
            </form>
          }

          <p class="text-center text-sm text-gray-600 mt-6">
            {{ 'auth.has_account' | translate }}
            <a routerLink="/login" class="text-primary font-semibold hover:underline ml-1">{{ 'auth.login_cta' | translate }}</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal('');
  success = signal(false);
  registeredEmail = '';

  form = this.fb.group({
    firstName:       ['', Validators.required],
    lastName:        ['', Validators.required],
    email:           ['', [Validators.required, Validators.email]],
    password:        ['', [Validators.required, passwordStrengthValidator]],
    confirmPassword: ['', Validators.required],
  }, { validators: ctrl => ctrl.get('password')?.value !== ctrl.get('confirmPassword')?.value ? { mismatch: true } : null });

  get f() { return this.form.controls; }

  get strength(): () => number {
    return () => {
      const v = this.f['password'].value || '';
      let s = 0;
      if (v.length >= 8) s++;
      if (/[A-Z]/.test(v)) s++;
      if (/\d/.test(v)) s++;
      if (/[\W_]/.test(v)) s++;
      return s;
    };
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');
    const { firstName, lastName, email, password } = this.form.value;
    this.registeredEmail = email!;
    this.auth.register({ firstName: firstName!, lastName: lastName!, email: email!, password: password! }).subscribe({
      next: () => { this.success.set(true); this.loading.set(false); },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.error || 'Une erreur est survenue. Veuillez réessayer.');
      }
    });
  }
}
