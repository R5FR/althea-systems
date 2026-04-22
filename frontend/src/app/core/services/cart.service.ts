import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { pairwise, tap } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';
import { Cart, CartItem } from '../models';
import { AuthService } from './auth.service';
import { v4 as uuid } from 'uuid';

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private readonly base = `${environment.apiUrl}/cart`;

  private _cart = signal<Cart | null>(null);
  readonly cart = this._cart.asReadonly();
  readonly itemCount = computed(() => this._cart()?.items.reduce((s, i) => s + i.quantity, 0) ?? 0);
  readonly totalTtc = computed(() => this._cart()?.totalTtc ?? 0);
  readonly hasUnavailableItems = computed(() => this._cart()?.items.some(i => !i.isAvailable) ?? false);

  constructor() {
    toObservable(this.auth.isLoggedIn).pipe(pairwise()).subscribe(([prev, curr]) => {
      if (prev && !curr) {
        // Logout: purge guest cart_id so the next user starts with a fresh cart
        localStorage.removeItem('cart_id');
        this._cart.set(null);
      } else if (!prev && curr) {
        // Login: fetch the account-linked cart and pin its server-side ID locally
        this.loadForUser().subscribe();
      }
    });
  }

  get cartId(): string {
    let id = localStorage.getItem('cart_id');
    if (!id) { id = uuid(); localStorage.setItem('cart_id', id); }
    return id;
  }

  load() {
    return this.http.get<Cart>(`${this.base}/${this.cartId}`).pipe(
      tap(c => this._cart.set(c))
    );
  }

  /** Fetch the server-side cart for the authenticated user and pin its ID locally. */
  loadForUser() {
    return this.http.get<Cart>(`${this.base}/me`).pipe(
      tap(c => {
        localStorage.setItem('cart_id', c.id);
        this._cart.set(c);
      })
    );
  }

  addItem(productId: string, quantity = 1) {
    return this.http.post(`${this.base}/${this.cartId}/items`, { productId, quantity }).pipe(
      tap(() => this.load().subscribe())
    );
  }

  updateItem(itemId: string, quantity: number) {
    return this.http.patch(`${this.base}/items/${itemId}`, { quantity }).pipe(
      tap(() => this.load().subscribe())
    );
  }

  removeItem(itemId: string) {
    return this.http.delete(`${this.base}/items/${itemId}`).pipe(
      tap(() => this.load().subscribe())
    );
  }

  clear() {
    return this.http.delete(`${this.base}/${this.cartId}`).pipe(
      tap(() => this._cart.set(null))
    );
  }

  /** Merge guest cart into user cart after login */
  mergeCart(userId: string) {
    return this.http.post(`${this.base}/merge`, { guestCartId: this.cartId, userId }).pipe(
      tap((c: any) => this._cart.set(c))
    );
  }
}
