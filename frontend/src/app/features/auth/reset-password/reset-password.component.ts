import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
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
          <h1 class="text-2xl font-display font-semibold text-navy">{{ 'auth.reset_title' | translate }}</h1>
        </div>
        <div class="card p-8">
          @if (done()) {
            <div class="text-center">
              <p class="font-semibold text-green-600 mb-4">✓ {{ 'auth.reset_success' | translate }}</p>
              <a routerLink="/login" class="btn-primary inline-flex">{{ 'auth.confirm_email_cta' | translate }}</a>
            </div>
          } @else {
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ 'auth.new_password' | translate }}</label>
                <input formControlName="password" type="password" class="input-field" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ 'auth.reset_confirm' | translate }}</label>
                <input formControlName="confirm" type="password" class="input-field" />
              </div>
              @if (error()) { <p class="text-red-500 text-sm">{{ error() | translate }}</p> }
              <button type="submit" [disabled]="loading()" class="btn-primary w-full justify-center py-3">
                @if (loading()) { <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> }
                {{ 'auth.reset_submit' | translate }}
              </button>
            </form>
          }
        </div>
      </div>
    </div>
  `,
})
export class ResetPasswordComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  loading = signal(false);
  done = signal(false);
  error = signal('');
  form = this.fb.group({ password: ['', [Validators.required, Validators.minLength(8)]], confirm: ['', Validators.required] });

  onSubmit() {
    if (this.form.value.password !== this.form.value.confirm) { this.error.set('auth.password_mismatch'); return; }
    const token = this.route.snapshot.queryParams['token'];
    this.loading.set(true);
    this.auth.resetPassword(token, this.form.value.password!).subscribe({
      next: () => { this.done.set(true); this.loading.set(false); },
      error: () => { this.error.set('auth.reset_error_expired'); this.loading.set(false); }
    });
  }
}
