import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Order, CheckoutDto, PaginatedResult } from '../models';

export interface OrderFilterParams {
  status?: string;
  startDate?: string;
  endDate?: string;
  pageNumber?: number;
  pageSize?: number;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/orders`;

  placeOrder(dto: CheckoutDto) {
    return this.http.post<string>(`${environment.apiUrl}/cart/checkout`, dto);
  }

  getById(id: string) {
    return this.http.get<Order>(`${this.base}/${id}`);
  }

  list(filters: OrderFilterParams = {}) {
    let p = new HttpParams();
    if (filters.status)    p = p.set('status', filters.status);
    if (filters.startDate) p = p.set('startDate', filters.startDate);
    if (filters.endDate)   p = p.set('endDate', filters.endDate);
    p = p.set('pageNumber', (filters.pageNumber ?? 1).toString());
    p = p.set('pageSize',   (filters.pageSize ?? 10).toString());
    return this.http.get<PaginatedResult<Order>>(this.base, { params: p });
  }

  cancel(id: string) {
    return this.http.post<Order>(`${this.base}/${id}/cancel`, {});
  }

  updateStatus(id: string, status: string) {
    return this.http.patch<Order>(`${this.base}/${id}/status`, { status });
  }

  exportPdf(id: string) {
    return this.http.get(`${this.base}/${id}/export`, {
      params: { format: 'pdf' },
      responseType: 'blob',
    });
  }
}
