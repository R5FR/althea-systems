import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { InvoiceService } from '../../../core/services/invoice.service';
import { Invoice } from '../../../core/models';

@Component({
  selector: 'app-admin-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Factures</h1>
          <p class="text-sm text-gray-500 mt-1">{{ total() }} facture(s)</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="card p-4 flex flex-col sm:flex-row gap-3">
        <input [(ngModel)]="search" type="search" placeholder="Rechercher (n° facture, commande, client)…"
          class="input-field flex-1 text-sm" />
        <select [(ngModel)]="statusFilter" class="input-field text-sm w-auto">
          <option value="">Tous les statuts</option>
          <option value="Pending">En attente</option>
          <option value="Paid">Payée</option>
          <option value="Cancelled">Annulée</option>
        </select>
      </div>

      <!-- Table -->
      <div class="card overflow-hidden">
        @if (loading()) {
          <div class="p-8 text-center">
            <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        } @else if (filtered().length === 0) {
          <div class="p-12 text-center text-gray-500">Aucune facture trouvée.</div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 text-left">
                  <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">N° Facture</th>
                  <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Commande</th>
                  <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
                  <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Montant TTC</th>
                  <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
                  <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Émise le</th>
                  <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (inv of filtered(); track inv.id) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-5 py-3.5 font-mono text-xs font-semibold text-navy">{{ inv.invoiceNumber }}</td>
                    <td class="px-5 py-3.5 text-gray-700 font-mono text-xs">{{ inv.orderNumber }}</td>
                    <td class="px-5 py-3.5 text-gray-700">{{ inv.userFullName || inv.userEmail }}</td>
                    <td class="px-5 py-3.5 font-semibold text-gray-900">{{ inv.totalTtc | number:'1.2-2' }} €</td>
                    <td class="px-5 py-3.5">
                      <span [class]="statusBadge(inv.status)" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium">
                        {{ statusLabel(inv.status) }}
                      </span>
                    </td>
                    <td class="px-5 py-3.5 text-gray-500 text-xs">{{ inv.issuedAt | date:'dd/MM/yyyy HH:mm' }}</td>
                    <td class="px-5 py-3.5">
                      <div class="flex items-center gap-2">
                        <button (click)="downloadPdf(inv)" title="Télécharger PDF"
                          class="text-primary hover:text-primary-700 transition-colors">
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                          </svg>
                        </button>
                        <select (change)="changeStatus(inv, $any($event.target).value)"
                          class="text-xs border border-gray-200 rounded px-1.5 py-1 text-gray-600 focus:outline-none focus:ring-1 focus:ring-primary">
                          <option value="">Changer statut</option>
                          <option value="Pending">En attente</option>
                          <option value="Paid">Payée</option>
                          <option value="Cancelled">Annulée</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
})
export class AdminInvoicesComponent implements OnInit {
  private invoiceSvc = inject(InvoiceService);

  invoices = signal<Invoice[]>([]);
  loading  = signal(true);
  search   = '';
  statusFilter = '';

  total = () => this.filtered().length;

  filtered() {
    const q = this.search.toLowerCase();
    return this.invoices().filter(inv => {
      const matchSearch = !q
        || inv.invoiceNumber?.toLowerCase().includes(q)
        || inv.orderNumber?.toLowerCase().includes(q)
        || inv.userFullName?.toLowerCase().includes(q)
        || inv.userEmail?.toLowerCase().includes(q);
      const matchStatus = !this.statusFilter || inv.status === this.statusFilter;
      return matchSearch && matchStatus;
    });
  }

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.invoiceSvc.getAllInvoices().subscribe({
      next: data => { this.invoices.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  downloadPdf(inv: Invoice) {
    this.invoiceSvc.adminDownloadPdf(inv.id).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facture-${inv.invoiceNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  changeStatus(inv: Invoice, status: string) {
    if (!status) return;
    this.invoiceSvc.updateStatus(inv.id, status).subscribe({
      next: () => this.load(),
      error: err => console.error('Status update failed', err)
    });
  }

  statusLabel(s: string) {
    const map: Record<string, string> = { Pending: 'En attente', Paid: 'Payée', Cancelled: 'Annulée' };
    return map[s] ?? s;
  }

  statusBadge(s: string) {
    const map: Record<string, string> = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Paid:    'bg-green-100 text-green-800',
      Cancelled: 'bg-red-100 text-red-800'
    };
    return map[s] ?? 'bg-gray-100 text-gray-700';
  }
}
