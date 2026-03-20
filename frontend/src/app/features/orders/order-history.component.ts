import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink as RL } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../core/models';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RL, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 class="text-xl font-bold text-navy">Mes commandes</h1>
        <!-- Search -->
        <input [(ngModel)]="search" (ngModelChange)="filterOrders()"
          type="search" placeholder="Rechercher une commande..." class="input-field max-w-xs text-sm" />
      </div>

      <!-- Year filter -->
      @if (years().length > 0) {
        <div class="flex gap-2 flex-wrap">
          <button (click)="selectedYear.set(null); filterOrders()"
            [class.bg-primary]="!selectedYear()" [class.text-white]="!selectedYear()"
            class="px-4 py-1.5 rounded-full text-sm border border-gray-200 transition-colors hover:bg-gray-100">
            Toutes
          </button>
          @for (y of years(); track y) {
            <button (click)="selectedYear.set(y); filterOrders()"
              [class.bg-primary]="selectedYear() === y" [class.text-white]="selectedYear() === y"
              class="px-4 py-1.5 rounded-full text-sm border border-gray-200 transition-colors hover:bg-gray-100">
              {{ y }}
            </button>
          }
        </div>
      }

      @if (loading()) {
        <div class="space-y-3">@for (_ of [1,2,3]; track $index) { <div class="card p-4 skeleton h-20"></div> }</div>
      } @else if (filtered().length === 0) {
        <div class="card p-10 text-center text-gray-500">
          <p>Aucune commande trouvée.</p>
        </div>
      } @else {
        <!-- Group by year -->
        @for (year of groupedYears(); track year) {
          <div>
            <h2 class="font-bold text-gray-700 text-sm uppercase tracking-wide mb-3">{{ year }}</h2>
            <div class="space-y-3">
              @for (order of getByYear(year); track order.id) {
                <a [routerLink]="['/mon-compte/commandes', order.id]"
                  class="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow group">
                  <div class="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-0.5">
                      <span class="font-semibold text-gray-900 text-sm">N° {{ order.orderNumber }}</span>
                      <span [class]="statusClass(order.status)" class="badge text-xs">{{ statusLabel(order.status) }}</span>
                    </div>
                    <p class="text-xs text-gray-500">{{ order.createdAt | date:'d MMMM yyyy':'':'fr' }}</p>
                  </div>
                  <div class="text-right flex-shrink-0">
                    <p class="font-bold text-navy">{{ order.totalTtc | number:'1.2-2' }} €</p>
                    <p class="text-xs text-gray-400">TTC</p>
                  </div>
                  <svg class="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </a>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class OrderHistoryComponent implements OnInit {
  private orderSvc = inject(OrderService);

  orders = signal<Order[]>([]);
  filtered = signal<Order[]>([]);
  loading = signal(true);
  search = '';
  selectedYear = signal<number | null>(null);
  years = signal<number[]>([]);
  groupedYears = () => [...new Set(this.filtered().map(o => new Date(o.createdAt).getFullYear()))].sort((a, b) => b - a).map(String);

  ngOnInit() {
    this.orderSvc.list({ pageSize: 100 }).subscribe({
      next: res => {
        this.orders.set(res.data);
        this.filtered.set(res.data);
        const ys = [...new Set(res.data.map(o => new Date(o.createdAt).getFullYear()))].sort((a, b) => b - a);
        this.years.set(ys);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  filterOrders() {
    let list = this.orders();
    if (this.selectedYear()) list = list.filter(o => new Date(o.createdAt).getFullYear() === this.selectedYear());
    if (this.search) {
      const q = this.search.toLowerCase();
      list = list.filter(o => o.orderNumber.toLowerCase().includes(q) || o.items.some(i => i.productNameSnapshot.toLowerCase().includes(q)));
    }
    this.filtered.set(list);
  }

  getByYear(y: string) {
    return this.filtered().filter(o => new Date(o.createdAt).getFullYear().toString() === y);
  }

  statusLabel(s: string) {
    const map: Record<string, string> = { Pending: 'En attente', Paid: 'Payée', Shipped: 'Expédiée', Completed: 'Terminée', Cancelled: 'Annulée', Refunded: 'Remboursée' };
    return map[s] ?? s;
  }

  statusClass(s: string) {
    const map: Record<string, string> = {
      Pending: 'badge-warning', Paid: 'badge-primary', Shipped: 'badge-primary',
      Completed: 'badge-success', Cancelled: 'badge-danger', Refunded: 'badge-gray'
    };
    return map[s] ?? 'badge-gray';
  }
}
