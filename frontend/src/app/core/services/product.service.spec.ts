import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ProductService } from './product.service';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('ProductService', () => {
  let service: ProductService;
  let http: HttpTestingController;

  const mockProduct = { id: '1', name: 'Produit Test', slug: 'produit-test', priceTtc: 120 };
  const mockPage = { items: [mockProduct], totalCount: 1, pageNumber: 1, pageSize: 10, totalPages: 1 };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ProductService],
    });
    service = TestBed.inject(ProductService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('search envoie un GET vers /api/products', () => {
    service.search({}).subscribe(res => {
      expect(res.items).toHaveLength(1);
    });
    const req = http.expectOne(r => r.url.includes('/products'));
    expect(req.request.method).toBe('GET');
    req.flush(mockPage);
  });

  it('getById envoie un GET vers /api/products/:id', () => {
    service.getById('1').subscribe(p => expect(p.id).toBe('1'));
    const req = http.expectOne(r => r.url.includes('/products/1'));
    expect(req.request.method).toBe('GET');
    req.flush(mockProduct);
  });

  it('getBySlug envoie un GET vers /api/products/slug/:slug', () => {
    service.getBySlug('produit-test').subscribe();
    const req = http.expectOne(r => r.url.includes('/products/slug/produit-test'));
    expect(req.request.method).toBe('GET');
    req.flush(mockProduct);
  });

  it('search transmet les paramètres de recherche', () => {
    service.search({ searchTerm: 'test', pageNumber: 2, pageSize: 5 }).subscribe();
    const req = http.expectOne(r => r.url.includes('/products'));
    expect(req.request.params.get('searchTerm')).toBe('test');
    expect(req.request.params.get('pageNumber')).toBe('2');
    req.flush(mockPage);
  });
});
