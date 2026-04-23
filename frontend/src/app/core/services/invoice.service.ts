import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Invoice } from '../models';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/invoices`;

  getMyInvoices() {
    return this.http.get<Invoice[]>(this.base);
  }

  getById(id: string) {
    return this.http.get<Invoice>(`${this.base}/${id}`);
  }

  getByOrderId(orderId: string) {
    return this.http.get<Invoice>(`${this.base}/order/${orderId}`);
  }

  downloadPdf(id: string) {
    return this.http.get(`${this.base}/${id}/pdf`, { responseType: 'blob' });
  }

  // Admin
  getAllInvoices() {
    return this.http.get<Invoice[]>(`${this.base}/admin/all`);
  }

  generateForOrder(orderId: string) {
    return this.http.post<Invoice>(`${this.base}/admin/order/${orderId}/generate`, {});
  }

  updateStatus(id: string, status: string) {
    return this.http.patch<void>(`${this.base}/${id}/status`, { status });
  }

  adminDownloadPdf(id: string) {
    return this.http.get(`${this.base}/admin/${id}/pdf`, { responseType: 'blob' });
  }

  confirmPayment(orderId: string, paymentIntentId?: string) {
    return this.http.post<Invoice>(
      `${environment.apiUrl}/payments/${orderId}/confirm`,
      { paymentIntentId: paymentIntentId ?? null }
    );
  }
}
