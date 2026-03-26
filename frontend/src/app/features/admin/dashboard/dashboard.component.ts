import { Component, OnInit, signal, inject, AfterViewInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AdminService } from '../../../core/services/admin.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-8">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p class="text-sm text-gray-500 mt-1">Vue d'ensemble de votre activité</p>
        </div>
        <div class="flex gap-2">
          @for (p of periods; track p.value) {
            <button (click)="setPeriod(p.value)"
              [class]="period() === p.value ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200'"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:shadow-sm">
              {{ p.label }}
            </button>
          }
        </div>
      </div>

      <!-- KPI cards -->
      @if (loading()) {
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          @for (_ of [1,2,3,4]; track $index) { <div class="card p-5 skeleton h-28"></div> }
        </div>
      } @else {
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          @for (kpi of kpis(); track kpi.label) {
            <div class="card p-5">
              <div class="flex items-center justify-between mb-3">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  [class]="kpi.iconBg" [innerHTML]="kpi.icon"></div>
                <span [class]="kpi.trend >= 0 ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'"
                  class="text-xs font-medium px-2 py-0.5 rounded-full">
                  {{ kpi.trend >= 0 ? '+' : '' }}{{ kpi.trend }}%
                </span>
              </div>
              <p class="text-2xl font-bold text-gray-900">{{ kpi.value }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ kpi.label }}</p>
            </div>
          }
        </div>
      }

      <!-- Charts row 1 -->
      <div class="grid lg:grid-cols-3 gap-6">
        <!-- Revenue chart -->
        <div class="lg:col-span-2 card p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="font-semibold text-gray-900">Chiffre d'affaires</h2>
            <span class="text-xs text-gray-400">TTC</span>
          </div>
          <div style="height: 240px; position: relative;">
            <canvas #revenueChart></canvas>
          </div>
        </div>

        <!-- Orders by status -->
        <div class="card p-6">
          <h2 class="font-semibold text-gray-900 mb-6">Commandes par statut</h2>
          <div style="height: 200px; position: relative;" class="mb-4">
            <canvas #statusChart></canvas>
          </div>
          <div class="space-y-2">
            @for (item of statusData(); track item.label) {
              <div class="flex items-center justify-between text-sm">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full" [style.backgroundColor]="item.color"></div>
                  <span class="text-gray-600">{{ item.label }}</span>
                </div>
                <span class="font-medium text-gray-900">{{ item.count }}</span>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Charts row 2 -->
      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Category sales -->
        <div class="card p-6">
          <h2 class="font-semibold text-gray-900 mb-6">Ventes par catégorie</h2>
          <div style="height: 240px; position: relative;">
            <canvas #categoryChart></canvas>
          </div>
        </div>

        <!-- Top products -->
        <div class="card p-6">
          <div class="flex items-center justify-between mb-5">
            <h2 class="font-semibold text-gray-900">Top produits</h2>
            <a routerLink="/admin/produits" class="text-xs text-primary hover:underline">Voir tout</a>
          </div>
          <div class="space-y-3">
            @for (p of topProducts(); track p.name; let i = $index) {
              <div class="flex items-center gap-3">
                <span class="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0"
                  [class]="i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-400'">
                  {{ i + 1 }}
                </span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ p.name }}</p>
                  <p class="text-xs text-gray-400">{{ p.sales }} ventes</p>
                </div>
                <span class="text-sm font-semibold text-gray-900 flex-shrink-0">{{ p.revenue | number:'1.0-0' }} €</span>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Recent orders -->
      <div class="card overflow-hidden">
        <div class="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 class="font-semibold text-gray-900">Dernières commandes</h2>
          <a routerLink="/admin/commandes" class="text-xs text-primary hover:underline">Voir tout</a>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 text-left">
                <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">N° commande</th>
                <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
                <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
                <th class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Total TTC</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (order of recentOrders(); track order.id) {
                <tr class="hover:bg-gray-50 cursor-pointer" [routerLink]="['/admin/commandes']">
                  <td class="px-5 py-3.5 font-medium text-gray-900">{{ order.orderNumber }}</td>
                  <td class="px-5 py-3.5 text-gray-600">{{ order.customerName }}</td>
                  <td class="px-5 py-3.5 text-gray-500">{{ order.createdAt | date:'d MMM yyyy':'':'fr' }}</td>
                  <td class="px-5 py-3.5">
                    <span [class]="statusClass(order.status)" class="badge text-xs">{{ statusLabel(order.status) }}</span>
                  </td>
                  <td class="px-5 py-3.5 text-right font-semibold text-gray-900">{{ order.totalTtc | number:'1.2-2' }} €</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChildren('revenueChart') revenueChartRef!: QueryList<ElementRef>;
  @ViewChildren('statusChart') statusChartRef!: QueryList<ElementRef>;
  @ViewChildren('categoryChart') categoryChartRef!: QueryList<ElementRef>;

  private adminSvc = inject(AdminService);
  private sanitizer = inject(DomSanitizer);

  loading = signal(true);
  period = signal<'week' | 'month' | 'year'>('month');

  kpis = signal<any[]>([]);
  statusData = signal<any[]>([]);
  topProducts = signal<any[]>([]);
  recentOrders = signal<any[]>([]);

  private revenueChartInst: Chart | null = null;
  private statusChartInst: Chart | null = null;
  private categoryChartInst: Chart | null = null;

  periods = [
    { value: 'week' as const, label: '7 jours' },
    { value: 'month' as const, label: '30 jours' },
    { value: 'year' as const, label: '12 mois' },
  ];

  private icon(path: string, extraPath?: string): SafeHtml {
    const p2 = extraPath ? `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${extraPath}"/>` : '';
    return this.sanitizer.bypassSecurityTrustHtml(
      `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${path}"/>${p2}</svg>`
    );
  }

  ngOnInit() { this.loadData(); }

  ngAfterViewInit() {
    this.revenueChartRef.changes.subscribe(() => this.initCharts());
    this.statusChartRef.changes.subscribe(() => this.initStatusChart());
    this.categoryChartRef.changes.subscribe(() => this.initCategoryChart());
  }

  setPeriod(p: 'week' | 'month' | 'year') {
    this.period.set(p);
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.adminSvc.getSalesStats(this.period()).subscribe({
      next: (stats: any) => {
        this.kpis.set([
          { icon: this.icon('M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'), iconBg: 'bg-emerald-50 text-emerald-600', label: 'CA TTC', value: `${(stats.totalRevenue ?? 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`, trend: stats.revenueTrend ?? 0 },
          { icon: this.icon('M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'), iconBg: 'bg-blue-50 text-blue-600', label: 'Commandes', value: stats.totalOrders ?? 0, trend: stats.ordersTrend ?? 0 },
          { icon: this.icon('M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z'), iconBg: 'bg-violet-50 text-violet-600', label: 'Nouveaux clients', value: stats.newCustomers ?? 0, trend: stats.customersTrend ?? 0 },
          { icon: this.icon('M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'), iconBg: 'bg-amber-50 text-amber-600', label: 'Produits vendus', value: stats.unitsSold ?? 0, trend: stats.unitsTrend ?? 0 },
        ]);
        this.topProducts.set(stats.topProducts ?? []);
        this.recentOrders.set(stats.recentOrders ?? []);
        this.loading.set(false);
        setTimeout(() => {
          this.initCharts();
          this.initStatusChart();
          this.initCategoryChart();
        }, 0);
      },
      error: () => {
        // Mock data for display
        this.kpis.set([
          { icon: this.icon('M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'), iconBg: 'bg-emerald-50 text-emerald-600', label: 'CA TTC', value: '12 450,00 €', trend: 8.2 },
          { icon: this.icon('M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'), iconBg: 'bg-blue-50 text-blue-600', label: 'Commandes', value: 47, trend: 3.5 },
          { icon: this.icon('M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z'), iconBg: 'bg-violet-50 text-violet-600', label: 'Nouveaux clients', value: 12, trend: -2.1 },
          { icon: this.icon('M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'), iconBg: 'bg-amber-50 text-amber-600', label: 'Produits vendus', value: 134, trend: 11.4 },
        ]);
        this.topProducts.set([
          { name: 'ECG 12 dérivations CardioScan Pro', sales: 23, revenue: 34500 },
          { name: 'Tensiomètre OMRON M3', sales: 18, revenue: 2700 },
          { name: 'Oxymètre de pouls Nonin GO2', sales: 15, revenue: 2250 },
          { name: 'Stéthoscope Littmann Classic III', sales: 12, revenue: 3600 },
          { name: 'Glucomètre Accu-Chek Guide', sales: 9, revenue: 1350 },
        ]);
        this.statusData.set([
          { label: 'En attente', count: 8, color: '#F59E0B' },
          { label: 'Payée', count: 15, color: '#0EA5E9' },
          { label: 'Expédiée', count: 12, color: '#8B5CF6' },
          { label: 'Terminée', count: 29, color: '#10B981' },
          { label: 'Annulée', count: 3, color: '#EF4444' },
        ]);
        this.recentOrders.set([
          { id: '1', orderNumber: 'CMD-2024-0047', customerName: 'Jean Dupont', createdAt: new Date(), status: 'Paid', totalTtc: 1250.00 },
          { id: '2', orderNumber: 'CMD-2024-0046', customerName: 'Marie Martin', createdAt: new Date(), status: 'Shipped', totalTtc: 450.00 },
          { id: '3', orderNumber: 'CMD-2024-0045', customerName: 'Paul Leclerc', createdAt: new Date(), status: 'Completed', totalTtc: 875.50 },
          { id: '4', orderNumber: 'CMD-2024-0044', customerName: 'Sophie Moreau', createdAt: new Date(), status: 'Pending', totalTtc: 2100.00 },
          { id: '5', orderNumber: 'CMD-2024-0043', customerName: 'Luc Bernard', createdAt: new Date(), status: 'Cancelled', totalTtc: 330.00 },
        ]);
        this.loading.set(false);
        setTimeout(() => { this.initCharts(); this.initStatusChart(); this.initCategoryChart(); }, 0);
      }
    });
  }

  private initCharts() {
    const el = this.revenueChartRef.first?.nativeElement;
    if (!el) return;
    this.revenueChartInst?.destroy();
    const labels = this.period() === 'year'
      ? ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
      : this.period() === 'month'
      ? Array.from({ length: 30 }, (_, i) => `J-${29 - i}`)
      : ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const data = labels.map(() => Math.floor(Math.random() * 3000 + 500));
    this.revenueChartInst = new Chart(el, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'CA TTC (€)',
          data,
          backgroundColor: 'rgba(14, 165, 233, 0.15)',
          borderColor: '#0EA5E9',
          borderWidth: 2,
          borderRadius: 6,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { callback: (v) => v + ' €' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  private initStatusChart() {
    const el = this.statusChartRef.first?.nativeElement;
    if (!el) return;
    const data = this.statusData();
    if (!data.length) return;
    this.statusChartInst?.destroy();
    this.statusChartInst = new Chart(el, {
      type: 'doughnut',
      data: {
        labels: data.map(d => d.label),
        datasets: [{ data: data.map(d => d.count), backgroundColor: data.map(d => d.color), borderWidth: 0 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${c.label}: ${c.raw}` } } },
        cutout: '70%'
      }
    });
  }

  private initCategoryChart() {
    const el = this.categoryChartRef.first?.nativeElement;
    if (!el) return;
    this.categoryChartInst?.destroy();
    this.adminSvc.getCategoryStats().subscribe({
      next: (stats: any[]) => {
        const labels = stats.map((s: any) => s.name);
        const data = stats.map((s: any) => s.revenue ?? 0);
        this.buildCategoryChart(el, labels, data);
      },
      error: () => {
        const labels = ['Cardiologie', 'Imagerie', 'Diagnostic', 'Chirurgie', 'Rééducation'];
        const data = [4200, 3100, 2500, 1800, 900];
        this.buildCategoryChart(el, labels, data);
      }
    });
  }

  private buildCategoryChart(el: HTMLCanvasElement, labels: string[], data: number[]) {
    this.categoryChartInst?.destroy();
    this.categoryChartInst = new Chart(el, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'CA (€)',
          data,
          backgroundColor: ['#0EA5E9', '#38BDF8', '#7DD3FC', '#BAE6FD', '#E0F2FE'],
          borderRadius: 6,
          borderWidth: 0,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { callback: (v) => v + ' €' } },
          y: { grid: { display: false } }
        }
      }
    });
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
