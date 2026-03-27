import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Commandes</h1>
          <p class="text-sm text-gray-500 mt-1">{{ total() }} commande(s)</p>
        </div>
        <button (click)="exportCsv()" class="btn-ghost text-sm flex items-center gap-2 w-fit">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          Exporter CSV
        </button>
      </div>

      <!-- Filters -->
      <div class="card p-4 flex flex-col sm:flex-row gap-3">
        <input [(ngModel)]="search" (ngModelChange)="load()" type="search"
          placeholder="N° commande, client..." class="input-field flex-1 text-sm" />
        <select [(ngModel)]="statusFilter" (ngModelChange)="load()" class="input-field text-sm w-auto">
          <option value="">Tous les statuts</option>
          <option value="Pending">En attente</option>
          <option value="Paid">Payée</option>
          <option value="Shipped">Expédiée</option>
          <option value="Completed">Terminée</option>
          <option value="Cancelled">Annulée</option>
          <option value="Refunded">Remboursée</option>
        </select>
        <input [(ngModel)]="dateFrom" (ngModelChange)="load()" type="date" class="input-field text-sm w-auto" />
        <input [(ngModel)]="dateTo" (ngModelChange)="load()" type="date" class="input-field text-sm w-auto" />
      </div>

      <!-- Table -->
      <div class="card overflow-hidden">
        @if (loading()) {
          <div class="p-8 text-center">
            <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        } @else if (orders().length === 0) {
          <div class="p-12 text-center text-gray-500">Aucune commande trouvée.</div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 text-left">
                  <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">N° commande</th>
                  <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
                  <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Articles</th>
                  <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
                  <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Total TTC</th>
                  <th class="px-5 py-3 w-28"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (order of orders(); track order.id) {
                  <tr class="hover:bg-gray-50 group">
                    <td class="px-5 py-3.5 font-mono text-xs font-medium text-gray-900">{{ order.orderNumber }}</td>
                    <td class="px-5 py-3.5 text-gray-700">
                      <p>{{ order.customerName }}</p>
                      <p class="text-xs text-gray-400">{{ order.customerEmail }}</p>
                    </td>
                    <td class="px-5 py-3.5 text-gray-500">{{ order.createdAt | date:'d MMM yyyy':'':'fr' }}</td>
                    <td class="px-5 py-3.5 text-center text-gray-600">{{ order.items.length }}</td>
                    <td class="px-5 py-3.5">
                      <select [value]="order.status" (change)="updateStatus(order, $event)"
                        class="text-xs border-0 bg-transparent font-medium cursor-pointer focus:ring-2 focus:ring-primary/20 rounded-lg">
                        <option value="Pending">En attente</option>
                        <option value="Paid">Payée</option>
                        <option value="Shipped">Expédiée</option>
                        <option value="Completed">Terminée</option>
                        <option value="Cancelled">Annulée</option>
                        <option value="Refunded">Remboursée</option>
                      </select>
                    </td>
                    <td class="px-5 py-3.5 text-right font-semibold text-gray-900">{{ order.totalTtc | number:'1.2-2' }} €</td>
                    <td class="px-5 py-3.5">
                      <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                        <button (click)="downloadInvoice(order)"
                          class="p-1.5 text-gray-400 hover:text-primary hover:bg-primary-50 rounded-lg transition-colors" title="Facture PDF">
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                          </svg>
                        </button>
                        <button (click)="viewOrder(order)"
                          class="p-1.5 text-gray-400 hover:text-primary hover:bg-primary-50 rounded-lg transition-colors" title="Détail">
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          @if (totalPages() > 1) {
            <div class="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
              <p class="text-sm text-gray-500">Page {{ page() }} sur {{ totalPages() }}</p>
              <div class="flex gap-2">
                <button (click)="setPage(page() - 1)" [disabled]="page() === 1" class="btn-ghost text-sm px-3 py-1.5">Précédent</button>
                <button (click)="setPage(page() + 1)" [disabled]="page() === totalPages()" class="btn-ghost text-sm px-3 py-1.5">Suivant</button>
              </div>
            </div>
          }
        }
      </div>

      <!-- Detail modal -->
      @if (selectedOrder()) {
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" (click)="selectedOrder.set(null)">
          <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto" (click)="$event.stopPropagation()">
            <div class="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 class="font-bold text-gray-900">Commande {{ selectedOrder()!.orderNumber }}</h2>
              <button (click)="selectedOrder.set(null)" class="text-gray-400 hover:text-gray-600">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="p-6 space-y-4">
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div><p class="text-gray-500">Client</p><p class="font-medium">{{ selectedOrder()!.customerName }}</p></div>
                <div><p class="text-gray-500">Email</p><p class="font-medium">{{ selectedOrder()!.customerEmail }}</p></div>
                <div><p class="text-gray-500">Date</p><p class="font-medium">{{ selectedOrder()!.createdAt | date:'d MMMM yyyy':'':'fr' }}</p></div>
                <div><p class="text-gray-500">Statut</p><span [class]="statusClass(selectedOrder()!.status)" class="badge text-xs">{{ statusLabel(selectedOrder()!.status) }}</span></div>
              </div>
              <div class="border-t border-gray-100 pt-4">
                <p class="font-medium text-gray-900 mb-3">Articles</p>
                <div class="space-y-2">
                  @for (item of selectedOrder()!.items; track item.id) {
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-600">{{ item.productNameSnapshot }} × {{ item.quantity }}</span>
                      <span class="font-medium">{{ item.totalTtc | number:'1.2-2' }} €</span>
                    </div>
                  }
                </div>
                <div class="border-t border-gray-100 mt-3 pt-3 flex justify-between font-bold">
                  <span>Total TTC</span>
                  <span>{{ selectedOrder()!.totalTtc | number:'1.2-2' }} €</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class AdminOrdersComponent implements OnInit {
  private adminSvc = inject(AdminService);
  private orderSvc = inject(OrderService);

  orders = signal<any[]>([]);
  loading = signal(true);
  total = signal(0);
  page = signal(1);
  selectedOrder = signal<any | null>(null);
  search = ''; statusFilter = ''; dateFrom = ''; dateTo = '';
  readonly pageSize = 25;

  totalPages = () => Math.ceil(this.total() / this.pageSize);

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.adminSvc.listOrders({ page: this.page(), pageSize: this.pageSize, search: this.search, status: this.statusFilter, dateFrom: this.dateFrom, dateTo: this.dateTo }).subscribe({
      next: (res: any) => { this.orders.set(res.data ?? res); this.total.set(res.total ?? res.length ?? 0); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  setPage(p: number) { this.page.set(p); this.load(); }

  updateStatus(order: any, e: Event) {
    const status = (e.target as HTMLSelectElement).value;
    this.orderSvc.updateStatus?.(order.id, status)?.subscribe({ next: () => this.load() });
  }

  viewOrder(order: any) { this.selectedOrder.set(order); }

  downloadInvoice(order: any) {
    this.orderSvc.exportPdf(order.id).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `facture-${order.orderNumber}.pdf`; a.click();
      URL.revokeObjectURL(url);
    });
  }

  exportCsv() {
    this.adminSvc.exportOrders().subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'commandes.csv'; a.click();
      URL.revokeObjectURL(url);
    });
  }

  statusLabel(s: string) {
    const map: Record<string, string> = { Pending: 'En attente', Paid: 'Payée', Shipped: 'Expédiée', Completed: 'Terminée', Cancelled: 'Annulée', Refunded: 'Remboursée' };
    return map[s] ?? s;
  }
  statusClass(s: string) {
    const map: Record<string, string> = { Pending: 'badge-warning', Paid: 'badge-primary', Shipped: 'badge-primary', Completed: 'badge-success', Cancelled: 'badge-danger', Refunded: 'badge-gray' };
    return map[s] ?? 'badge-gray';
  }
}
