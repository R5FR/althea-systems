import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../core/models';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  template: `
    <div class="space-y-6">
      <div class="flex items-center gap-3">
        <a routerLink="/mon-compte/commandes" class="text-gray-400 hover:text-gray-600 transition-colors">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </a>
        <h1 class="text-xl font-display font-semibold text-navy">
          @if (order()) { {{ 'orders.detail_order_label' | translate }} {{ order()!.orderNumber }} }
          @else { {{ 'orders.detail_title' | translate }} }
        </h1>
        @if (order()) {
          <span [class]="statusClass(order()!.status)" class="badge text-xs">{{ statusLabel(order()!.status) }}</span>
        }
      </div>

      @if (loading()) {
        <div class="space-y-4">
          @for (_ of [1,2,3]; track $index) { <div class="card p-6 skeleton h-32"></div> }
        </div>
      } @else if (!order()) {
        <div class="card p-10 text-center text-gray-500">
          <p>{{ 'orders.not_found' | translate }}</p>
        </div>
      } @else {
        <div class="grid lg:grid-cols-3 gap-6">
          <!-- Main content -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Items -->
            <div class="card overflow-hidden">
              <div class="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 class="font-semibold text-gray-900">{{ 'orders.items_ordered' | translate }}</h2>
                <span class="text-sm text-gray-500">{{ order()!.items.length }} {{ 'orders.items_count' | translate }}</span>
              </div>
              <div class="divide-y divide-gray-100">
                @for (item of order()!.items; track item.id) {
                  <div class="p-4 flex gap-4">
                    <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      @if (item.productImageUrl) {
                        <img [src]="item.productImageUrl" [alt]="item.productNameSnapshot" class="w-full h-full object-cover" />
                      } @else {
                        <div class="w-full h-full flex items-center justify-center text-gray-400">
                          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                          </svg>
                        </div>
                      }
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-medium text-gray-900 truncate">{{ item.productNameSnapshot }}</p>
                      @if (item.productReferenceSnapshot) {
                        <p class="text-sm text-gray-500 mt-0.5">{{ 'orders.reference_label' | translate }} {{ item.productReferenceSnapshot }}</p>
                      }
                      <div class="flex items-center gap-4 mt-1">
                        <span class="text-sm text-gray-600">{{ 'orders.qty_label' | translate }} {{ item.quantity }}</span>
                        <span class="text-sm text-gray-500">{{ item.unitPriceHt | number:'1.2-2' }} {{ 'orders.unit_price_label' | translate }}</span>
                      </div>
                    </div>
                    <div class="text-right flex-shrink-0">
                      <p class="font-semibold text-gray-900">{{ (item.totalTtc ?? item.totalLineTtc) | number:'1.2-2' }} € TTC</p>
                      <p class="text-xs text-gray-400 mt-0.5">{{ item.totalHt | number:'1.2-2' }} € HT</p>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Shipping address -->
            @if (order()!.shippingAddress) {
              <div class="card p-6">
                <h2 class="font-semibold text-gray-900 mb-4">{{ 'orders.shipping_address' | translate }}</h2>
                <div class="text-sm text-gray-600 space-y-1">
                  <p class="font-medium text-gray-900">{{ order()!.shippingAddress!.firstName }} {{ order()!.shippingAddress!.lastName }}</p>
                  <p>{{ order()!.shippingAddress!.addressLine1 }}</p>
                  @if (order()!.shippingAddress!.addressLine2) {
                    <p>{{ order()!.shippingAddress!.addressLine2 }}</p>
                  }
                  <p>{{ order()!.shippingAddress!.postalCode }} {{ order()!.shippingAddress!.city }}</p>
                  <p>{{ order()!.shippingAddress!.country }}</p>
                  @if (order()!.shippingAddress!.phone) {
                    <p class="text-gray-500 mt-2">{{ order()!.shippingAddress!.phone }}</p>
                  }
                </div>
              </div>
            }

            <!-- Timeline -->
            <div class="card p-6">
              <h2 class="font-semibold text-gray-900 mb-4">{{ 'orders.tracking_title' | translate }}</h2>
              <div class="space-y-3">
                @for (step of timeline(); track step.label) {
                  <div class="flex items-start gap-3">
                    <div class="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      [class]="step.done ? 'bg-green-100' : 'bg-gray-100'">
                      @if (step.done) {
                        <svg class="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                        </svg>
                      } @else {
                        <div class="w-2 h-2 rounded-full bg-gray-300"></div>
                      }
                    </div>
                    <div>
                      <p class="text-sm font-medium" [class]="step.done ? 'text-gray-900' : 'text-gray-400'">{{ step.label }}</p>
                      @if (step.date) { <p class="text-xs text-gray-400">{{ step.date | date:'d MMMM yyyy à HH:mm':'':'fr' }}</p> }
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Summary -->
            <div class="card p-6">
              <h2 class="font-semibold text-gray-900 mb-4">{{ 'orders.summary' | translate }}</h2>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between text-gray-600">
                  <span>{{ 'orders.total_ht' | translate }}</span>
                  <span>{{ order()!.totalHt | number:'1.2-2' }} €</span>
                </div>
                <div class="flex justify-between text-gray-600">
                  <span>{{ 'orders.total_tva' | translate }}</span>
                  <span>{{ (order()!.totalTtc - order()!.totalHt) | number:'1.2-2' }} €</span>
                </div>
                @if (order()!.shippingCost !== undefined) {
                  <div class="flex justify-between text-gray-600">
                    <span>{{ 'orders.shipping' | translate }}</span>
                    <span>{{ order()!.shippingCost === 0 ? ('orders.shipping_free' | translate) : ((order()!.shippingCost | number:'1.2-2') + ' €') }}</span>
                  </div>
                }
                <div class="border-t border-gray-100 pt-2 flex justify-between font-bold text-navy">
                  <span>{{ 'orders.total_ttc' | translate }}</span>
                  <span>{{ order()!.totalTtc | number:'1.2-2' }} €</span>
                </div>
              </div>

              @if (order()!.status !== 'Cancelled' && order()!.status !== 'Refunded') {
                <button (click)="downloadInvoice()" class="btn-ghost w-full mt-4 text-sm flex items-center justify-center gap-2">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                  </svg>
                  {{ 'orders.download_invoice' | translate }}
                </button>
              }
            </div>

            <!-- Payment info -->
            <div class="card p-6">
              <h2 class="font-semibold text-gray-900 mb-4">{{ 'orders.payment_section' | translate }}</h2>
              <div class="flex items-center gap-3 text-sm text-gray-600">
                <div class="w-8 h-8 text-gray-400 flex-shrink-0">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                  </svg>
                </div>
                <div>
                  @if (order()!.paymentLast4) {
                    <p class="font-medium text-gray-900">•••• •••• •••• {{ order()!.paymentLast4 }}</p>
                  } @else {
                    <p class="font-medium text-gray-900">{{ 'orders.payment_card' | translate }}</p>
                  }
                  <p class="text-xs text-gray-400">{{ 'orders.payment_secure' | translate }}</p>
                </div>
              </div>
            </div>

            <!-- Actions -->
            @if (order()!.status === 'Pending' || order()!.status === 'Paid') {
              <div class="card p-6 space-y-3">
                <h2 class="font-semibold text-gray-900 mb-1">{{ 'orders.actions' | translate }}</h2>
                @if (order()!.status === 'Pending') {
                  <button (click)="cancelOrder()" class="btn-ghost w-full text-sm text-red-500 hover:bg-red-50">
                    {{ 'orders.cancel_order' | translate }}
                  </button>
                }
                <a routerLink="/contact" class="btn-ghost w-full text-sm text-center block">
                  {{ 'orders.contact_support' | translate }}
                </a>
              </div>
            }

            <div class="text-center">
              <p class="text-xs text-gray-400">{{ 'orders.placed_on' | translate }}</p>
              <p class="text-sm text-gray-600">{{ order()!.createdAt | date:'d MMMM yyyy':'':'fr' }}</p>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class OrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderSvc = inject(OrderService);
  private translate = inject(TranslateService);

  order = signal<Order | null>(null);
  loading = signal(true);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.orderSvc.getById(id).subscribe({
      next: o => { this.order.set(o); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  timeline() {
    const o = this.order();
    if (!o) return [];
    const statuses = ['Pending', 'Paid', 'Shipped', 'Completed'];
    const labels: Record<string, string> = {
      Pending: this.translate.instant('orders.tracking_placed'),
      Paid: this.translate.instant('orders.tracking_paid'),
      Shipped: this.translate.instant('orders.tracking_shipped'),
      Completed: this.translate.instant('orders.tracking_delivered')
    };
    const idx = statuses.indexOf(o.status);
    return statuses.map((s, i) => ({
      label: labels[s],
      done: i <= idx,
      date: i === 0 ? o.createdAt : null
    }));
  }

  downloadInvoice() {
    const o = this.order();
    if (!o) return;
    this.orderSvc.exportPdf(o.id).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `facture-${o.orderNumber}.pdf`;
      a.click(); URL.revokeObjectURL(url);
    });
  }

  cancelOrder() {
    const o = this.order();
    if (!o || !confirm(this.translate.instant('orders.cancel_confirm'))) return;
    this.orderSvc.cancel(o.id).subscribe({
      next: updated => this.order.set(updated)
    });
  }

  statusLabel(s: string) {
    const map: Record<string, string> = {
      Pending: this.translate.instant('orders.status_pending'),
      Paid: this.translate.instant('orders.status_paid'),
      Shipped: this.translate.instant('orders.status_shipped'),
      Completed: this.translate.instant('orders.status_completed'),
      Cancelled: this.translate.instant('orders.status_cancelled'),
      Refunded: this.translate.instant('orders.status_refunded')
    };
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
