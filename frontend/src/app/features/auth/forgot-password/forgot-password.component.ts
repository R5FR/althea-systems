import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <a routerLink="/" class="inline-flex items-center gap-2 mb-6">
            <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center"><span class="text-white font-bold">A</span></div>
            <span class="text-xl font-bold text-gray-900">Althea Systems</span>
          </a>
          <h1 class="text-2xl font-bold text-gray-900">Mot de passe oublié</h1>
          <p class="text-gray-500 mt-1">Entrez votre email pour recevoir un lien de réinitialisation.</p>
        </div>
        <div class="card p-8">
          @if (sent()) {
            <div class="text-center">
              <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              </div>
              <p class="font-semibold text-gray-900 mb-1">Email envoyé !</p>
              <p class="text-sm text-gray-500">Vérifiez votre boîte mail. Le lien est valide 24h.</p>
              <a routerLink="/login" class="btn-ghost mt-6 inline-flex">← Retour à la connexion</a>
            </div>
          } @else {
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Adresse e-mail</label>
                <input formControlName="email" type="email" class="input-field" placeholder="vous@exemple.com" />
              </div>
              <button type="submit" [disabled]="loading()" class="btn-primary w-full justify-center py-3">
                @if (loading()) { <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> }
                Envoyer le lien
              </button>
            </form>
            <a routerLink="/login" class="block text-center text-sm text-primary hover:underline mt-5">← Retour</a>
          }
        </div>
      </div>
    </div>
  `,
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  loading = signal(false);
  sent = signal(false);
  form = this.fb.group({ email: ['', [Validators.required, Validators.email]] });

  onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.auth.forgotPassword(this.form.value.email!).subscribe({
      next: () => { this.sent.set(true); this.loading.set(false); },
      error: () => { this.sent.set(true); this.loading.set(false); } // Always show success for security
    });
  }
}
