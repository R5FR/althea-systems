import { Component, OnInit, effect, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { TranslationApiService } from '../../core/services/translation-api.service';
import { TranslateDynamicPipe } from '../../shared/pipes/translate-dynamic.pipe';
import { Category, ProductListItem, ProductSearchParams } from '../../core/models';


const PRODUCT_GRADIENTS = [
  'linear-gradient(135deg,#0094A0,#00A8B5)',
  'linear-gradient(135deg,#003D5C,#003D5C)',
  'linear-gradient(135deg,#0094A0,#00A8B5)',
  'linear-gradient(135deg,#1E3A5F,#2C4A6E)',
  'linear-gradient(135deg,#003D5C,#0094A0)',
  'linear-gradient(135deg,#00A8B5,#33BFC9)',
  'linear-gradient(135deg,#004D74,#004D74)',
  'linear-gradient(135deg,#0094A0,#00A8B5)',
];

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslatePipe, TranslateDynamicPipe],
  template: `
    <div class="page-container py-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">
        @if (params.searchTerm) { {{ 'search.title_results' | translate }} {{ params.searchTerm }} » }
        @else { {{ 'search.title_catalog' | translate }} }
      </h1>

      <div class="flex flex-col lg:flex-row gap-6">

        <!-- ── Filters sidebar ────────────────────────────────────── -->
        <aside class="lg:w-64 flex-shrink-0">
          <div class="card p-5 space-y-6">
            <h2 class="font-semibold text-gray-900">{{ 'search.filters_title' | translate }}</h2>

            <!-- Keyword -->
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1.5">{{ 'search.filter_search' | translate }}</label>
              <input [(ngModel)]="params.searchTerm" (ngModelChange)="onSearchChange($event)"
                type="search" [placeholder]="'search.filter_search_placeholder' | translate" class="input-field text-sm" />
            </div>

            <!-- Categories -->
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1.5">{{ 'search.filter_category' | translate }}</label>
              <select [(ngModel)]="params.categoryId" (ngModelChange)="onFiltersChange()" class="input-field text-sm">
                <option value="">{{ 'search.filter_category_all' | translate }}</option>
                @for (cat of categories(); track cat.id) {
                  <option [value]="cat.id">{{ cat.name | translateDynamic }}</option>
                }
              </select>
            </div>

            <!-- Price range -->
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1.5">{{ 'search.filter_price' | translate }}</label>
              <div class="flex gap-2 items-center">
                <input [(ngModel)]="params.minPrice" (ngModelChange)="onFiltersChange()" type="number" min="0" [placeholder]="'search.filter_price_min' | translate" class="input-field text-sm w-full" />
                <span class="text-gray-400 flex-shrink-0">–</span>
                <input [(ngModel)]="params.maxPrice" (ngModelChange)="onFiltersChange()" type="number" min="0" [placeholder]="'search.filter_price_max' | translate" class="input-field text-sm w-full" />
              </div>
            </div>

            <!-- Only available -->
            <label class="flex items-center gap-2.5 cursor-pointer group">
              <input [(ngModel)]="params.onlyAvailable" (ngModelChange)="onFiltersChange()" type="checkbox"
                class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
              <span class="text-sm text-gray-700 group-hover:text-gray-900">{{ 'search.filter_available' | translate }}</span>
            </label>

            <button (click)="resetFilters()" class="w-full btn-ghost text-sm text-gray-500">
              {{ 'search.reset_filters' | translate }}
            </button>
          </div>
        </aside>

        <!-- ── Results ────────────────────────────────────────────── -->
        <div class="flex-1 min-w-0">
          <!-- Sort + count bar -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
            <p class="text-sm text-gray-600">
              @if (loading()) { {{ 'search.loading' | translate }} }
              @else { <span class="font-semibold">{{ totalCount() }}</span> {{ totalCount() === 1 ? ('catalog.products_count_singular' | translate) : ('catalog.products_count_plural' | translate) }} }
            </p>
            <div class="flex items-center gap-2">
              <!-- Sort select -->
              <div class="relative">
                <select [(ngModel)]="sortValue" (ngModelChange)="onSortChange($event)"
                  class="bg-none h-9 pl-3 pr-8 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 font-medium cursor-pointer transition-colors hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option value="createdAt-desc">{{ 'search.sort_newest' | translate }}</option>
                  <option value="price-asc">{{ 'search.sort_price_asc' | translate }}</option>
                  <option value="price-desc">{{ 'search.sort_price_desc' | translate }}</option>
                  <option value="name-asc">{{ 'search.sort_name_asc' | translate }}</option>
                  <option value="name-desc">{{ 'search.sort_name_desc' | translate }}</option>
                  <option value="availability-desc">{{ 'search.sort_availability' | translate }}</option>
                </select>
                <svg class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
              <!-- Page size select -->
              <div class="relative">
                <select [ngModel]="pageSize()" (ngModelChange)="onPageSizeChange($event)"
                  class="bg-none h-9 pl-3 pr-8 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 font-medium cursor-pointer transition-colors hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option [ngValue]="12">12 / page</option>
                  <option [ngValue]="24">24 / page</option>
                  <option [ngValue]="48">48 / page</option>
                </select>
                <svg class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
              <!-- Separator -->
              <div class="w-px h-5 bg-gray-200 hidden sm:block"></div>
              <!-- View toggle — segmented control -->
              <div class="flex h-9 items-center bg-gray-100 rounded-lg p-0.5">
                <button (click)="viewMode.set('grid')"
                  [attr.aria-pressed]="viewMode()==='grid'"
                  [attr.aria-label]="'search.view_grid' | translate"
                  class="w-8 h-8 rounded-md flex items-center justify-center transition-all duration-150"
                  [class.bg-white]="viewMode()==='grid'"
                  [class.shadow-sm]="viewMode()==='grid'"
                  [class.text-primary]="viewMode()==='grid'"
                  [class.text-gray-400]="viewMode()!=='grid'">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
                </button>
                <button (click)="viewMode.set('list')"
                  [attr.aria-pressed]="viewMode()==='list'"
                  [attr.aria-label]="'search.view_list' | translate"
                  class="w-8 h-8 rounded-md flex items-center justify-center transition-all duration-150"
                  [class.bg-white]="viewMode()==='list'"
                  [class.shadow-sm]="viewMode()==='list'"
                  [class.text-primary]="viewMode()==='list'"
                  [class.text-gray-400]="viewMode()!=='list'">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/></svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Products -->
          @if (loading()) {
            <div [class]="viewMode()==='grid' ? 'grid grid-cols-2 sm:grid-cols-3 gap-4' : 'space-y-3'">
              @for (_ of [1,2,3,4,5,6]; track $index) {
                <div class="card p-4"><div class="skeleton aspect-square mb-3 rounded-lg"></div><div class="skeleton h-4 w-3/4 mb-2"></div><div class="skeleton h-4 w-1/2"></div></div>
              }
            </div>
          } @else if (products().length === 0) {
            <div class="text-center py-20">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <p class="text-gray-500 text-lg font-medium mb-2">{{ 'search.no_results' | translate }}</p>
              <p class="text-gray-400 text-sm">{{ 'search.no_results_hint' | translate }}</p>
              <button (click)="resetFilters()" class="btn-secondary mt-4">{{ 'search.reset' | translate }}</button>
            </div>
          } @else {
            <!-- Grid view -->
            @if (viewMode() === 'grid') {
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                @for (p of products(); track p.id; let i = $index) {
                  <a [routerLink]="['/produits', p.slug]" class="card-hover group flex flex-col">
                    <div class="relative overflow-hidden rounded-t-xl" style="aspect-ratio:1;">
                      @if (p.imageUrl) {
                        <img [src]="p.imageUrl" [alt]="tName(p)"
                          class="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105" />
                      } @else {
                        <div class="absolute inset-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
                          [style.background]="getGradient(i)">
                          <svg class="w-14 h-14 text-white opacity-[0.18]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 3H14V0H10V3H5C3.9 3 3 3.9 3 5V10H0V14H3V19C3 20.1 3.9 21 5 21H10V24H14V21H19C20.1 21 21 20.1 21 19V14H24V10H21V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z"/>
                          </svg>
                        </div>
                      }
                      @if (p.badges?.length) {
                        <div class="absolute top-2 left-2 flex flex-col gap-1">
                          @for (b of p.badges!; track b.label) {
                            <span class="badge badge-promo">{{ b.label }}</span>
                          }
                        </div>
                      }
                      @if (p.stockQuantity === 0) {
                        <div class="absolute inset-0 bg-white/75 flex items-center justify-center">
                          <span class="badge badge-danger">{{ 'search.stock_out' | translate }}</span>
                        </div>
                      } @else if (p.stockQuantity <= 5) {
                        <span class="absolute top-2 right-2 badge badge-warning">{{ 'search.stock_limited' | translate }}</span>
                      }
                    </div>
                    <div class="p-4 flex-1 flex flex-col">
                      <p class="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-auto group-hover:text-primary transition-colors">{{ tName(p) }}</p>
                      <div class="mt-3 pt-3 border-t border-gray-100">
                        <p class="text-primary font-bold">{{ p.priceTtc | number:'1.2-2' }} € <span class="text-xs font-normal text-gray-400">{{ 'product.price_ttc' | translate }}</span></p>
                        <p class="text-gray-400 text-xs">{{ p.priceHt | number:'1.2-2' }} € {{ 'product.price_ht' | translate }}</p>
                      </div>
                    </div>
                  </a>
                }
              </div>
            }
            <!-- List view -->
            @if (viewMode() === 'list') {
              <div class="space-y-3">
                @for (p of products(); track p.id; let i = $index) {
                  <a [routerLink]="['/produits', p.slug]" class="card flex gap-4 p-4 hover:shadow-md transition-shadow">
                    <div class="w-24 h-24 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center"
                      [style.background]="p.imageUrl ? 'transparent' : getGradient(i)">
                      @if (p.imageUrl) {
                        <img [src]="p.imageUrl" [alt]="tName(p)" class="w-full h-full object-contain p-2" />
                      } @else {
                        <svg class="w-8 h-8 text-white opacity-25" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 3H14V0H10V3H5C3.9 3 3 3.9 3 5V10H0V14H3V19C3 20.1 3.9 21 5 21H10V24H14V21H19C20.1 21 21 20.1 21 19V14H24V10H21V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z"/>
                        </svg>
                      }
                    </div>
                    <div class="flex-1 min-w-0">
                      <h3 class="font-semibold text-gray-900 mb-1 line-clamp-1">{{ tName(p) }}</h3>
                      <div class="flex items-center gap-4">
                        <div>
                          <span class="text-primary font-bold">{{ p.priceTtc | number:'1.2-2' }} € {{ 'product.price_ttc' | translate }}</span>
                          <span class="text-gray-400 text-sm ml-2">{{ p.priceHt | number:'1.2-2' }} € {{ 'product.price_ht' | translate }}</span>
                        </div>
                        @if (p.stockQuantity === 0) {
                          <span class="badge-danger badge text-xs">{{ 'search.stock_out' | translate }}</span>
                        } @else if (p.stockQuantity <= 5) {
                          <span class="badge-warning badge text-xs">{{ 'search.stock_limited' | translate }}</span>
                        }
                      </div>
                    </div>
                    <svg class="w-5 h-5 text-gray-400 self-center flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </a>
                }
              </div>
            }
          }

          <!-- Pagination -->
          @if (totalPages() > 1) {
            <div class="flex items-center justify-center gap-2 mt-10">
              <button [disabled]="page() === 1" (click)="changePage(page() - 1)" class="btn-ghost disabled:opacity-40 p-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
              </button>
              @for (p of pageNumbers(); track p) {
                <button (click)="changePage(p)"
                  class="w-9 h-9 rounded-lg text-sm font-medium transition-colors"
                  [class.bg-primary]="p === page()" [class.text-white]="p === page()"
                  [class.hover:bg-gray-100]="p !== page()">{{ p }}</button>
              }
              <button [disabled]="page() === totalPages()" (click)="changePage(page() + 1)" class="btn-ghost disabled:opacity-40 p-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class SearchComponent implements OnInit {
  private route          = inject(ActivatedRoute);
  private router         = inject(Router);
  private productSvc     = inject(ProductService);
  private categorySvc    = inject(CategoryService);
  private translateService = inject(TranslateService);
  private translationApi   = inject(TranslationApiService);

  products = signal<ProductListItem[]>([]);
  /** id → translated name (only populated when lang != 'fr') */
  translatedNames = signal<Record<string, string>>({});

  constructor() {
    // Re-translate whenever the product list changes
    effect(() => {
      const prods = this.products();
      void this.translateProductNames(prods);
    });
  }

  private async translateProductNames(prods: ProductListItem[]) {
    const lang = this.translateService.currentLang || 'fr';
    if (lang === 'fr' || prods.length === 0) { this.translatedNames.set({}); return; }
    const translated = await this.translationApi.translateBatch(prods.map(p => p.name), 'fr', lang);
    const map: Record<string, string> = {};
    prods.forEach((p, i) => { map[p.id] = translated[i]; });
    this.translatedNames.set(map);
  }

  /** Convenience used in template */
  tName(p: ProductListItem): string {
    return this.translatedNames()[p.id] ?? p.name;
  }
  categories = signal<Category[]>([]);
  loading = signal(false);
  viewMode = signal<'grid' | 'list'>('grid');
  sortValue = 'createdAt-desc';
  page = signal(1);
  pageSize = signal(12);
  totalCount = signal(0);
  totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize()));
  pageNumbers = computed(() => {
    const total = this.totalPages();
    if (total <= 0) return [];
    const current = Math.min(Math.max(1, this.page()), total);
    const windowSize = 5;
    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  params: ProductSearchParams = {};
  private searchSubject = new Subject<string>();
  private syncingFromUrl = false;

  ngOnInit() {
    this.categorySvc.getAll().subscribe({ next: c => this.categories.set(c), error: () => {} });
    this.translateService.onLangChange.subscribe(() => void this.translateProductNames(this.products()));

    // Fuzzy search with debounce
    this.searchSubject.pipe(
      debounceTime(200),
      distinctUntilChanged(),
    ).subscribe(() => this.applyFilters());

    // Read query params
    this.route.queryParams.subscribe(qp => {
      const nextParams: ProductSearchParams = {
        searchTerm: qp['q'] || '',
        categoryId: qp['cat'] || '',
        minPrice: this.parseNumberParam(qp['min']),
        maxPrice: this.parseNumberParam(qp['max']),
        onlyAvailable: qp['avail'] === 'true',
      };
      const nextSort = qp['sort'] || 'createdAt-desc';
      const nextPage = this.parsePositiveIntParam(qp['page']) || 1;
      const nextPageSize = this.parsePositiveIntParam(qp['ps']) || 12;

      const hasChanged =
        this.params.searchTerm !== nextParams.searchTerm ||
        this.params.categoryId !== nextParams.categoryId ||
        this.params.minPrice !== nextParams.minPrice ||
        this.params.maxPrice !== nextParams.maxPrice ||
        this.params.onlyAvailable !== nextParams.onlyAvailable ||
        this.sortValue !== nextSort ||
        this.page() !== nextPage ||
        this.pageSize() !== nextPageSize;

      this.params = nextParams;
      this.sortValue = nextSort;
      this.page.set(nextPage);
      this.pageSize.set(nextPageSize);

      if (hasChanged || this.products().length === 0) {
        this.syncingFromUrl = true;
        this.applyFilters();
      }
    });
  }

  onSearchChange(term: string) {
    this.page.set(1);
    this.searchSubject.next(term);
  }

  onFiltersChange() {
    this.page.set(1);
    this.applyFilters();
  }

  onSortChange(value: string) {
    this.sortValue = value;
    this.page.set(1);
    this.applyFilters();
  }

  onPageSizeChange(value: number | string) {
    const pageSize = this.parsePositiveIntParam(value) || 12;
    this.pageSize.set(pageSize);
    this.page.set(1);
    this.applyFilters();
  }

  applyFilters() {
    const [sortBy, sortDir] = this.sortValue.split('-');
    this.loading.set(true);
    this.productSvc.search({
      ...this.params,
      sortBy: sortBy as any,
      sortDir: sortDir as any,
      pageNumber: this.page(),
      pageSize: this.pageSize(),
    }).subscribe({
      next: res => {
        const data: ProductListItem[] = res.data ?? [];
        this.products.set(data);
        this.totalCount.set(res.pagination?.totalCount ?? res.total ?? data.length);
        this.loading.set(false);
        this.syncUrlWithFilters();
      },
      error: () => {
        this.products.set([]);
        this.totalCount.set(0);
        this.loading.set(false);
      }
    });
  }

  changeSort(event: Event) {
    this.onSortChange((event.target as HTMLSelectElement).value);
  }

  changePage(p: number) {
    const total = this.totalPages();
    const next = Math.min(Math.max(1, p), Math.max(1, total));
    if (next === this.page()) return;
    this.page.set(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.applyFilters();
  }

  resetFilters() {
    this.params = {};
    this.sortValue = 'createdAt-desc';
    this.pageSize.set(12);
    this.page.set(1);
    this.applyFilters();
  }

  private hasActiveFilters(): boolean {
    return !!(this.params.searchTerm || this.params.categoryId || this.params.minPrice || this.params.maxPrice || this.params.onlyAvailable);
  }

private sortProducts(products: ProductListItem[], sortBy?: string, sortDir?: string): ProductListItem[] {
    const direction = sortDir === 'desc' ? -1 : 1;
    const toTimestamp = (value: unknown): number => {
      if (typeof value !== 'string' && typeof value !== 'number' && !(value instanceof Date)) return 0;
      const ts = new Date(value).getTime();
      return Number.isNaN(ts) ? 0 : ts;
    };

    return [...products].sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return ((a.priceTtc ?? 0) - (b.priceTtc ?? 0)) * direction;
        case 'name':
          return a.name.localeCompare(b.name) * direction;
        case 'availability':
          return (((a.stockQuantity ?? 0) - (b.stockQuantity ?? 0)) * direction);
        case 'createdAt': {
          const aTs = toTimestamp((a as any).createdAt);
          const bTs = toTimestamp((b as any).createdAt);
          return (aTs - bTs) * direction;
        }
        default:
          return 0;
      }
    });
  }

  private syncUrlWithFilters(): void {
    if (this.syncingFromUrl) {
      this.syncingFromUrl = false;
      return;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.params.searchTerm || null,
        cat: this.params.categoryId || null,
        min: this.params.minPrice ?? null,
        max: this.params.maxPrice ?? null,
        avail: this.params.onlyAvailable ? 'true' : null,
        sort: this.sortValue !== 'createdAt-desc' ? this.sortValue : null,
        page: this.page() > 1 ? this.page() : null,
        ps: this.pageSize() !== 12 ? this.pageSize() : null,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private parseNumberParam(value: unknown): number | undefined {
    if (value == null || value === '') return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private parsePositiveIntParam(value: unknown): number | undefined {
    if (value == null || value === '') return undefined;
    const parsed = Number.parseInt(String(value), 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
  }

  getGradient(index: number): string {
    return PRODUCT_GRADIENTS[index % PRODUCT_GRADIENTS.length];
  }
}
