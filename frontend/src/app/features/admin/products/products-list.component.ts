import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { TranslateDynamicPipe } from '../../../shared/pipes/translate-dynamic.pipe';
import { ProductService } from '../../../core/services/product.service';
import { AdminService } from '../../../core/services/admin.service';
import { ProductListItem } from '../../../core/models';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslatePipe, TranslateDynamicPipe],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ 'admin.products_title' | translate }}</h1>
          <p class="text-sm text-gray-500 mt-1">{{ total() }} {{ 'admin.products_count' | translate }}</p>
        </div>
        <div class="flex gap-3">
          <button (click)="exportCsv()" class="btn-ghost text-sm flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            {{ 'admin.products_export' | translate }}
          </button>
          <a routerLink="/admin/produits/nouveau" class="btn-primary text-sm">{{ 'admin.products_new' | translate }}</a>
        </div>
      </div>

      <!-- Filters -->
      <div class="card p-4 flex flex-col sm:flex-row gap-3">
        <input [(ngModel)]="search" (ngModelChange)="onSearch()" type="search"
          [placeholder]="'admin.products_search_placeholder' | translate" class="input-field flex-1 text-sm" />
        <select [(ngModel)]="statusFilter" (ngModelChange)="load()" class="input-field text-sm w-auto">
          <option value="">{{ 'admin.products_status_all' | translate }}</option>
          <option value="active">{{ 'admin.products_status_active' | translate }}</option>
          <option value="inactive">{{ 'admin.products_status_inactive' | translate }}</option>
          <option value="outofstock">{{ 'admin.products_status_outofstock' | translate }}</option>
        </select>
        <select [(ngModel)]="sortBy" (ngModelChange)="load()" class="input-field text-sm w-auto">
          <option value="name">{{ 'admin.products_sort_name' | translate }}</option>
          <option value="price">{{ 'admin.products_sort_price' | translate }}</option>
          <option value="stock">{{ 'admin.products_sort_stock' | translate }}</option>
          <option value="priority">{{ 'admin.products_sort_priority' | translate }}</option>
        </select>
      </div>

      <!-- Bulk actions -->
      @if (selected().size > 0) {
        <div class="bg-primary-50 border border-primary/20 rounded-xl p-3 flex items-center gap-4">
          <span class="text-sm font-medium text-primary">{{ selected().size }} {{ 'admin.products_selected' | translate }}</span>
          <button (click)="bulkDelete()" class="text-sm text-red-600 hover:text-red-800 font-medium">{{ 'admin.products_bulk_delete' | translate }}</button>
          <button (click)="clearSelection()" class="text-sm text-gray-500 ml-auto">{{ 'admin.products_clear_selection' | translate }}</button>
        </div>
      }

      <!-- Table -->
      <div class="card overflow-hidden">
        @if (loading()) {
          <div class="p-8 text-center">
            <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        } @else if (products().length === 0) {
          <div class="p-12 text-center text-gray-500">
            <p class="text-lg mb-2">{{ 'admin.products_none_title' | translate }}</p>
            <a routerLink="/admin/produits/nouveau" class="btn-primary text-sm">{{ 'admin.products_create_first' | translate }}</a>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 text-left">
                  <th class="px-4 py-3 w-10">
                    <input type="checkbox" (change)="toggleAll($event)"
                      [checked]="selected().size === products().length"
                      class="rounded border-gray-300 text-primary" />
                  </th>
                  <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ 'admin.col_product' | translate }}</th>
                  <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ 'admin.col_ref' | translate }}</th>
                  <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ 'admin.col_price_ttc' | translate }}</th>
                  <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ 'admin.col_stock' | translate }}</th>
                  <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ 'admin.col_priority' | translate }}</th>
                  <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ 'admin.col_active' | translate }}</th>
                  <th class="px-4 py-3 w-24"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (p of products(); track p.id) {
                  <tr class="hover:bg-gray-50 group">
                    <td class="px-4 py-3">
                      <input type="checkbox" [checked]="selected().has(p.id)"
                        (change)="toggleSelect(p.id)"
                        class="rounded border-gray-300 text-primary" />
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          @if (p.imageUrl) {
                            <img [src]="p.imageUrl" [alt]="p.name" class="w-full h-full object-cover" />
                          } @else {
                            <div class="w-full h-full flex items-center justify-center text-gray-300">
                              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                              </svg>
                            </div>
                          }
                        </div>
                        <div class="min-w-0">
                          <p class="font-medium text-gray-900 truncate max-w-[200px]">{{ p.name | translateDynamic }}</p>
                          @if (p.isLargeProduct) {
                            <span class="text-xs text-purple-600 font-medium">{{ 'admin.products_large' | translate }}</span>
                          }
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-gray-500 font-mono text-xs">{{ p.reference ?? '—' }}</td>
                    <td class="px-4 py-3 font-medium text-gray-900">{{ p.priceTtc | number:'1.2-2' }} €</td>
                    <td class="px-4 py-3">
                      <span [class]="p.stockQuantity === 0 ? 'text-red-600 bg-red-50' : p.stockQuantity < 5 ? 'text-yellow-600 bg-yellow-50' : 'text-green-600 bg-green-50'"
                        class="px-2 py-0.5 rounded-full text-xs font-medium">
                        {{ p.stockQuantity === 0 ? ('admin.products_stock_out' | translate) : (p.stockQuantity + ' ' + ('admin.products_stock_in' | translate)) }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <input type="number" [value]="p.priority" min="0" max="99"
                        (change)="updatePriority(p.id, $event)"
                        class="w-16 text-center border border-gray-200 rounded-lg py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </td>
                    <td class="px-4 py-3">
                      <span [class]="p.isActive !== false ? 'badge-success' : 'badge-gray'" class="badge text-xs">
                        {{ p.isActive !== false ? ('admin.products_active' | translate) : ('admin.products_inactive' | translate) }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a [routerLink]="['/admin/produits', p.id]"
                          class="p-1.5 text-gray-400 hover:text-primary hover:bg-primary-50 rounded-lg transition-colors" [title]="'common.edit' | translate">
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </a>
                        <button (click)="deleteProduct(p.id)"
                          class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" [title]="'common.delete' | translate">
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
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
              <p class="text-sm text-gray-500">{{ 'common.page' | translate }} {{ page() }} {{ 'common.of' | translate }} {{ totalPages() }}</p>
              <div class="flex gap-2">
                <button (click)="page.set(page() - 1); load()" [disabled]="page() === 1" class="btn-ghost text-sm px-3 py-1.5">{{ 'common.previous' | translate }}</button>
                <button (click)="page.set(page() + 1); load()" [disabled]="page() === totalPages()" class="btn-ghost text-sm px-3 py-1.5">{{ 'common.next' | translate }}</button>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
})
export class ProductsListComponent implements OnInit {
  private productSvc = inject(ProductService);
  private adminSvc = inject(AdminService);

  products = signal<ProductListItem[]>([]);
  loading = signal(true);
  selected = signal<Set<string>>(new Set());
  total = signal(0);
  page = signal(1);
  pageSize = 20;
  search = '';
  statusFilter = '';
  sortBy = 'priority';

  totalPages = () => Math.ceil(this.total() / this.pageSize);

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.productSvc.search({
      q: this.search,
      page: this.page(),
      pageSize: this.pageSize,
      sortBy: this.sortBy as any,
    }).subscribe({
      next: res => {
        this.products.set(res.data);
        this.total.set(res.total ?? res.pagination?.totalCount ?? res.data.length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onSearch() {
    this.page.set(1);
    this.load();
  }

  clearSelection() { this.selected.set(new Set()); }

  toggleAll(e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    this.selected.set(checked ? new Set(this.products().map(p => p.id)) : new Set());
  }

  toggleSelect(id: string) {
    const s = new Set(this.selected());
    s.has(id) ? s.delete(id) : s.add(id);
    this.selected.set(s);
  }

  updatePriority(id: string, e: Event) {
    const val = parseInt((e.target as HTMLInputElement).value);
    this.productSvc.update(id, { priority: val } as any).subscribe();
  }

  deleteProduct(id: string) {
    if (!confirm('Supprimer ce produit ?')) return;
    this.productSvc.delete(id).subscribe({ next: () => this.load() });
  }

  bulkDelete() {
    if (!confirm(`Supprimer ${this.selected().size} produit(s) ?`)) return;
    const ids = [...this.selected()];
    let done = 0;
    ids.forEach(id => {
      this.productSvc.delete(id).subscribe({ next: () => { if (++done === ids.length) { this.selected.set(new Set()); this.load(); } } });
    });
  }

  exportCsv() {
    this.adminSvc.exportProducts().subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'produits.csv'; a.click();
      URL.revokeObjectURL(url);
    });
  }
}
