import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { AdminService } from '../../../core/services/admin.service';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { HomepageConfig, ProductListItem, Category } from '../../../core/models';
import { environment } from '../../../../environments/environment';

interface SlideState {
  dragOver: boolean;
  uploading: boolean;
  uploadError: string;
  productSearch: string;
  productResults: ProductListItem[];
  productOpen: boolean;
  selectedProductName: string;
  searchTimer: ReturnType<typeof setTimeout> | null;
}

const emptySlideState = (): SlideState => ({
  dragOver: false, uploading: false, uploadError: '',
  productSearch: '', productResults: [], productOpen: false,
  selectedProductName: '', searchTimer: null,
});

@Component({
  selector: 'app-homepage-config',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslatePipe],
  template: `
    <div class="space-y-6 max-w-4xl">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">{{ 'admin.homepage_title' | translate }}</h1>
        <button (click)="save()" [disabled]="saving()" class="btn-primary">
          @if (saving()) { <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-1.5"></span> }
          {{ 'admin.save' | translate }}
        </button>
      </div>

      @if (saveSuccess()) {
        <p class="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 flex items-center gap-2">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          {{ 'admin.homepage_save_success' | translate }}
        </p>
      }
      @if (error()) {
        <p class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">{{ error() }}</p>
      }

      @if (loading()) {
        <div class="space-y-4">@for (_ of [1,2,3]; track $index) { <div class="card p-6 skeleton h-40"></div> }</div>
      } @else {

        <form [formGroup]="form" class="space-y-6">

          <!-- ── Carousel ─────────────────────────────────────────── -->
          <div class="card p-6 space-y-5">
            <div class="flex items-center justify-between">
              <h2 class="font-semibold text-gray-900">{{ 'admin.homepage_carousel_title' | translate }}</h2>
              <button type="button" (click)="addSlide()" class="btn-ghost text-sm">
                {{ 'admin.homepage_add_slide' | translate }}
              </button>
            </div>

            <div formArrayName="carouselSlides" class="space-y-6">
              @for (slide of slidesArray.controls; track $index) {
                <div [formGroupName]="$index" class="border border-gray-200 rounded-xl overflow-hidden">

                  <!-- Slide header bar -->
                  <div class="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                    <span class="text-sm font-semibold text-gray-700">{{ 'admin.homepage_slide_label' | translate }} {{ $index + 1 }}</span>
                    <button type="button" (click)="removeSlide($index)"
                      class="text-red-400 hover:text-red-600 text-xs btn-ghost px-2 py-1">
                      {{ 'admin.homepage_slide_delete' | translate }}
                    </button>
                  </div>

                  <div class="p-5 space-y-4 bg-white">

                    <!-- Image upload zone -->
                    <div>
                      <label class="block text-xs font-medium text-gray-600 mb-2">{{ 'admin.homepage_slide_image' | translate }}</label>
                      @if (slide.get('imageUrl')?.value && !slideStates[$index].uploading) {
                        <div class="relative rounded-xl overflow-hidden group">
                          <img [src]="slide.get('imageUrl')?.value" class="w-full h-44 object-cover" />
                          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end justify-end p-3">
                            <button type="button" (click)="slide.get('imageUrl')?.setValue('')"
                              class="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-black/80">
                              {{ 'admin.homepage_slide_image_change' | translate }}
                            </button>
                          </div>
                        </div>
                      } @else {
                        <div class="relative border-2 border-dashed rounded-xl transition-colors"
                          [class]="slideStates[$index].dragOver ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/40'"
                          (dragover)="onSlideDragOver($event, $index)"
                          (dragleave)="slideStates[$index].dragOver = false"
                          (drop)="onSlideDrop($event, $index)">
                          <input type="file" accept="image/*"
                            class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            (change)="onSlideFileInput($event, $index)" />
                          @if (slideStates[$index].uploading) {
                            <div class="flex items-center justify-center gap-3 py-8">
                              <div class="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                              <span class="text-sm text-gray-500">Envoi en cours...</span>
                            </div>
                          } @else {
                            <div class="flex flex-col items-center gap-2 py-7 pointer-events-none">
                              <svg class="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                              </svg>
                              <p class="text-sm text-gray-500">{{ 'admin.product_form_image_drop' | translate }} <span class="text-primary font-medium">{{ 'admin.product_form_image_browse' | translate }}</span></p>
                              <p class="text-xs text-gray-400">{{ 'admin.product_form_image_formats' | translate }}</p>
                            </div>
                          }
                        </div>
                        @if (slideStates[$index].uploadError) {
                          <p class="text-xs text-red-500 mt-1">{{ slideStates[$index].uploadError }}</p>
                        }
                      }
                    </div>

                    <!-- Link type selector -->
                    <div>
                      <label class="block text-xs font-medium text-gray-600 mb-2">{{ 'admin.homepage_slide_link_type' | translate }}</label>
                      <div class="flex gap-2 flex-wrap">
                        @for (opt of linkTypeOpts; track opt.value) {
                          <button type="button" (click)="setLinkType($index, opt.value)"
                            class="px-3.5 py-1.5 text-xs font-medium rounded-lg border transition-colors"
                            [class]="slide.get('linkType')?.value === opt.value
                              ? 'bg-primary text-white border-primary shadow-sm'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-primary/40'">
                            {{ opt.label | translate }}
                          </button>
                        }
                      </div>

                      <!-- Product picker -->
                      @if (slide.get('linkType')?.value === 'product') {
                        <div class="mt-2 relative">
                          <input [(ngModel)]="slideStates[$index].productSearch"
                            [ngModelOptions]="{standalone: true}"
                            (input)="searchSlideProducts($index)"
                            (blur)="onSlideSearchBlur($index)"
                            class="input-field text-sm"
                            [placeholder]="'admin.homepage_slide_search_product' | translate" />
                          @if (slideStates[$index].productOpen && slideStates[$index].productResults.length > 0) {
                            <div class="absolute z-20 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-52 overflow-y-auto">
                              @for (p of slideStates[$index].productResults; track p.id) {
                                <button type="button" (mousedown)="selectSlideProduct($index, p)"
                                  class="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 text-left border-b border-gray-50 last:border-0">
                                  @if (p.imageUrl) {
                                    <img [src]="p.imageUrl" class="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                                  } @else {
                                    <div class="w-9 h-9 rounded-lg bg-gray-100 flex-shrink-0"></div>
                                  }
                                  <div class="flex-1 min-w-0">
                                    <p class="text-sm font-medium text-gray-900 truncate">{{ p.name }}</p>
                                    <p class="text-xs text-gray-400">{{ p.priceTtc | number:'1.2-2' }} €</p>
                                  </div>
                                  @if (p.reference) {
                                    <span class="text-xs text-gray-300 font-mono flex-shrink-0">{{ p.reference }}</span>
                                  }
                                </button>
                              }
                            </div>
                          }
                          @if (slideStates[$index].selectedProductName) {
                            <p class="text-xs text-primary font-medium mt-1.5 flex items-center gap-1">
                              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                              {{ slideStates[$index].selectedProductName }}
                            </p>
                          }
                        </div>
                      }

                      <!-- Category picker -->
                      @if (slide.get('linkType')?.value === 'category') {
                        <select formControlName="categoryId" class="input-field text-sm mt-2"
                          (change)="onSlideCategoryChange($index)">
                          <option value="">{{ 'admin.homepage_slide_select_category' | translate }}</option>
                          @for (cat of allCategories; track cat.id) {
                            <option [value]="cat.id">{{ cat.name }}</option>
                          }
                        </select>
                      }

                      <!-- Custom URL -->
                      @if (slide.get('linkType')?.value === 'custom') {
                        <input formControlName="ctaLink" class="input-field text-sm mt-2"
                          [placeholder]="'admin.homepage_slide_cta_link_placeholder' | translate" />
                      }
                    </div>

                    <!-- Title / Subtitle / CTA text -->
                    <div class="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'admin.homepage_slide_title' | translate }}</label>
                        <input formControlName="title" class="input-field text-sm" />
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'admin.homepage_slide_subtitle' | translate }}</label>
                        <input formControlName="subtitle" class="input-field text-sm" />
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'admin.homepage_slide_cta_text' | translate }}</label>
                        <input formControlName="ctaText" class="input-field text-sm"
                          [placeholder]="'admin.homepage_slide_cta_text_placeholder' | translate" />
                      </div>
                    </div>

                  </div>
                </div>
              }

              @if (slidesArray.length === 0) {
                <p class="text-sm text-gray-400 text-center py-6">{{ 'admin.homepage_no_slides' | translate }}</p>
              }
            </div>
          </div>

          <!-- ── Featured text ────────────────────────────────────── -->
          <div class="card p-6 space-y-4">
            <h2 class="font-semibold text-gray-900">{{ 'admin.homepage_featured_text_title' | translate }}</h2>
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ 'admin.homepage_featured_title_label' | translate }}</label>
                <input formControlName="featuredTitle" class="input-field"
                  [placeholder]="'admin.homepage_featured_title_placeholder' | translate" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ 'admin.homepage_featured_text_label' | translate }}</label>
                <textarea formControlName="featuredText" rows="3" class="input-field resize-none"></textarea>
              </div>
            </div>
          </div>

        </form>

        <!-- ── Featured products (outside reactive form) ──────────── -->
        <div class="card p-6 space-y-4">
          <div>
            <h2 class="font-semibold text-gray-900">{{ 'admin.homepage_featured_products_title' | translate }}</h2>
            <p class="text-xs text-gray-500 mt-0.5">{{ 'admin.homepage_featured_products_desc' | translate }}</p>
          </div>

          <!-- Search input -->
          <div class="relative">
            <input [(ngModel)]="featuredProductSearch"
              (input)="searchFeaturedProducts()"
              (blur)="onFeaturedSearchBlur()"
              class="input-field text-sm"
              [placeholder]="'admin.homepage_featured_search_placeholder' | translate" />
            @if (featuredProductOpen && featuredProductResults.length > 0) {
              <div class="absolute z-20 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-60 overflow-y-auto">
                @for (p of featuredProductResults; track p.id) {
                  @if (!isFeatured(p.id)) {
                    <button type="button" (mousedown)="addFeaturedProduct(p)"
                      class="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 text-left border-b border-gray-50 last:border-0">
                      @if (p.imageUrl) {
                        <img [src]="p.imageUrl" class="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                      } @else {
                        <div class="w-9 h-9 rounded-lg bg-gray-100 flex-shrink-0"></div>
                      }
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900 truncate">{{ p.name }}</p>
                        <p class="text-xs text-gray-400">{{ p.priceTtc | number:'1.2-2' }} €</p>
                      </div>
                      <span class="text-primary text-xs font-semibold flex-shrink-0">
                        {{ 'admin.homepage_featured_add' | translate }}
                      </span>
                    </button>
                  }
                }
              </div>
            }
          </div>

          <!-- Selected list -->
          <div class="space-y-2">
            @for (p of featuredProductsList; track p.id; let i = $index) {
              <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 group">
                @if (p.imageUrl) {
                  <img [src]="p.imageUrl" class="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                } @else {
                  <div class="w-10 h-10 rounded-lg bg-gray-200 flex-shrink-0"></div>
                }
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ p.name }}</p>
                  <p class="text-xs text-gray-400">{{ p.priceTtc | number:'1.2-2' }} €{{ p.reference ? ' · ' + p.reference : '' }}</p>
                </div>
                <div class="flex items-center gap-0.5 opacity-50 group-hover:opacity-100 transition-opacity">
                  <button type="button" (click)="moveFeatured(i, -1)" [disabled]="i === 0"
                    class="p-1.5 text-gray-500 hover:text-gray-800 disabled:opacity-20 hover:bg-gray-200 rounded-lg transition-colors">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7"/></svg>
                  </button>
                  <button type="button" (click)="moveFeatured(i, 1)" [disabled]="i === featuredProductsList.length - 1"
                    class="p-1.5 text-gray-500 hover:text-gray-800 disabled:opacity-20 hover:bg-gray-200 rounded-lg transition-colors">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
                  </button>
                  <button type="button" (click)="removeFeaturedProduct(i)"
                    class="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg ml-1 transition-colors">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              </div>
            }
            @if (featuredProductsList.length === 0) {
              <p class="text-sm text-gray-400 text-center py-4">{{ 'admin.homepage_featured_empty' | translate }}</p>
            }
          </div>
        </div>

        <!-- ── Category order ────────────────────────────────────── -->
        <div class="card p-6 space-y-4">
          <div>
            <h2 class="font-semibold text-gray-900">{{ 'admin.homepage_category_order_title' | translate }}</h2>
            <p class="text-xs text-gray-500 mt-0.5">{{ 'admin.homepage_category_order_desc' | translate }}</p>
          </div>

          <div class="space-y-2">
            @for (cat of orderedCategories; track cat.id; let i = $index) {
              <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 group">
                <span class="text-xs font-mono text-gray-300 w-5 text-center flex-shrink-0">{{ i + 1 }}</span>
                @if (cat.imageUrl) {
                  <img [src]="cat.imageUrl" class="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                } @else {
                  <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>
                    </svg>
                  </div>
                }
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900">{{ cat.name }}</p>
                  <p class="text-xs text-gray-400">{{ cat.productCount ?? 0 }} produit(s)</p>
                </div>
                <div class="flex items-center gap-0.5 opacity-50 group-hover:opacity-100 transition-opacity">
                  <button type="button" (click)="moveCat(i, -1)" [disabled]="i === 0"
                    class="p-1.5 text-gray-500 hover:text-gray-800 disabled:opacity-20 hover:bg-gray-200 rounded-lg transition-colors">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7"/></svg>
                  </button>
                  <button type="button" (click)="moveCat(i, 1)" [disabled]="i === orderedCategories.length - 1"
                    class="p-1.5 text-gray-500 hover:text-gray-800 disabled:opacity-20 hover:bg-gray-200 rounded-lg transition-colors">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
                  </button>
                </div>
              </div>
            }
            @if (orderedCategories.length === 0) {
              <p class="text-sm text-gray-400 text-center py-4">{{ 'admin.homepage_category_empty' | translate }}</p>
            }
          </div>
        </div>

      }
    </div>
  `,
})
export class HomepageConfigComponent implements OnInit {
  private fb          = inject(FormBuilder);
  private http        = inject(HttpClient);
  private adminSvc    = inject(AdminService);
  private productSvc  = inject(ProductService);
  private categorySvc = inject(CategoryService);

