import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div class="card p-10 max-w-md w-full text-center">
        @if (loading()) {
          <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-gray-500">Vérification en cours...</p>
        } @else if (success()) {
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          </div>
          <h1 class="text-xl font-bold text-gray-900 mb-2">Compte confirmé !</h1>
          <p class="text-gray-500 mb-6">Votre email a été vérifié. Vous pouvez maintenant vous connecter.</p>
          <a routerLink="/login" class="btn-primary inline-flex">Se connecter</a>
        } @else {
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </div>
          <h1 class="text-xl font-bold text-gray-900 mb-2">Lien invalide</h1>
          <p class="text-gray-500 mb-6">Ce lien est invalide ou a expiré.</p>
          <a routerLink="/register" class="btn-secondary inline-flex">Recréer un compte</a>
        }
      </div>
    </div>
  `,
})
export class ConfirmEmailComponent implements OnInit {
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  loading = signal(true);
  success = signal(false);

  ngOnInit() {
    const token = this.route.snapshot.queryParams['token'];
    if (!token) { this.loading.set(false); return; }
    this.auth.confirmEmail(token).subscribe({
      next: () => { this.success.set(true); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
