import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, TranslatePipe],
  template: `
    <div class="page-container py-8">
      <div class="flex flex-col md:flex-row gap-8">
        <!-- Sidebar -->
        <aside class="md:w-56 flex-shrink-0">
          <div class="card overflow-hidden">
            <!-- User info -->
            <div class="bg-gradient-to-br from-primary to-primary-700 p-5">
              <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                <span class="text-white font-bold text-lg">{{ initials() }}</span>
              </div>
              <p class="font-semibold text-white">{{ user()?.firstName }} {{ user()?.lastName }}</p>
              <p class="text-primary-100 text-xs truncate">{{ user()?.email }}</p>
            </div>
            <nav class="p-2">
              @for (link of navLinks; track link.path) {
                <a [routerLink]="link.path" routerLinkActive="bg-primary-50 text-primary font-semibold"
                  class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                  <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    @switch (link.icon) {
                      @case ('user') {
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      }
                      @case ('map-pin') {
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      }
                      @case ('credit-card') {
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                      }
                      @case ('package') {
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                      }
                    }
                  </svg>
                  {{ link.labelKey | translate }}
                </a>
              }
            </nav>
          </div>
        </aside>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
})
export class AccountComponent {
  private auth = inject(AuthService);
  user = this.auth.user;
  initials = () => {
    const u = this.user();
    return u ? `${u.firstName[0]}${u.lastName[0]}`.toUpperCase() : '?';
  };

  navLinks = [
    { path: '/mon-compte/profil',    icon: 'user',        labelKey: 'account.nav_profile' },
    { path: '/mon-compte/adresses',  icon: 'map-pin',     labelKey: 'account.nav_addresses' },
    { path: '/mon-compte/paiements', icon: 'credit-card', labelKey: 'account.nav_payments' },
    { path: '/mon-compte/commandes', icon: 'package',     labelKey: 'account.nav_orders' },
  ];
}
