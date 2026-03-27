import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { Cart } from '../../core/models';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container py-8 max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold text-navy mb-6 flex items-center gap-3">
        <svg class="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
        </svg>
        Mon panier
        @if (cart()?.items?.length) {
          <span class="text-sm font-normal text-gray-500">({{ cart()!.items.length }} article{{ cart()!.items.length > 1 ? 's' : '' }})</span>
        }
      </h1>

      @if (loading()) {
        <div class="space-y-3">
          @for (_ of [1,2,3]; track $index) {
            <div class="card p-4 flex gap-4 animate-pulse">
              <div class="skeleton w-20 h-20 rounded-lg flex-shrink-0"></div>
              <div class="flex-1 space-y-2 pt-1">
                <div class="skeleton h-4 w-2/3"></div>
                <div class="skeleton h-4 w-1/3"></div>
              </div>
            </div>
          }
        </div>
      } @else if (!cart() || cart()!.items.length === 0) {
        <div class="text-center py-20">
          <svg class="w-24 h-24 mx-auto mb-6 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
          </svg>
          <h2 class="text-xl font-semibold text-gray-700 mb-2">Votre panier est vide</h2>
          <p class="text-gray-500 mb-8">Parcourez notre catalogue pour trouver le matériel adapté à vos besoins</p>
          <a routerLink="/recherche" class="btn-primary text-base px-8 py-3">Explorer le catalogue</a>
        </div>
      } @else {
        <div class="grid lg:grid-cols-3 gap-8">
          <!-- Items list -->
          <div class="lg:col-span-2 space-y-3">
            @for (item of cart()!.items; track item.id) {
              <div class="card p-4 flex gap-4" [class.opacity-60]="!item.isAvailable">
                <img [src]="item.imageUrl || 'assets/img/placeholder.jpg'" [alt]="item.productName"
                  class="w-20 h-20 object-contain rounded-lg bg-gray-50 p-2 flex-shrink-0" />
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <h3 class="font-semibold text-gray-900 text-sm line-clamp-2">{{ item.productName }}</h3>
                      @if (!item.isAvailable) {
                        <span class="badge-danger badge text-xs mt-1">Indisponible</span>
                      }
                    </div>
                    <button (click)="removeItem(item.id)" class="text-gray-400 hover:text-red-500 flex-shrink-0 p-1 -mt-1 transition-colors">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                  <div class="flex items-center justify-between mt-3">
                    <!-- Qty controls -->
                    <div class="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button (click)="updateQty(item.id, item.quantity - 1)"
                        [disabled]="item.quantity <= 1"
                        class="px-3 py-1.5 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors text-sm">−</button>
                      <span class="px-3 text-sm font-semibold">{{ item.quantity }}</span>
                      <button (click)="updateQty(item.id, item.quantity + 1)"
                        [disabled]="item.quantity >= item.stockQuantity"
                        class="px-3 py-1.5 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors text-sm">+</button>
                    </div>
                    <!-- Price -->
                    <div class="text-right">
                      <p class="font-bold text-navy">{{ item.total | number:'1.2-2' }} €</p>
                      <p class="text-gray-400 text-xs">{{ item.unitPriceTtc | number:'1.2-2' }} € / unité TTC</p>
                    </div>
                  </div>
                </div>
              </div>
            }

            <!-- Not logged in reminder -->
            @if (!isLoggedIn()) {
              <div class="card p-4 bg-amber-50 border border-amber-200 flex gap-3">
                <svg class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div class="text-sm">
                  <p class="font-medium text-amber-800">Connectez-vous pour sauvegarder votre panier</p>
                  <p class="text-amber-700 mt-0.5">
                    <a routerLink="/login" class="underline font-medium">Se connecter</a>
                    &nbsp;ou&nbsp;
                    <a routerLink="/register" class="underline font-medium">Créer un compte</a>
                  </p>
                </div>
              </div>
            }
          </div>

          <!-- Order summary -->
          <div class="lg:col-span-1">
            <div class="card p-5 sticky top-24">
              <h2 class="font-bold text-navy text-lg mb-4">Récapitulatif</h2>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between text-gray-600">
                  <span>Sous-total HT</span>
                  <span>{{ cart()!.subtotalHt | number:'1.2-2' }} €</span>
                </div>
                <div class="flex justify-between text-gray-600">
                  <span>TVA</span>
                  <span>{{ cart()!.totalTva | number:'1.2-2' }} €</span>
                </div>
                <div class="border-t pt-3 mt-3 flex justify-between font-bold text-navy text-base">
                  <span>Total TTC</span>
                  <span class="text-primary text-lg">{{ cart()!.totalTtc | number:'1.2-2' }} €</span>
                </div>
              </div>

              @if (hasUnavailable()) {
                <div class="mt-4 p-3 bg-red-50 rounded-lg text-sm text-red-600 border border-red-100 flex items-center gap-2">
                  <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                  Certains articles sont indisponibles. Retirez-les pour continuer.
                </div>
              }

              <div class="mt-5 space-y-3">
                <a routerLink="/checkout"
                  [class.pointer-events-none]="hasUnavailable() || !cart()!.items.length"
                  [class.opacity-50]="hasUnavailable() || !cart()!.items.length"
                  class="btn-primary w-full justify-center text-base py-3">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                  </svg>
                  Passer à la caisse
                </a>
                <a routerLink="/recherche" class="btn-ghost w-full justify-center text-sm">Continuer mes achats</a>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class CartComponent implements OnInit {
  private cartSvc = inject(CartService);
  private auth = inject(AuthService);

  cart = this.cartSvc.cart;
  hasUnavailable = this.cartSvc.hasUnavailableItems;
  isLoggedIn = this.auth.isLoggedIn;
  loading = signal(true);

  ngOnInit() {
    this.cartSvc.load().subscribe({ next: () => this.loading.set(false), error: () => this.loading.set(false) });
  }

  updateQty(itemId: string, qty: number) {
    if (qty <= 0) { this.removeItem(itemId); return; }
    this.cartSvc.updateItem(itemId, qty).subscribe({ error: () => {} });
  }

  removeItem(itemId: string) {
    this.cartSvc.removeItem(itemId).subscribe({ error: () => {} });
  }
}
