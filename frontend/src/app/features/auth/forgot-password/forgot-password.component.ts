import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe],
  template: `
    <div class="min-h-screen bg-primary-100 flex items-center justify-center px-4">
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
          <h1 class="text-2xl font-display font-semibold text-navy">{{ 'auth.forgot_title' | translate }}</h1>
          <p class="text-gray-500 mt-1">{{ 'auth.forgot_subtitle' | translate }}</p>
        </div>
        <div class="card p-8">
          @if (sent()) {
            <div class="text-center">
              <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              </div>
              <p class="font-semibold text-gray-900 mb-1">{{ 'auth.forgot_sent_title' | translate }}</p>
              <p class="text-sm text-gray-500">{{ 'auth.forgot_sent_msg' | translate }}</p>
              <a routerLink="/login" class="btn-ghost mt-6 inline-flex">{{ 'auth.forgot_back' | translate }}</a>
            </div>
          } @else {
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ 'auth.email' | translate }}</label>
                <input formControlName="email" type="email" class="input-field" [placeholder]="'auth.email_placeholder' | translate" />
              </div>
              <button type="submit" [disabled]="loading()" class="btn-primary w-full justify-center py-3">
                @if (loading()) { <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> }
                {{ 'auth.forgot_send' | translate }}
              </button>
            </form>
            <a routerLink="/login" class="block text-center text-sm text-primary hover:underline mt-5">{{ 'auth.forgot_back_short' | translate }}</a>
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
