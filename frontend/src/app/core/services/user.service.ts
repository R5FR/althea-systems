import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, Address, PaymentMethod, UpdateProfileDto, CreateAddressDto } from '../models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private readonly base = `${environment.apiUrl}/users/me`;

  getProfile() {
    return this.http.get<User>(this.base);
  }

  updateProfile(dto: UpdateProfileDto) {
    return this.http.put<User>(this.base, dto).pipe(
      tap(u => this.auth.updateUserCache(u))
    );
  }

  // Addresses
  getAddresses() {
    return this.http.get<Address[]>(`${this.base}/addresses`);
  }

  addAddress(dto: CreateAddressDto) {
    return this.http.post<Address>(`${this.base}/addresses`, dto);
  }

  updateAddress(id: string, dto: Partial<CreateAddressDto>) {
    return this.http.put<Address>(`${this.base}/addresses/${id}`, dto);
  }

  deleteAddress(id: string) {
    return this.http.delete(`${this.base}/addresses/${id}`);
  }

  // Payment methods
  getPaymentMethods() {
    return this.http.get<PaymentMethod[]>(`${this.base}/payment-methods`);
  }

  addPaymentMethod(stripePaymentMethodId: string) {
    return this.http.post<PaymentMethod>(`${this.base}/payment-methods`, { stripePaymentMethodId });
  }

  deletePaymentMethod(id: string) {
    return this.http.delete(`${this.base}/payment-methods/${id}`);
  }

  setDefaultPaymentMethod(id: string) {
    return this.http.patch(`${this.base}/payment-methods/${id}/default`, {});
  }
}
