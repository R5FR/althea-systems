import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CategoryService } from './category.service';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('CategoryService', () => {
  let service: CategoryService;
  let http: HttpTestingController;

  const mockCategories = [
    { id: '1', name: 'Électronique', slug: 'electronique' },
    { id: '2', name: 'Vêtements', slug: 'vetements' },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), CategoryService],
    });
    service = TestBed.inject(CategoryService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('getAll envoie un GET vers /api/categories', () => {
    service.getAll().subscribe(cats => {
      expect(cats).toHaveLength(2);
    });
    http.expectOne(r => r.url.includes('/categories') && r.method === 'GET').flush(mockCategories);
  });

  it('getBySlug envoie un GET vers /api/categories/slug/:slug', () => {
    service.getBySlug('electronique').subscribe();
    const req = http.expectOne(r => r.url.includes('/categories/slug/electronique'));
    expect(req.request.method).toBe('GET');
    req.flush(mockCategories[0]);
  });

  it('getById envoie un GET vers /api/categories/:id', () => {
    service.getById('1').subscribe();
    const req = http.expectOne(r => r.url.includes('/categories/1'));
    expect(req.request.method).toBe('GET');
    req.flush(mockCategories[0]);
  });

  it('create envoie un POST vers /api/categories', () => {
    const dto = { name: 'Nouvelle', slug: 'nouvelle' };
    service.create(dto).subscribe();
    const req = http.expectOne(r => r.url.includes('/categories') && r.method === 'POST');
    expect(req.request.body).toEqual(dto);
    req.flush({ id: '3', ...dto });
  });

  it('update envoie un PUT vers /api/categories/:id', () => {
    const dto = { name: 'Modifiée' };
    service.update('1', dto).subscribe();
    const req = http.expectOne(r => r.url.includes('/categories/1') && r.method === 'PUT');
    expect(req.request.body).toEqual(dto);
    req.flush({ id: '1', ...dto });
  });

  it('delete envoie un DELETE vers /api/categories/:id', () => {
    service.delete('1').subscribe();
    const req = http.expectOne(r => r.url.includes('/categories/1') && r.method === 'DELETE');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
