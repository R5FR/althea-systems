import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { Category, ProductListItem, ProductSearchParams } from '../../core/models';

// ── Catalogue d'exemples (toutes catégories) ─────────────────────────────
const EXAMPLE_CATALOGUE: ProductListItem[] = [
  { id: 'e01', name: 'Échographe portable SonoMax Pro X7',            slug: 'echographe-sonomax-pro-x7',        priceTtc: 15990, priceHt: 13325, tvaRate: 20, stockQuantity: 3,  imageUrl: 'https://picsum.photos/seed/echo-x7/400/400',       badges: [{ type: 'new',    label: 'Nouveau' }],    categoryId: 'imagerie-medicale'  },
  { id: 'e02', name: 'Moniteur multiparamétrique CardioCare X5',       slug: 'moniteur-cardiocare-x5',           priceTtc: 8750,  priceHt: 7292,  tvaRate: 20, stockQuantity: 7,  imageUrl: 'https://picsum.photos/seed/cardiocare/400/400',     badges: [],                                           categoryId: 'monitoring'         },
  { id: 'e03', name: 'Défibrillateur HeartSave AED Pro 3000',          slug: 'defibrillateur-heartsave-aed',     priceTtc: 2290,  priceHt: 1908,  tvaRate: 20, stockQuantity: 12, imageUrl: 'https://picsum.photos/seed/heartsave/400/400',     badges: [{ type: 'promo',  label: 'Best-seller' }],  categoryId: 'cardiologie'        },
  { id: 'e04', name: 'Électrocardiographe 12 dérivations ECG Expert',  slug: 'ecg-expert-12-derivations',        priceTtc: 5490,  priceHt: 4575,  tvaRate: 20, stockQuantity: 5,  imageUrl: 'https://picsum.photos/seed/ecg-expert/400/400',    badges: [],                                           categoryId: 'cardiologie'        },
  { id: 'e05', name: 'Table d\'examen électrique MedLine Elite',       slug: 'table-examen-medline-elite',       priceTtc: 3450,  priceHt: 2875,  tvaRate: 20, stockQuantity: 2,  imageUrl: 'https://picsum.photos/seed/medline-table/400/400', badges: [],                                           categoryId: 'mobilier-medical'   },
  { id: 'e06', name: 'Autoclave de stérilisation SterilPro 22L',       slug: 'autoclave-sterilpro-22l',          priceTtc: 4190,  priceHt: 3492,  tvaRate: 20, stockQuantity: 4,  imageUrl: 'https://picsum.photos/seed/sterilpro/400/400',     badges: [{ type: 'custom', label: 'Certifié CE' }],   categoryId: 'sterilisation'      },
  { id: 'e07', name: 'Otoscope numérique DiagnosticPro HD',             slug: 'otoscope-diagnosticpro-hd',       priceTtc: 890,   priceHt: 742,   tvaRate: 20, stockQuantity: 18, imageUrl: 'https://picsum.photos/seed/otoscope-hd/400/400',   badges: [],                                           categoryId: 'diagnostic'         },
  { id: 'e08', name: 'Oxymètre de pouls professionnel OxyCheck',       slug: 'oxycheck-pro',                     priceTtc: 490,   priceHt: 408,   tvaRate: 20, stockQuantity: 30, imageUrl: 'https://picsum.photos/seed/oxycheck/400/400',      badges: [{ type: 'promo',  label: 'Promo' }],          categoryId: 'monitoring'         },
  { id: 'e09', name: 'Bistouri électrique ElectroCut Pro 300W',        slug: 'bistouri-electrocut-pro-300w',     priceTtc: 4490,  priceHt: 3742,  tvaRate: 20, stockQuantity: 4,  imageUrl: 'https://picsum.photos/seed/electrocut/400/400',    badges: [],                                           categoryId: 'chirurgie'          },
  { id: 'e10', name: 'Lampe opératoire LED SurgiLight 50000lux',       slug: 'lampe-operatoire-surgilight',      priceTtc: 8900,  priceHt: 7417,  tvaRate: 20, stockQuantity: 3,  imageUrl: 'https://picsum.photos/seed/surgilight/400/400',    badges: [{ type: 'new',    label: 'Nouveau' }],    categoryId: 'chirurgie'          },
  { id: 'e11', name: 'Lampe à fente SlitLamp Pro 900',                  slug: 'lampe-fente-slitlamp-pro-900',    priceTtc: 8490,  priceHt: 7075,  tvaRate: 20, stockQuantity: 3,  imageUrl: 'https://picsum.photos/seed/slitlamp/400/400',      badges: [],                                           categoryId: 'ophtalmologie'      },
  { id: 'e12', name: 'Réfractomètre automatique AutoRef 7000',         slug: 'refractometre-autoref-7000',       priceTtc: 6490,  priceHt: 5408,  tvaRate: 20, stockQuantity: 3,  imageUrl: 'https://picsum.photos/seed/autoref/400/400',       badges: [],                                           categoryId: 'ophtalmologie'      },
  { id: 'e13', name: 'Autoclave classe B SteriClass B 34L',             slug: 'autoclave-stericlass-b-34l',      priceTtc: 6990,  priceHt: 5825,  tvaRate: 20, stockQuantity: 3,  imageUrl: 'https://picsum.photos/seed/stericlass/400/400',    badges: [{ type: 'promo',  label: 'Best-seller' }],  categoryId: 'sterilisation'      },
  { id: 'e14', name: 'Fauteuil de prélèvement PhléboChair Pro',        slug: 'fauteuil-phlebochair-pro',         priceTtc: 2490,  priceHt: 2075,  tvaRate: 20, stockQuantity: 5,  imageUrl: 'https://picsum.photos/seed/phlebochair/400/400',   badges: [],                                           categoryId: 'mobilier-medical'   },
  { id: 'e15', name: 'Spiromètre numérique LungTest 3000',              slug: 'spirometre-lungtest-3000',         priceTtc: 2490,  priceHt: 2075,  tvaRate: 20, stockQuantity: 7,  imageUrl: 'https://picsum.photos/seed/lungtest/400/400',      badges: [],                                           categoryId: 'diagnostic'         },
  { id: 'e16', name: 'Holter ECG ambulatoire CardioHolter 24H',        slug: 'holter-ecg-cardioHolter-24h',      priceTtc: 3990,  priceHt: 3325,  tvaRate: 20, stockQuantity: 7,  imageUrl: 'https://picsum.photos/seed/cardio-holter/400/400', badges: [{ type: 'new',    label: 'Nouveau' }],    categoryId: 'cardiologie'        },
  { id: 'e17', name: 'Microscope clinique BioScope X400',               slug: 'microscope-bioscope-x400',        priceTtc: 4990,  priceHt: 4158,  tvaRate: 20, stockQuantity: 3,  imageUrl: 'https://picsum.photos/seed/bioscope/400/400',      badges: [],                                           categoryId: 'diagnostic'         },
  { id: 'e18', name: 'Chariot de soins MediCart 5 tiroirs',             slug: 'chariot-soins-medicart-5',        priceTtc: 1290,  priceHt: 1075,  tvaRate: 20, stockQuantity: 8,  imageUrl: 'https://picsum.photos/seed/medicart/400/400',      badges: [],                                           categoryId: 'mobilier-medical'   },
  { id: 'e19', name: 'Radiographie numérique DR-Panel Pro',             slug: 'radiographie-dr-panel-pro',       priceTtc: 34990, priceHt: 29158, tvaRate: 20, stockQuantity: 1,  imageUrl: 'https://picsum.photos/seed/dr-panel/400/400',      badges: [{ type: 'promo',  label: 'Best-seller' }],  categoryId: 'imagerie-medicale'  },
  { id: 'e20', name: 'Tonomètre à air non-contact AirTono 3',           slug: 'tonometre-airtono-3',             priceTtc: 4990,  priceHt: 4158,  tvaRate: 20, stockQuantity: 4,  imageUrl: 'https://picsum.photos/seed/airtono/400/400',       badges: [],                                           categoryId: 'ophtalmologie'      },
  { id: 'e21', name: 'Capnographe portable CO2-Guard 3000',             slug: 'capnographe-co2-guard-3000',      priceTtc: 3290,  priceHt: 2742,  tvaRate: 20, stockQuantity: 5,  imageUrl: 'https://picsum.photos/seed/co2guard/400/400',      badges: [],                                           categoryId: 'monitoring'         },
  { id: 'e22', name: 'Laveur-désinfecteur WashPro Dental 2 paniers',    slug: 'laveur-washpro-dental',           priceTtc: 8490,  priceHt: 7075,  tvaRate: 20, stockQuantity: 2,  imageUrl: 'https://picsum.photos/seed/washpro/400/400',       badges: [],                                           categoryId: 'sterilisation'      },
  { id: 'e23', name: 'Système vidéo-endoscopie 4K UltraVis',            slug: 'systeme-video-ultravis-4k',       priceTtc: 14500, priceHt: 12083, tvaRate: 20, stockQuantity: 2,  imageUrl: 'https://picsum.photos/seed/ultravis/400/400',      badges: [],                                           categoryId: 'chirurgie'          },
  { id: 'e24', name: 'Dermatoscope polarisé DermaScan 200x',            slug: 'dermatoscope-dermascan-200x',     priceTtc: 1290,  priceHt: 1075,  tvaRate: 20, stockQuantity: 10, imageUrl: 'https://picsum.photos/seed/dermascan/400/400',     badges: [],                                           categoryId: 'diagnostic'         },
];

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
  imports: [CommonModule, RouterLink, FormsModule, TranslatePipe],
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
                  <option [value]="cat.id">{{ cat.name }}</option>
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
            <div class="flex items-center gap-3">
              <select [(ngModel)]="sortValue" (ngModelChange)="onSortChange($event)" class="input-field text-sm py-2 w-auto">
                <option value="createdAt-desc">{{ 'search.sort_newest' | translate }}</option>
                <option value="price-asc">{{ 'search.sort_price_asc' | translate }}</option>
                <option value="price-desc">{{ 'search.sort_price_desc' | translate }}</option>
                <option value="name-asc">{{ 'search.sort_name_asc' | translate }}</option>
                <option value="name-desc">{{ 'search.sort_name_desc' | translate }}</option>
                <option value="availability-desc">{{ 'search.sort_availability' | translate }}</option>
              </select>
              <select [ngModel]="pageSize()" (ngModelChange)="onPageSizeChange($event)" class="input-field text-sm py-2 w-auto">
                <option [ngValue]="12">12 / page</option>
                <option [ngValue]="24">24 / page</option>
                <option [ngValue]="48">48 / page</option>
              </select>
              <!-- View toggle -->
              <div class="flex border border-gray-200 rounded-lg overflow-hidden">
                <button (click)="viewMode.set('grid')" [class.bg-primary]="viewMode()==='grid'" [class.text-white]="viewMode()==='grid'"
                  class="px-3 py-2 transition-colors hover:bg-gray-100">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
                </button>
                <button (click)="viewMode.set('list')" [class.bg-primary]="viewMode()==='list'" [class.text-white]="viewMode()==='list'"
                  class="px-3 py-2 transition-colors hover:bg-gray-100">
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
                        <img [src]="p.imageUrl" [alt]="p.name"
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
                      <p class="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-auto group-hover:text-primary transition-colors">{{ p.name }}</p>
                      <div class="mt-3 pt-3 border-t border-gray-50">
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
                        <img [src]="p.imageUrl" [alt]="p.name" class="w-full h-full object-contain p-2" />
                      } @else {
                        <svg class="w-8 h-8 text-white opacity-25" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 3H14V0H10V3H5C3.9 3 3 3.9 3 5V10H0V14H3V19C3 20.1 3.9 21 5 21H10V24H14V21H19C20.1 21 21 20.1 21 19V14H24V10H21V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z"/>
                        </svg>
                      }
                    </div>
                    <div class="flex-1 min-w-0">
                      <h3 class="font-semibold text-gray-900 mb-1 line-clamp-1">{{ p.name }}</h3>
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
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productSvc = inject(ProductService);
  private categorySvc = inject(CategoryService);

  products = signal<ProductListItem[]>([]);
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
        // If no results AND no active filter, show the full example catalogue
        if (data.length === 0 && !this.hasActiveFilters()) {
          this.useExampleCatalogue();
        } else {
          this.products.set(data);
          this.totalCount.set(res.pagination?.totalCount ?? res.total ?? data.length);
          this.loading.set(false);
        }
        this.syncUrlWithFilters();
      },
      error: () => {
        // Backend indisponible : afficher le catalogue d'exemples si pas de filtre actif
        if (!this.hasActiveFilters()) {
          this.useExampleCatalogue();
        } else {
          this.loading.set(false);
        }
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

  private useExampleCatalogue(): void {
    const [sortBy, sortDir] = this.sortValue.split('-');
    const sorted = this.sortProducts(EXAMPLE_CATALOGUE, sortBy, sortDir);
    const start = (this.page() - 1) * this.pageSize();
    const end = start + this.pageSize();
    this.products.set(sorted.slice(start, end));
    this.totalCount.set(EXAMPLE_CATALOGUE.length);
    this.loading.set(false);
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
