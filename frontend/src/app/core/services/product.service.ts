import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Product, ProductListItem, ProductSearchParams, PaginatedResult, CreateProductDto, UpdateProductDto } from '../models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/products`;

  getById(id: string) {
    return this.http.get<Product>(`${this.base}/${id}`);
  }

  getBySlug(slug: string) {
    return this.http.get<Product>(`${this.base}/slug/${slug}`);
  }

  getTop(limit = 8) {
    return this.http.get<ProductListItem[]>(`${this.base}/top/${limit}`);
  }

  search(params: ProductSearchParams) {
    let p = new HttpParams();
    const term = params.q ?? params.searchTerm;
    if (term)               p = p.set('searchTerm', term);
    if (params.categoryId)  p = p.set('categoryId', params.categoryId);
    if (params.minPrice != null) p = p.set('minPrice', params.minPrice.toString());
    if (params.maxPrice != null) p = p.set('maxPrice', params.maxPrice.toString());
    if (params.onlyAvailable) p = p.set('onlyAvailable', 'true');
    if (params.sortBy)      p = p.set('sortBy', params.sortBy);
    if (params.sortDir)     p = p.set('sortDir', params.sortDir);
    p = p.set('pageNumber', (params.page ?? params.pageNumber ?? 1).toString());
    p = p.set('pageSize',   (params.pageSize ?? 12).toString());
    return this.http.get<PaginatedResult<ProductListItem>>(`${this.base}`, { params: p });
  }

  getByCategory(categoryId: string, page = 1, pageSize = 12) {
    return this.search({ categoryId, pageNumber: page, pageSize });
  }

  // Admin
  create(dto: CreateProductDto) {
    return this.http.post<string>(`${this.base}`, dto);
  }

  update(id: string, dto: UpdateProductDto) {
    return this.http.put(`${this.base}/${id}`, dto);
  }

  delete(id: string) {
    return this.http.delete(`${this.base}/${id}`);
  }

  updateStock(id: string, quantity: number) {
    return this.http.patch(`${environment.apiUrl}/admin/products/${id}/stock`, { quantity });
  }
}
