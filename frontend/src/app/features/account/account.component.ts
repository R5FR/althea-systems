import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
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
                  <span class="text-base">{{ link.icon }}</span>
                  {{ link.label }}
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
    { path: '/mon-compte/profil',    icon: '👤', label: 'Profil' },
    { path: '/mon-compte/adresses',  icon: '📍', label: 'Adresses' },
    { path: '/mon-compte/paiements', icon: '💳', label: 'Paiements' },
    { path: '/mon-compte/commandes', icon: '📦', label: 'Mes commandes' },
  ];
}
