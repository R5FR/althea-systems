import { Component, signal, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../../core/services/auth.service';

const SVG = (d: string) => `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="${d}"/></svg>`;

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="min-h-screen bg-gray-100 flex">
      <!-- Sidebar -->
      <aside [class]="sidebarOpen() ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
        class="fixed lg:static inset-y-0 left-0 z-40 w-64 bg-navy text-white flex flex-col transition-transform duration-300">

        <!-- Logo -->
        <div class="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H14V0H10V3H5C3.9 3 3 3.9 3 5V10H0V14H3V19C3 20.1 3.9 21 5 21H10V24H14V21H19C20.1 21 21 20.1 21 19V14H24V10H21V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z"/>
              </svg>
            </div>
            <div>
              <p class="font-display font-semibold text-white text-sm tracking-tight">Althea Systems</p>
              <p class="text-xs text-white/40 tracking-widest uppercase">Admin</p>
            </div>
          </div>
          <button (click)="sidebarOpen.set(false)" class="lg:hidden text-white/40 hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Nav -->
        <nav class="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          @for (group of navGroups; track group.title) {
            <p class="text-[10px] font-semibold text-white/30 uppercase tracking-widest px-3 pt-5 pb-1.5">{{ group.title }}</p>
            @for (link of group.links; track link.path) {
              <a [routerLink]="link.path" routerLinkActive="bg-primary/20 text-white"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/50 hover:bg-white/5 hover:text-white transition-colors">
                <span class="flex-shrink-0 text-white/40" [innerHTML]="link.icon"></span>
                {{ link.label }}
              </a>
            }
          }
        </nav>

        <!-- User -->
        <div class="border-t border-white/10 p-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-white text-xs font-bold">{{ initials() }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-white truncate">{{ user()?.firstName }} {{ user()?.lastName }}</p>
              <p class="text-xs text-white/40 truncate">Administrateur</p>
            </div>
            <button (click)="logout()" title="Déconnexion" class="text-white/30 hover:text-white transition-colors flex-shrink-0">
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
          <a routerLink="/" target="_blank" class="text-sm text-gray-500 hover:text-primary flex items-center gap-1.5 transition-colors">
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
  private auth      = inject(AuthService);
  private sanitizer = inject(DomSanitizer);

  sidebarOpen = signal(false);
  user        = this.auth.user;
  initials    = () => {
    const u = this.user();
    return u ? `${u.firstName[0]}${u.lastName[0]}`.toUpperCase() : 'A';
  };

  @HostListener('document:keydown.escape')
  onEsc() { this.sidebarOpen.set(false); }

  logout() { this.auth.logout(); }

  private s = (d: string): SafeHtml =>
    this.sanitizer.bypassSecurityTrustHtml(SVG(d));

  navGroups = [
    {
      title: 'Tableau de bord',
      links: [
        { path: '/admin/dashboard', label: 'Dashboard',
          icon: this.s('M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6') },
      ]
    },
    {
      title: 'Catalogue',
      links: [
        { path: '/admin/produits', label: 'Produits',
          icon: this.s('M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4') },
        { path: '/admin/categories', label: 'Catégories',
          icon: this.s('M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10') },
      ]
    },
    {
      title: 'Commerce',
      links: [
        { path: '/admin/commandes', label: 'Commandes',
          icon: this.s('M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2') },
        { path: '/admin/utilisateurs', label: 'Utilisateurs',
          icon: this.s('M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z') },
        { path: '/admin/messages', label: 'Messages',
          icon: this.s('M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z') },
      ]
    },
    {
      title: 'Configuration',
      links: [
        { path: '/admin/homepage', label: "Page d'accueil",
          icon: this.s('M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z') },
      ]
    }
  ];
}
