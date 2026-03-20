import { Component, signal, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="min-h-screen bg-gray-100 flex">
      <!-- Sidebar -->
      <aside [class]="sidebarOpen() ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
        class="fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white flex flex-col transition-transform duration-300">
        <!-- Logo -->
        <div class="px-6 py-5 border-b border-gray-800 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">A</span>
            </div>
            <div>
              <p class="font-bold text-white text-sm">Althea Systems</p>
              <p class="text-xs text-gray-400">Administration</p>
            </div>
          </div>
          <button (click)="sidebarOpen.set(false)" class="lg:hidden text-gray-400 hover:text-white">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Nav -->
        <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          @for (group of navGroups; track group.title) {
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-widest px-3 pt-4 pb-1">{{ group.title }}</p>
            @for (link of group.links; track link.path) {
              <a [routerLink]="link.path" routerLinkActive="bg-primary text-white"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
                <span class="text-base">{{ link.icon }}</span>
                {{ link.label }}
              </a>
            }
          }
        </nav>

        <!-- User -->
        <div class="border-t border-gray-800 p-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-primary-700 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-white text-xs font-bold">{{ initials() }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-white truncate">{{ user()?.firstName }} {{ user()?.lastName }}</p>
              <p class="text-xs text-gray-400 truncate">Administrateur</p>
            </div>
            <button (click)="logout()" title="Déconnexion" class="text-gray-400 hover:text-white transition-colors flex-shrink-0">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <!-- Overlay mobile -->
      @if (sidebarOpen()) {
        <div class="fixed inset-0 bg-black/50 z-30 lg:hidden" (click)="sidebarOpen.set(false)"></div>
      }

      <!-- Main -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- Topbar -->
        <header class="bg-white border-b border-gray-200 px-4 sm:px-6 h-16 flex items-center gap-4 sticky top-0 z-20">
          <button (click)="sidebarOpen.set(true)" class="lg:hidden text-gray-500 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <div class="flex-1"></div>
          <a routerLink="/" target="_blank" class="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1.5 transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
            Voir le site
          </a>
        </header>

        <!-- Content -->
        <main class="flex-1 p-4 sm:p-6 lg:p-8">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class AdminLayoutComponent {
  private auth = inject(AuthService);
  sidebarOpen = signal(false);
  user = this.auth.user;
  initials = () => {
    const u = this.user();
    return u ? `${u.firstName[0]}${u.lastName[0]}`.toUpperCase() : 'A';
  };

  @HostListener('document:keydown.escape')
  onEsc() { this.sidebarOpen.set(false); }

  logout() { this.auth.logout(); }

  navGroups = [
    {
      title: 'Tableau de bord',
      links: [
        { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
      ]
    },
    {
      title: 'Catalogue',
      links: [
        { path: '/admin/produits', icon: '📦', label: 'Produits' },
        { path: '/admin/categories', icon: '🗂️', label: 'Catégories' },
      ]
    },
    {
      title: 'Commerce',
      links: [
        { path: '/admin/commandes', icon: '🛒', label: 'Commandes' },
        { path: '/admin/utilisateurs', icon: '👥', label: 'Utilisateurs' },
        { path: '/admin/messages', icon: '✉️', label: 'Messages' },
      ]
    },
    {
      title: 'Configuration',
      links: [
        { path: '/admin/homepage', icon: '🏠', label: 'Page d\'accueil' },
      ]
    }
  ];
}
