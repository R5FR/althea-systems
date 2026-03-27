import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { HomepageConfig, CarouselSlide, User, PaginatedResult, Order } from '../models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/admin`;

  // ─── Homepage / CMS ─────────────────────────────────────────────────────
  getHomepageConfig() {
    return this.http.get<HomepageConfig>(`${this.base}/homepage`);
  }

  updateHomepageConfig(cfg: HomepageConfig) {
    return this.http.put(`${this.base}/homepage`, cfg);
  }

  // ─── Dashboard stats ────────────────────────────────────────────────────
  getSalesStats(period: string = '7days') {
    return this.http.get<any>(`${this.base}/stats/sales`, { params: { period } });
  }

  getCategoryStats(period?: string) {
    const params: any = period ? { period } : {};
    return this.http.get<any>(`${this.base}/stats/categories`, { params });
  }

  // ─── Users ──────────────────────────────────────────────────────────────
  listUsers(opts: { page?: number; pageSize?: number; search?: string; role?: string } | number = 1, pageSize = 20) {
    let p = new HttpParams();
    if (typeof opts === 'object') {
      p = p.set('pageNumber', (opts.page ?? 1).toString()).set('pageSize', (opts.pageSize ?? pageSize).toString());
      if (opts.search) p = p.set('search', opts.search);
      if (opts.role) p = p.set('role', opts.role);
    } else {
      p = p.set('pageNumber', opts.toString()).set('pageSize', pageSize.toString());
    }
    return this.http.get<PaginatedResult<User>>(`${this.base}/users`, { params: p });
  }

  getUserById(id: string) {
    return this.http.get<User>(`${this.base}/users/${id}`);
  }

  updateUser(id: string, dto: Partial<User>) {
    return this.http.put(`${this.base}/users/${id}`, dto);
  }

  exportUsersCsv() {
    return this.http.get(`${this.base}/users/export/csv`, { responseType: 'blob' });
  }

  exportUsers() { return this.exportUsersCsv(); }

  // ─── Orders ─────────────────────────────────────────────────────────────
  listOrders(opts: { page?: number; pageSize?: number; search?: string; status?: string; dateFrom?: string; dateTo?: string } | number = 1, pageSize = 20) {
    let p = new HttpParams();
    if (typeof opts === 'object') {
      p = p.set('pageNumber', (opts.page ?? 1).toString()).set('pageSize', (opts.pageSize ?? pageSize).toString());
      if (opts.search) p = p.set('search', opts.search);
      if (opts.status) p = p.set('status', opts.status);
      if (opts.dateFrom) p = p.set('startDate', opts.dateFrom);
      if (opts.dateTo) p = p.set('endDate', opts.dateTo);
    } else {
      p = p.set('pageNumber', opts.toString()).set('pageSize', pageSize.toString());
    }
    return this.http.get<PaginatedResult<Order>>(`${this.base}/orders`, { params: p });
  }

  exportOrdersCsv(startDate?: string, endDate?: string) {
    let p = new HttpParams();
    if (startDate) p = p.set('startDate', startDate);
    if (endDate)   p = p.set('endDate', endDate);
    return this.http.get(`${this.base}/orders/export/csv`, { params: p, responseType: 'blob' });
  }

  exportOrders() { return this.exportOrdersCsv(); }

  // ─── Products ───────────────────────────────────────────────────────────
  exportProductsCsv() {
    return this.http.get(`${this.base}/products/export/csv`, { responseType: 'blob' });
  }

  exportProducts() { return this.exportProductsCsv(); }

  updateStock(productId: string, quantity: number) {
    return this.http.patch(`${this.base}/products/${productId}/stock`, { quantity });
  }

  // ─── Contact messages ────────────────────────────────────────────────────
  listMessages(page = 1) {
    return this.http.get<PaginatedResult<any>>(`${this.base}/messages`, {
      params: { pageNumber: page.toString(), pageSize: '20' }
    });
  }

  getContactMessages(opts: { status?: string; page?: number } = {}) {
    let p = new HttpParams().set('pageNumber', (opts.page ?? 1).toString()).set('pageSize', '50');
    if (opts.status) p = p.set('status', opts.status);
    return this.http.get<any>(`${this.base}/messages`, { params: p });
  }

  markMessageRead(id: string) {
    return this.http.patch(`${this.base}/messages/${id}/read`, {});
  }
}
