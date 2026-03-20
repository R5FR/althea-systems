import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { ContactService } from '../../core/services/contact.service';
import { Product, ProductListItem } from '../../core/models';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page-container py-8">
      @if (loading()) {
        <div class="grid md:grid-cols-2 gap-10 animate-pulse">
          <div class="skeleton aspect-square rounded-2xl"></div>
          <div class="space-y-4 pt-4">
            <div class="skeleton h-8 w-3/4"></div>
            <div class="skeleton h-4 w-1/2"></div>
            <div class="skeleton h-24 w-full"></div>
            <div class="skeleton h-12 w-1/3"></div>
          </div>
        </div>
      } @else if (!product()) {
        <div class="text-center py-20 text-gray-500">Produit introuvable.</div>
      } @else {
        <div class="grid md:grid-cols-2 gap-10 lg:gap-16">

          <!-- ── Images carousel ─────────────────────────────────────── -->
          <div>
            <div class="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-3">
              <img [src]="selectedImage() || 'assets/img/placeholder.jpg'" [alt]="product()!.name"
                class="w-full h-full object-contain p-8" />
              <!-- Badges -->
              @if (product()!.badges?.length) {
                <div class="absolute top-3 left-3 flex flex-col gap-1.5">
                  @for (b of product()!.badges; track b.label) {
                    <span class="badge badge-promo px-2.5 py-1 text-xs">{{ b.label }}</span>
                  }
                </div>
              }
            </div>
            <!-- Thumbnails -->
            @if (product()!.images && product()!.images!.length > 1) {
              <div class="flex gap-2 overflow-x-auto pb-1">
                @for (img of product()!.images; track img.id) {
                  <button (click)="selectedImage.set(img.imageUrl)"
                    class="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors"
                    [class.border-primary]="selectedImage() === img.imageUrl"
                    [class.border-transparent]="selectedImage() !== img.imageUrl">
                    <img [src]="img.imageUrl" [alt]="product()!.name" class="w-full h-full object-contain p-1" />
                  </button>
                }
              </div>
            }
          </div>

          <!-- ── Product info ────────────────────────────────────────── -->
          <div class="flex flex-col gap-5">
            <!-- Breadcrumb -->
            <nav class="flex items-center gap-1 text-sm text-gray-500">
              <a routerLink="/" class="hover:text-primary">Accueil</a>
              <span>/</span>
              @if (product()!.category) {
                <a [routerLink]="['/categories', product()!.category!.slug]" class="hover:text-primary">{{ product()!.category!.name }}</a>
                <span>/</span>
              }
              <span class="text-gray-800 font-medium truncate">{{ product()!.name }}</span>
            </nav>

            <div>
              <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{{ product()!.name }}</h1>

              <!-- Availability -->
              @if (product()!.stockQuantity > 0) {
                <span class="badge-success badge">
                  <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                  En stock ({{ product()!.stockQuantity }} disponible{{ product()!.stockQuantity > 1 ? 's' : '' }})
                </span>
              } @else {
                <span class="badge-danger badge">Rupture de stock</span>
              }
            </div>

            <!-- Price -->
            <div class="bg-gray-50 rounded-xl p-4">
              <div class="text-3xl font-bold text-primary">{{ product()!.priceTtc | number:'1.2-2' }} €</div>
              <div class="text-sm text-gray-500 mt-1">
                <span class="font-medium">{{ product()!.priceHt | number:'1.2-2' }} € HT</span>
                <span class="mx-2">·</span>
                TVA {{ product()!.tvaRate }}%
              </div>
            </div>

            <!-- Description -->
            <div>
              <h2 class="font-semibold text-gray-900 mb-2">Description</h2>
              <p class="text-gray-600 leading-relaxed text-sm">{{ product()!.description }}</p>
            </div>

            <!-- CTA -->
            @if (product()!.isLargeProduct) {
              <!-- Large product: contact/quote flow -->
              <div class="card p-5 bg-primary-50 border-primary-100">
                <h3 class="font-semibold text-primary-800 mb-2">Produit sur devis</h3>
                <p class="text-sm text-primary-700 mb-4">Ce produit nécessite une prise de contact. Notre équipe vous répondra sous 24h avec une offre personnalisée.</p>
                <div class="flex flex-col gap-3">
                  <input [(ngModel)]="quoteEmail" type="email" placeholder="Votre email" class="input-field" />
                  <textarea [(ngModel)]="quoteMessage" rows="3" placeholder="Décrivez vos besoins..." class="input-field resize-none"></textarea>
                  <button (click)="requestQuote()" [disabled]="requestingQuote()" class="btn-primary">
                    @if (requestingQuote()) { <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> }
                    Demander un devis
                  </button>
                  @if (quoteSent()) {
                    <p class="text-sm text-green-600 font-medium">✓ Votre demande a été envoyée ! Nous vous contacterons bientôt.</p>
                  }
                </div>
              </div>
            } @else {
              <!-- Standard product: add to cart -->
              <div class="flex flex-col sm:flex-row gap-3">
                <div class="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button (click)="qty.set(Math.max(1, qty()-1))" class="px-4 py-3 hover:bg-gray-100 text-lg font-bold">−</button>
                  <span class="w-12 text-center font-semibold">{{ qty() }}</span>
                  <button (click)="qty.set(Math.min(product()!.stockQuantity, qty()+1))" class="px-4 py-3 hover:bg-gray-100 text-lg font-bold">+</button>
                </div>
                <button
                  (click)="addToCart()"
                  [disabled]="product()!.stockQuantity === 0 || addingToCart()"
                  class="btn-primary flex-1 text-base py-3 disabled:opacity-50 disabled:cursor-not-allowed">
                  @if (addingToCart()) {
                    <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  } @else if (product()!.stockQuantity === 0) {
                    En rupture de stock
                  } @else {
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                    </svg>
                    Ajouter au panier
                  }
                </button>
              </div>
              @if (addedSuccess()) {
                <p class="text-sm text-green-600 font-medium flex items-center gap-1">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                  Ajouté au panier !
                </p>
              }
            }

            <!-- Technical specs -->
            @if (product()!.description) {
              <div class="border-t pt-5">
                <h2 class="font-semibold text-gray-900 mb-3">Caractéristiques techniques</h2>
                <div class="text-sm text-gray-600 space-y-1">
                  <div class="flex justify-between py-1 border-b border-gray-100">
                    <span class="text-gray-500">Référence</span>
                    <span class="font-medium">{{ product()!.slug }}</span>
                  </div>
                  <div class="flex justify-between py-1 border-b border-gray-100">
                    <span class="text-gray-500">TVA</span>
                    <span class="font-medium">{{ product()!.tvaRate }}%</span>
                  </div>
                  <div class="flex justify-between py-1">
                    <span class="text-gray-500">Disponibilité</span>
                    <span class="font-medium" [class.text-green-600]="product()!.stockQuantity > 0" [class.text-red-500]="product()!.stockQuantity === 0">
                      {{ product()!.stockQuantity > 0 ? 'En stock' : 'Rupture' }}
                    </span>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- ── Similar products ──────────────────────────────────────── -->
        @if (similarProducts().length > 0) {
          <section class="mt-16">
            <h2 class="section-title">Produits similaires</h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              @for (p of similarProducts(); track p.id) {
                <a [routerLink]="['/produits', p.slug]" class="card-hover group">
                  <div class="aspect-square bg-gray-50 overflow-hidden rounded-t-xl">
                    <img [src]="p.imageUrl || 'assets/img/placeholder.jpg'" [alt]="p.name"
                      class="w-full h-full object-contain p-3 transition-transform group-hover:scale-105" />
                  </div>
                  <div class="p-2">
                    <p class="text-xs font-medium text-gray-800 line-clamp-2 mb-1">{{ p.name }}</p>
                    <p class="text-primary text-sm font-bold">{{ p.priceTtc | number:'1.2-2' }} €</p>
                  </div>
                </a>
              }
            </div>
          </section>
        }
      }
    </div>
  `,
})
export class ProductComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productSvc = inject(ProductService);
  private cartSvc = inject(CartService);
  private contactSvc = inject(ContactService);

  Math = Math;
  product = signal<Product | null>(null);
  similarProducts = signal<ProductListItem[]>([]);
  loading = signal(true);
  selectedImage = signal('');
  qty = signal(1);
  addingToCart = signal(false);
  addedSuccess = signal(false);
  quoteEmail = '';
  quoteMessage = '';
  requestingQuote = signal(false);
  quoteSent = signal(false);

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.loading.set(true);
      this.productSvc.getBySlug(params['slug']).subscribe({
        next: p => {
          this.product.set(p);
          this.selectedImage.set(p.images?.find(i => i.isMain)?.imageUrl || p.images?.[0]?.imageUrl || '');
          this.loading.set(false);
          this.loadSimilar(p.categoryId, p.id);
        },
        error: () => this.loading.set(false)
      });
    });
  }

  loadSimilar(categoryId: string, excludeId: string) {
    this.productSvc.search({ categoryId, pageSize: 7 }).subscribe({
      next: res => {
        const similar = res.data.filter(p => p.id !== excludeId && p.stockQuantity > 0);
        this.similarProducts.set(similar.sort(() => Math.random() - 0.5).slice(0, 6));
      },
      error: () => {}
    });
  }

  addToCart() {
    if (!this.product() || this.product()!.stockQuantity === 0) return;
    this.addingToCart.set(true);
    this.cartSvc.addItem(this.product()!.id, this.qty()).subscribe({
      next: () => {
        this.addingToCart.set(false);
        this.addedSuccess.set(true);
        setTimeout(() => this.addedSuccess.set(false), 3000);
      },
      error: () => this.addingToCart.set(false)
    });
  }

  requestQuote() {
    if (!this.quoteEmail) return;
    this.requestingQuote.set(true);
    this.contactSvc.sendMessage({
      email: this.quoteEmail,
      subject: `Demande de devis : ${this.product()?.name}`,
      message: this.quoteMessage || `Bonjour, je souhaite obtenir un devis pour le produit "${this.product()?.name}" (ref: ${this.product()?.slug}).`
    }).subscribe({
      next: () => { this.quoteSent.set(true); this.requestingQuote.set(false); },
      error: () => this.requestingQuote.set(false)
    });
  }
}
