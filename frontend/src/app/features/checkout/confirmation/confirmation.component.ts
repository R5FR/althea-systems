import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container py-16 max-w-2xl mx-auto text-center">
      @if (loading()) {
        <div class="flex flex-col items-center gap-4">
          <div class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p class="text-gray-500">Chargement de votre commande...</p>
        </div>
      } @else if (order()) {
        <!-- Success -->
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Commande confirmée !</h1>
        <p class="text-gray-500 mb-2">Commande n° <span class="font-semibold text-gray-800">{{ order()!.orderNumber }}</span></p>
        <p class="text-gray-500 mb-8">Un email de confirmation a été envoyé à votre adresse.</p>

        <!-- Order summary card -->
        <div class="card p-6 text-left mb-8">
          <h2 class="font-bold text-gray-900 mb-4">Récapitulatif de la commande</h2>
          @for (item of order()!.items; track item.id) {
            <div class="flex justify-between text-sm py-2 border-b border-gray-100 last:border-0">
              <span class="text-gray-700">{{ item.productNameSnapshot }} ×{{ item.quantity }}</span>
              <span class="font-semibold">{{ item.totalLineTtc | number:'1.2-2' }} €</span>
            </div>
          }
          <div class="mt-4 pt-4 border-t space-y-1 text-sm">
            <div class="flex justify-between text-gray-500">
              <span>Sous-total HT</span><span>{{ order()!.totalHt | number:'1.2-2' }} €</span>
            </div>
            <div class="flex justify-between text-gray-500">
              <span>TVA</span><span>{{ order()!.totalTva | number:'1.2-2' }} €</span>
            </div>
            <div class="flex justify-between font-bold text-gray-900 text-base pt-1">
              <span>Total TTC</span><span class="text-primary">{{ order()!.totalTtc | number:'1.2-2' }} €</span>
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a [routerLink]="['/mon-compte/commandes', order()!.id]" class="btn-primary">
            Suivre ma commande
          </a>
          <a routerLink="/" class="btn-ghost">
            Retour à l'accueil
          </a>
        </div>
      } @else {
        <div class="text-gray-500">Commande introuvable.</div>
      }
    </div>
  `,
})
export class ConfirmationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderSvc = inject(OrderService);

  order = signal<Order | null>(null);
  loading = signal(true);

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.orderSvc.getById(id).subscribe({
      next: o => { this.order.set(o); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
