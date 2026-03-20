import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Utilisateurs</h1>
          <p class="text-sm text-gray-500 mt-1">{{ total() }} compte(s) enregistré(s)</p>
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
          placeholder="Nom, email..." class="input-field flex-1 text-sm" />
        <select [(ngModel)]="roleFilter" (ngModelChange)="load()" class="input-field text-sm w-auto">
          <option value="">Tous les rôles</option>
          <option value="Customer">Clients</option>
          <option value="Admin">Administrateurs</option>
        </select>
      </div>

      <div class="card overflow-hidden">
        @if (loading()) {
          <div class="p-8 text-center">
            <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        } @else if (users().length === 0) {
          <div class="p-12 text-center text-gray-500">Aucun utilisateur trouvé.</div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 text-left">
                  <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Utilisateur</th>
                  <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                  <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rôle</th>
                  <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Inscrit le</th>
                  <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Commandes</th>
                  <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">CA total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (user of users(); track user.id) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-5 py-3.5">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span class="text-xs font-bold text-primary">{{ (user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '') }}</span>
                        </div>
                        <p class="font-medium text-gray-900">{{ user.firstName }} {{ user.lastName }}</p>
                      </div>
                    </td>
                    <td class="px-5 py-3.5 text-gray-600">{{ user.email }}</td>
                    <td class="px-5 py-3.5">
                      <span [class]="user.role === 'Admin' ? 'badge-primary' : 'badge-gray'" class="badge text-xs">
                        {{ user.role === 'Admin' ? 'Admin' : 'Client' }}
                      </span>
                    </td>
                    <td class="px-5 py-3.5 text-gray-500">{{ user.createdAt | date:'d MMM yyyy':'':'fr' }}</td>
                    <td class="px-5 py-3.5 text-center text-gray-600">{{ user.orderCount ?? 0 }}</td>
                    <td class="px-5 py-3.5 text-right font-medium text-gray-900">{{ (user.totalRevenue ?? 0) | number:'1.2-2' }} €</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

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
    </div>
  `,
})
export class AdminUsersComponent implements OnInit {
  private adminSvc = inject(AdminService);

  users = signal<any[]>([]);
  loading = signal(true);
  total = signal(0);
  page = signal(1);
  search = ''; roleFilter = '';
  readonly pageSize = 25;

  totalPages = () => Math.ceil(this.total() / this.pageSize);

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.adminSvc.listUsers({ page: this.page(), pageSize: this.pageSize, search: this.search, role: this.roleFilter }).subscribe({
      next: (res: any) => { this.users.set(res.data ?? res); this.total.set(res.total ?? res.length ?? 0); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  setPage(p: number) { this.page.set(p); this.load(); }

  exportCsv() {
    this.adminSvc.exportUsers().subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'utilisateurs.csv'; a.click();
      URL.revokeObjectURL(url);
    });
  }
}