  private readonly uploadBase = `${environment.apiUrl}/admin/upload-image`;

  loading     = signal(true);
  saving      = signal(false);
  saveSuccess = signal(false);
  error       = signal('');

  slideStates: SlideState[] = [];

  readonly linkTypeOpts = [
    { value: 'product',  label: 'admin.homepage_slide_link_product' },
    { value: 'category', label: 'admin.homepage_slide_link_category' },
    { value: 'custom',   label: 'admin.homepage_slide_link_custom' },
  ];

  allCategories: Category[] = [];
  orderedCategories: Category[] = [];

  featuredProductSearch = '';
  featuredProductResults: ProductListItem[] = [];
  featuredProductOpen = false;
  featuredProductsList: ProductListItem[] = [];
  private featuredSearchTimer: ReturnType<typeof setTimeout> | null = null;

  form = this.fb.group({
    carouselSlides: this.fb.array([]),
    featuredTitle:  [''],
    featuredText:   [''],
  });

  get slidesArray() { return this.form.get('carouselSlides') as FormArray; }

  ngOnInit() {
    forkJoin({
      config:     this.adminSvc.getHomepageConfig(),
      categories: this.categorySvc.getAll(),
    }).subscribe({
      next: ({ config, categories }) => {
        this.allCategories = categories;

        // Build carousel slides
        const slides = config.carouselSlides ?? (config as any).carousel ?? [];
        slides.forEach((s: any) => {
          const linkType = s.linkType ?? (s.productId ? 'product' : s.categoryId ? 'category' : 'custom');
          this.slidesArray.push(this.makeSlideGroup({ ...s, linkType }));
          const state = emptySlideState();
          if (s.productId) {
            this.productSvc.getById(s.productId).subscribe({
              next: (p: any) => { state.selectedProductName = p.name ?? ''; },
            });
          }
          this.slideStates.push(state);
        });

        // Featured text
        this.form.patchValue({
          featuredTitle: config.featuredTitle ?? '',
          featuredText:  config.featuredText  ?? '',
        });

        // Featured products — resolve IDs to display items
        const featIds = config.featuredProductIds ?? (config as any).topProductIds ?? [];
        featIds.forEach((id: string) => {
          this.productSvc.getById(id).subscribe({
            next: (p: any) => {
              this.featuredProductsList.push({
                id:            p.id,
                name:          p.name,
                priceTtc:      p.priceTtc,
                imageUrl:      p.images?.[0]?.imageUrl ?? p.imageUrl ?? null,
                reference:     p.reference,
                slug:          p.slug,
                priceHt:       p.priceHt,
                tvaRate:       p.tvaRate ?? p.vatRate ?? 20,
                categoryId:    p.categoryId,
                stockQuantity: p.stockQuantity ?? 0,
              } as ProductListItem);
            },
          });
        });

        // Category order — featured first, then the rest
        const catIds = config.featuredCategoryIds ?? [];
        const ordered: Category[] = [];
        catIds.forEach((id: string) => {
          const cat = categories.find(c => c.id === id);
          if (cat) ordered.push(cat);
        });
        categories.forEach(cat => {
          if (!catIds.includes(cat.id)) ordered.push(cat);
        });
        this.orderedCategories = ordered;

        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  makeSlideGroup(s: any = {}) {
    return this.fb.group({
      title:      [s.title      ?? '', Validators.required],
      subtitle:   [s.subtitle   ?? ''],
      imageUrl:   [s.imageUrl   ?? '', Validators.required],
      linkType:   [s.linkType   ?? 'custom'],
      productId:  [s.productId  ?? ''],
      categoryId: [s.categoryId ?? ''],
      ctaLink:    [s.ctaLink ?? s.linkUrl ?? ''],
      ctaText:    [s.ctaText    ?? ''],
    });
  }

  addSlide() {
    this.slidesArray.push(this.makeSlideGroup());
    this.slideStates.push(emptySlideState());
  }

  removeSlide(i: number) {
    this.slidesArray.removeAt(i);
    this.slideStates.splice(i, 1);
  }

  setLinkType(i: number, type: string) {
    this.slidesArray.at(i).patchValue({ linkType: type, productId: '', categoryId: '', ctaLink: '' });
    const s = this.slideStates[i];
    s.selectedProductName = '';
    s.productSearch = '';
    s.productOpen = false;
  }

  // ─── Slide image upload ───────────────────────────────────────
  onSlideDragOver(e: DragEvent, i: number) { e.preventDefault(); this.slideStates[i].dragOver = true; }

  onSlideDrop(e: DragEvent, i: number) {
    e.preventDefault();
    this.slideStates[i].dragOver = false;
    const file = e.dataTransfer?.files?.[0];
    if (file) this.uploadSlideImage(file, i);
  }

  onSlideFileInput(e: Event, i: number) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) this.uploadSlideImage(file, i);
  }

  private uploadSlideImage(file: File, i: number) {
    if (!file.type.startsWith('image/')) {
      this.slideStates[i].uploadError = 'Format non supporté';
      return;
    }
    this.slideStates[i].uploading = true;
    this.slideStates[i].uploadError = '';
    const fd = new FormData();
    fd.append('file', file);
    this.http.post<{ url: string }>(this.uploadBase, fd).subscribe({
      next: res => {
        this.slidesArray.at(i).get('imageUrl')?.setValue(res.url);
        this.slideStates[i].uploading = false;
      },
      error: () => {
        this.slideStates[i].uploadError = 'Échec de l\'upload';
        this.slideStates[i].uploading = false;
      },
    });
  }

  // ─── Slide product search ─────────────────────────────────────
  searchSlideProducts(i: number) {
    const q = this.slideStates[i].productSearch;
    if (this.slideStates[i].searchTimer) clearTimeout(this.slideStates[i].searchTimer!);
    if (!q || q.length < 2) { this.slideStates[i].productOpen = false; return; }
    this.slideStates[i].searchTimer = setTimeout(() => {
      this.productSvc.search({ q, pageSize: 8 }).subscribe({
        next: res => {
          this.slideStates[i].productResults = res.data;
          this.slideStates[i].productOpen = true;
        },
      });
    }, 300);
  }

  onSlideSearchBlur(i: number) {
    setTimeout(() => { if (this.slideStates[i]) this.slideStates[i].productOpen = false; }, 200);
  }

  selectSlideProduct(i: number, p: ProductListItem) {
    this.slidesArray.at(i).patchValue({ productId: p.id, ctaLink: `/produits/${p.slug}` });
    this.slideStates[i].selectedProductName = p.name;
    this.slideStates[i].productSearch = '';
    this.slideStates[i].productOpen = false;
  }

  onSlideCategoryChange(i: number) {
    const catId = this.slidesArray.at(i).get('categoryId')?.value;
    const cat = this.allCategories.find(c => c.id === catId);
    if (cat) this.slidesArray.at(i).get('ctaLink')?.setValue(`/categories/${cat.slug}`);
  }

  // ─── Featured products ────────────────────────────────────────
  searchFeaturedProducts() {
    const q = this.featuredProductSearch;
    if (this.featuredSearchTimer) clearTimeout(this.featuredSearchTimer);
    if (!q || q.length < 2) { this.featuredProductOpen = false; return; }
    this.featuredSearchTimer = setTimeout(() => {
      this.productSvc.search({ q, pageSize: 10 }).subscribe({
        next: res => { this.featuredProductResults = res.data; this.featuredProductOpen = true; },
      });
    }, 300);
  }

  onFeaturedSearchBlur() {
    setTimeout(() => { this.featuredProductOpen = false; }, 200);
  }

  addFeaturedProduct(p: ProductListItem) {
    if (!this.isFeatured(p.id)) this.featuredProductsList.push(p);
    this.featuredProductOpen = false;
    this.featuredProductSearch = '';
  }

  removeFeaturedProduct(i: number) { this.featuredProductsList.splice(i, 1); }

  isFeatured(id: string) { return this.featuredProductsList.some(p => p.id === id); }

  moveFeatured(i: number, dir: number) {
    const j = i + dir;
    if (j < 0 || j >= this.featuredProductsList.length) return;
    [this.featuredProductsList[i], this.featuredProductsList[j]] =
      [this.featuredProductsList[j], this.featuredProductsList[i]];
  }

  // ─── Category order ───────────────────────────────────────────
  moveCat(i: number, dir: number) {
    const j = i + dir;
    if (j < 0 || j >= this.orderedCategories.length) return;
    [this.orderedCategories[i], this.orderedCategories[j]] =
      [this.orderedCategories[j], this.orderedCategories[i]];
  }

  // ─── Save ─────────────────────────────────────────────────────
  save() {
    this.saving.set(true);
    this.error.set('');
    this.saveSuccess.set(false);
    const v = this.form.value as any;
    const payload: HomepageConfig = {
      carouselSlides:     v.carouselSlides,
      featuredTitle:      v.featuredTitle,
      featuredText:       v.featuredText,
      featuredProductIds: this.featuredProductsList.map(p => p.id),
      featuredCategoryIds: this.orderedCategories.map(c => c.id),
    };
    this.adminSvc.updateHomepageConfig(payload).subscribe({
      next: () => {
        this.saveSuccess.set(true);
        this.saving.set(false);
        setTimeout(() => this.saveSuccess.set(false), 3000);
      },
      error: err => {
        this.error.set(err?.error?.error || 'Erreur lors de l\'enregistrement.');
        this.saving.set(false);
      },
    });
  }
}
