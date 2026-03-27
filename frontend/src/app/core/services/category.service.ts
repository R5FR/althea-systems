import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Category } from '../models';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/categories`;

  getAll() {
    return this.http.get<Category[]>(this.base);
  }

  getById(id: string) {
    return this.http.get<Category>(`${this.base}/${id}`);
  }

  getBySlug(slug: string) {
    return this.http.get<Category>(`${this.base}/slug/${slug}`);
  }

  // Admin
  create(dto: Partial<Category>) {
    return this.http.post<Category>(this.base, dto);
  }

  update(id: string, dto: Partial<Category>) {
    return this.http.put<Category>(`${this.base}/${id}`, dto);
  }

  delete(id: string) {
    return this.http.delete(`${this.base}/${id}`);
  }
}
