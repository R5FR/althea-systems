import { Component, OnInit, signal, inject, HostListener, ElementRef } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule, TranslatePipe],
  template: `
    <!-- Top utility bar -->
    <div class="bg-navy text-white hidden md:block">
      <div class="page-container">
        <div class="flex items-center justify-between h-9 text-xs">
          <div class="flex items-center gap-5 text-white/60">
            <span class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              +33 1 23 45 67 89
            </span>
            <span class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              contact&#64;althea-systems.fr
            </span>
          </div>
          <div class="flex items-center gap-3 text-white/60">
            <span>Livraison EU sous 48h–72h</span>
            <span class="text-white/20">|</span>

            <!-- Language dropdown -->
            <div class="relative">
              <button (click)="langOpen.set(!langOpen())"
                class="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10 transition-colors text-white/70 hover:text-white">
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/>
                </svg>
                <span class="font-medium">{{ currentLangLabel }}</span>
                <svg class="w-2.5 h-2.5 transition-transform" [class.rotate-180]="langOpen()" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              @if (langOpen()) {
                <div class="absolute right-0 top-full mt-1 w-36 rounded-lg shadow-xl border border-gray-200 py-1 z-[200]" style="background:#fff">
                  @for (lang of langs; track lang.code) {
                    <button (click)="setLang(lang.code); langOpen.set(false)"
                      class="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors"
                      [class.font-semibold]="currentLang === lang.code"
                      [style.color]="currentLang === lang.code ? '#003D5C' : '#4b5563'">
                      <span class="text-base leading-none">{{ lang.flag }}</span>
                      <span>{{ lang.label }}</span>
                      @if (currentLang === lang.code) {
                        <svg class="w-3 h-3 ml-auto" fill="none" viewBox="0 0 24 24" stroke="#0094A0">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                        </svg>
                      }
                    </button>
                  }
                </div>
              }
            </div>

            @if (!isLoggedIn()) {
              <span class="text-white/20">|</span>
              <a routerLink="/login" class="text-white/70 hover:text-white transition-colors">{{ 'nav.login' | translate }}</a>
              <a routerLink="/register" class="text-white/70 hover:text-white transition-colors">{{ 'nav.register' | translate }}</a>
            }
          </div>
        </div>
      </div>
    </div>

    <!-- Main nav bar -->
    <header class="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-nav">
      <div class="page-container">
        <div class="flex items-center gap-6 h-[68px]">

          <!-- Logo -->
          <a routerLink="/" class="flex items-center gap-3 flex-shrink-0 group">
            <div class="w-9 h-9 bg-navy rounded-lg flex items-center justify-center flex-shrink-0 transition-all group-hover:bg-primary">
              <!-- Medical cross SVG -->
              <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H14V0H10V3H5C3.9 3 3 3.9 3 5V10H0V14H3V19C3 20.1 3.9 21 5 21H10V24H14V21H19C20.1 21 21 20.1 21 19V14H24V10H21V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z"/>
              </svg>
            </div>
            <div class="leading-none hidden sm:block">
              <span class="font-display font-semibold text-navy text-xl tracking-tight block">Althea</span>
              <span class="text-xs font-medium text-primary tracking-widest uppercase">Systems</span>
            </div>
          </a>

          <!-- Nav links (desktop) -->
          <nav class="hidden lg:flex items-center gap-1 flex-1">
            <a routerLink="/" routerLinkActive="text-primary" [routerLinkActiveOptions]="{exact:true}"
              class="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
              {{ 'nav.home' | translate }}
            </a>
            <a routerLink="/recherche" routerLinkActive="text-primary"
              class="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
              {{ 'nav.catalog' | translate }}
            </a>
            <a routerLink="/contact" routerLinkActive="text-primary"
              class="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
              {{ 'nav.contact' | translate }}
            </a>
          </nav>

          <!-- Search bar -->
          <div class="flex-1 max-w-md hidden md:block">
            <form (ngSubmit)="search()" class="relative">
              <input
                [(ngModel)]="searchTerm" name="q"
                type="search"
                [placeholder]="searchPlaceholder()"
                class="w-full input-field pl-10 pr-4 h-10 text-sm bg-gray-50 border-gray-200"
              />
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </form>
          </div>

          <div class="flex items-center gap-1 ml-auto">

            <!-- Account dropdown (navbar) -->
            @if (isLoggedIn()) {
              <div class="relative hidden lg:block">
                <button (click)="accountOpen.set(!accountOpen())"
                  class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  {{ 'nav.account' | translate }}
                  <svg class="w-3 h-3 transition-transform" [class.rotate-180]="accountOpen()" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
                @if (accountOpen()) {
                  <div class="absolute right-0 top-full mt-1.5 w-48 rounded-xl shadow-xl border border-gray-100 py-1.5 z-[200]" style="background:#fff">
                    <a routerLink="/mon-compte/profil" (click)="accountOpen.set(false)"
                      class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                      {{ 'nav.profile' | translate }}
                    </a>
                    <a routerLink="/mon-compte/commandes" (click)="accountOpen.set(false)"
                      class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                      </svg>
                      {{ 'nav.orders' | translate }}
                    </a>
                    @if (isAdmin()) {
                      <div class="border-t border-gray-100 my-1"></div>
                      <a routerLink="/admin" (click)="accountOpen.set(false)"
                        class="flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-primary/5 transition-colors" style="color:#0094A0">
                        <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        {{ 'nav.admin' | translate }}
                      </a>
                    }
                    <div class="border-t border-gray-100 my-1"></div>
                    <button (click)="logout(); accountOpen.set(false)"
                      class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                      </svg>
                      {{ 'nav.logout' | translate }}
                    </button>
                  </div>
                }
              </div>
            }

            <!-- Cart -->
            <a routerLink="/panier" class="relative flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
              @if (cartCount() > 0) {
                <span class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                  {{ cartCount() }}
                </span>
              }
              <span class="hidden sm:inline text-sm font-medium">{{ 'nav.cart' | translate }}</span>
            </a>

            <!-- Burger menu -->
            <button (click)="menuOpen.set(!menuOpen())"
              class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors lg:hidden">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                  [attr.d]="menuOpen() ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile search -->
        <div class="pb-3 md:hidden">
          <form (ngSubmit)="search()" class="relative">
            <input [(ngModel)]="searchTerm" name="q" type="search"
              [placeholder]="searchPlaceholder()"
              class="w-full input-field pl-10 pr-4 py-2 text-sm bg-gray-50" />
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </form>
        </div>
      </div>
    </header>

    <!-- Sliding drawer -->
    @if (menuOpen()) {
      <div class="fixed inset-0 z-40 flex" (click)="menuOpen.set(false)">
        <div class="flex-1 bg-navy/50 backdrop-blur-sm"></div>
        <div class="w-[300px] bg-white h-full shadow-2xl flex flex-col animate-slide-in" (click)="$event.stopPropagation()">

          <!-- Drawer header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div class="flex items-center gap-2.5">
              <div class="w-7 h-7 bg-navy rounded-md flex items-center justify-center">
                <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H14V0H10V3H5C3.9 3 3 3.9 3 5V10H0V14H3V19C3 20.1 3.9 21 5 21H10V24H14V21H19C20.1 21 21 20.1 21 19V14H24V10H21V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z"/>
                </svg>
              </div>
              <span class="font-display font-semibold text-navy text-lg">Althea Systems</span>
            </div>
            <button (click)="menuOpen.set(false)" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <nav class="flex-1 overflow-y-auto py-3">
            <!-- Main links -->
            <div class="px-3 space-y-0.5">
              <p class="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Navigation</p>
              <a routerLink="/" (click)="menuOpen.set(false)"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium text-sm transition-colors">
                <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
                {{ 'nav.home' | translate }}
              </a>
              <a routerLink="/recherche" (click)="menuOpen.set(false)"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium text-sm transition-colors">
                <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
                {{ 'nav.catalog' | translate }}
              </a>
              <a routerLink="/contact" (click)="menuOpen.set(false)"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium text-sm transition-colors">
                <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                {{ 'nav.contact' | translate }}
              </a>
            </div>

            <div class="mx-3 my-3 border-t border-gray-100"></div>

            <!-- Account links -->
            <div class="px-3 space-y-0.5">
              <p class="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Compte</p>
              @if (isLoggedIn()) {
                <a routerLink="/mon-compte/profil" (click)="menuOpen.set(false)"
                  class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium text-sm transition-colors">
                  <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  {{ 'nav.profile' | translate }}
                </a>
                <a routerLink="/mon-compte/commandes" (click)="menuOpen.set(false)"
                  class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium text-sm transition-colors">
                  <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                  {{ 'nav.orders' | translate }}
                </a>
                @if (isAdmin()) {
                  <a routerLink="/admin" (click)="menuOpen.set(false)"
                    class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/5 hover:bg-primary/10 text-primary font-medium text-sm transition-colors">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    {{ 'nav.admin' | translate }}
                  </a>
                }
              } @else {
                <a routerLink="/login" (click)="menuOpen.set(false)"
                  class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium text-sm transition-colors">
                  <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                  </svg>
                  {{ 'nav.login' | translate }}
                </a>
                <a routerLink="/register" (click)="menuOpen.set(false)"
                  class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium text-sm transition-colors">
                  <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                  </svg>
                  {{ 'nav.register' | translate }}
                </a>
              }
            </div>

            <div class="mx-3 my-3 border-t border-gray-100"></div>

            <!-- Language -->
            <div class="px-6">
              <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2.5">Langue</p>
              <div class="flex gap-2">
                @for (lang of langs; track lang.code) {
                  <button (click)="setLang(lang.code)"
                    class="px-3 py-1.5 rounded-lg text-sm font-medium border transition-all"
                    [class.bg-navy]="currentLang === lang.code"
                    [class.text-white]="currentLang === lang.code"
                    [class.border-navy]="currentLang === lang.code"
                    [class.border-gray-200]="currentLang !== lang.code"
                    [class.text-gray-600]="currentLang !== lang.code">
                    {{ lang.label }}
                  </button>
                }
              </div>
            </div>
          </nav>

          @if (isLoggedIn()) {
            <div class="p-4 border-t border-gray-100">
              <button (click)="logout()"
                class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
                {{ 'nav.logout' | translate }}
              </button>
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class HeaderComponent implements OnInit {
  private auth      = inject(AuthService);
  private cart      = inject(CartService);
  private router    = inject(Router);
  private translate = inject(TranslateService);
  private elRef     = inject(ElementRef);

  menuOpen          = signal(false);
  langOpen          = signal(false);
  accountOpen       = signal(false);
  searchTerm        = '';
  currentLang       = 'fr';
  searchPlaceholder = signal('');
  langs = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English',  flag: '🇬🇧' },
    { code: 'ar', label: 'العربية',  flag: '🇸🇦' },
  ];

  get currentLangLabel() {
    return this.langs.find(l => l.code === this.currentLang)?.code.toUpperCase() ?? 'FR';
  }

  readonly isLoggedIn = this.auth.isLoggedIn;
  readonly isAdmin    = this.auth.isAdmin;
  readonly cartCount  = this.cart.itemCount;

  ngOnInit() {
    this.cart.load().subscribe({ error: () => {} });
    this.currentLang = this.translate.currentLang || 'fr';
    const updatePlaceholder = () =>
      this.translate.get('nav.search_placeholder').subscribe(t => this.searchPlaceholder.set(t));
    updatePlaceholder();
    this.translate.onLangChange.subscribe(() => updatePlaceholder());
  }

  search() {
    if (this.searchTerm.trim()) {
      this.router.navigate(['/recherche'], { queryParams: { q: this.searchTerm } });
      this.searchTerm = '';
    }
  }

  setLang(lang: string) {
    this.currentLang = lang;
    localStorage.setItem('lang', lang);
    this.translate.use(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr';
  }

  logout() { this.auth.logout(); this.menuOpen.set(false); }

  @HostListener('document:keydown.escape')
  onEsc() { this.menuOpen.set(false); this.langOpen.set(false); this.accountOpen.set(false); }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    if (!this.elRef.nativeElement.contains(e.target)) {
      this.langOpen.set(false);
      this.accountOpen.set(false);
    }
  }
}
