import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <a routerLink="/" class="inline-flex items-center gap-2 mb-6">
            <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span class="text-white font-bold">A</span>
            </div>
            <span class="text-xl font-bold text-gray-900">Althea Systems</span>
          </a>
          <h1 class="text-2xl font-bold text-gray-900">Créer un compte</h1>
          <p class="text-gray-500 mt-1">Rejoignez Althea Systems en quelques secondes</p>
        </div>

        <div class="card p-8">
          @if (error()) {
            <div class="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{{ error() }}</div>
          }
          @if (success()) {
            <div class="mb-5 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
              <p class="font-semibold mb-1">✓ Inscription réussie !</p>
              <p>Un email de confirmation a été envoyé à <strong>{{ registeredEmail }}</strong>. Cliquez sur le lien pour activer votre compte.</p>
            </div>
          }

          @if (!success()) {
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Prénom *</label>
                  <input formControlName="firstName" type="text" autocomplete="given-name"
                    class="input-field" [class.input-error]="f['firstName'].invalid && f['firstName'].touched" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Nom *</label>
                  <input formControlName="lastName" type="text" autocomplete="family-name"
                    class="input-field" [class.input-error]="f['lastName'].invalid && f['lastName'].touched" />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Adresse e-mail *</label>
                <input formControlName="email" type="email" autocomplete="email"
                  class="input-field" [class.input-error]="f['email'].invalid && f['email'].touched"
                  placeholder="vous@exemple.com" />
                @if (f['email'].errors?.['email'] && f['email'].touched) {
                  <p class="text-red-500 text-xs mt-1">Email invalide</p>
                }
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe *</label>
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
                    <p class="text-xs text-gray-500">Min. 8 car. — majuscule, minuscule, chiffre, symbole</p>
                  </div>
                }
                @if (f['password'].errors?.['weakPassword'] && f['password'].touched) {
                  <p class="text-red-500 text-xs mt-1">Mot de passe trop faible</p>
                }
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Confirmer le mot de passe *</label>
                <input formControlName="confirmPassword" type="password"
                  class="input-field" [class.input-error]="form.errors?.['mismatch'] && f['confirmPassword'].touched" />
                @if (form.errors?.['mismatch'] && f['confirmPassword'].touched) {
                  <p class="text-red-500 text-xs mt-1">Les mots de passe ne correspondent pas</p>
                }
              </div>

              <button type="submit" [disabled]="loading()" class="btn-primary w-full justify-center py-3 text-base">
                @if (loading()) {
                  <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Création...
                } @else { Créer mon compte }
              </button>
            </form>
          }

          <p class="text-center text-sm text-gray-600 mt-6">
            Déjà un compte ?
            <a routerLink="/login" class="text-primary font-semibold hover:underline ml-1">Se connecter</a>
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
