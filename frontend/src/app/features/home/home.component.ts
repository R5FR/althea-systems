import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { CarouselSlide, Category, ProductListItem } from '../../core/models';

// ── Example / fallback data ────────────────────────────────────────────────
const EXAMPLE_SLIDES: CarouselSlide[] = [
  {
    id: 'ex-1',
    title: 'Imagerie médicale\nde nouvelle génération',
    subtitle: 'Échographes, scanners et IRM portables pour des diagnostics précis au cabinet.',
    imageUrl: '',
    linkUrl: '/recherche',
    isActive: true,
    displayOrder: 1,
  },
  {
    id: 'ex-2',
    title: 'Monitoring continu\nde vos patients',
    subtitle: 'Moniteurs multiparamétriques et défibrillateurs de haute fiabilité clinique.',
    imageUrl: '',
    linkUrl: '/recherche',
    isActive: true,
    displayOrder: 2,
  },
  {
    id: 'ex-3',
    title: 'Stérilisation &\nhygiène hospitalière',
    subtitle: 'Autoclaves, laveurs-désinfecteurs et consommables certifiés EN 13060.',
    imageUrl: '',
    linkUrl: '/recherche',
    isActive: true,
    displayOrder: 3,
  },
];

const EXAMPLE_CATEGORIES: (Category & { gradient: string })[] = [
  { id: 'c1', name: 'Imagerie médicale',         slug: 'imagerie-medicale',  description: '', imageUrl: 'https://picsum.photos/seed/cat-imagerie/600/400',  status: 'Active', displayOrder: 1, gradient: 'linear-gradient(135deg,#0094A0,#33BFC9)' },
  { id: 'c2', name: 'Monitoring & Surveillance', slug: 'monitoring',         description: '', imageUrl: 'https://picsum.photos/seed/cat-monitor/600/400',   status: 'Active', displayOrder: 2, gradient: 'linear-gradient(135deg,#003D5C,#004D74)' },
  { id: 'c3', name: 'Chirurgie & Blocs',         slug: 'chirurgie',          description: '', imageUrl: 'https://picsum.photos/seed/cat-chirurgie/600/400', status: 'Active', displayOrder: 3, gradient: 'linear-gradient(135deg,#003D5C,#003D5C)' },
  { id: 'c4', name: 'Diagnostic clinique',       slug: 'diagnostic',         description: '', imageUrl: 'https://picsum.photos/seed/cat-diagno/600/400',    status: 'Active', displayOrder: 4, gradient: 'linear-gradient(135deg,#0094A0,#00A8B5)' },
  { id: 'c5', name: 'Cardiologie',               slug: 'cardiologie',        description: '', imageUrl: 'https://picsum.photos/seed/cat-cardio/600/400',    status: 'Active', displayOrder: 5, gradient: 'linear-gradient(135deg,#003D5C,#004D74)' },
  { id: 'c6', name: 'Ophtalmologie',             slug: 'ophtalmologie',      description: '', imageUrl: 'https://picsum.photos/seed/cat-ophtalmo/600/400',  status: 'Active', displayOrder: 6, gradient: 'linear-gradient(135deg,#006D77,#48CAE4)' },
  { id: 'c7', name: 'Stérilisation',             slug: 'sterilisation',      description: '', imageUrl: 'https://picsum.photos/seed/cat-steril/600/400',    status: 'Active', displayOrder: 7, gradient: 'linear-gradient(135deg,#2D3A3A,#4A7C7E)' },
  { id: 'c8', name: 'Mobilier médical',          slug: 'mobilier-medical',   description: '', imageUrl: 'https://picsum.photos/seed/cat-mobilier/600/400',  status: 'Active', displayOrder: 8, gradient: 'linear-gradient(135deg,#3D3D3D,#5C6B7A)' },
];

const EXAMPLE_PRODUCTS: ProductListItem[] = [
  { id: 'p1', name: 'Échographe portable SonoMax Pro X7',            slug: 'echographe-sonomax-pro-x7',    priceTtc: 15990, priceHt: 13325, tvaRate: 20, stockQuantity: 3,  imageUrl: 'https://picsum.photos/seed/med101/400/400', badges: [{ type: 'new',   label: 'Nouveau' }],     categoryId: 'c1', priority: 1 },
  { id: 'p2', name: 'Moniteur multiparamétrique CardioCare X5',      slug: 'moniteur-cardiocare-x5',       priceTtc: 8750,  priceHt: 7292,  tvaRate: 20, stockQuantity: 7,  imageUrl: 'https://picsum.photos/seed/med102/400/400', badges: [],                                           categoryId: 'c2', priority: 2 },
  { id: 'p3', name: 'Défibrillateur HeartSave AED Pro 3000',         slug: 'defibrillateur-heartsave-aed', priceTtc: 2290,  priceHt: 1908,  tvaRate: 20, stockQuantity: 12, imageUrl: 'https://picsum.photos/seed/med103/400/400', badges: [{ type: 'promo', label: 'Best-seller' }],    categoryId: 'c5', priority: 3 },
  { id: 'p4', name: 'Électrocardiographe 12 dérivations ECG Expert', slug: 'ecg-expert-12-derivations',    priceTtc: 5490,  priceHt: 4575,  tvaRate: 20, stockQuantity: 5,  imageUrl: 'https://picsum.photos/seed/med104/400/400', badges: [],                                           categoryId: 'c5', priority: 4 },
  { id: 'p5', name: 'Table d\'examen électrique MedLine Elite',      slug: 'table-examen-medline-elite',   priceTtc: 3450,  priceHt: 2875,  tvaRate: 20, stockQuantity: 2,  imageUrl: 'https://picsum.photos/seed/med105/400/400', badges: [],                                           categoryId: 'c8', priority: 5 },
  { id: 'p6', name: 'Autoclave de stérilisation SterilPro 22L',      slug: 'autoclave-sterilpro-22l',      priceTtc: 4190,  priceHt: 3492,  tvaRate: 20, stockQuantity: 4,  imageUrl: 'https://picsum.photos/seed/med106/400/400', badges: [{ type: 'custom', label: 'Certifié CE' }],   categoryId: 'c7', priority: 6 },
  { id: 'p7', name: 'Otoscope numérique DiagnosticPro HD',            slug: 'otoscope-diagnosticpro-hd',   priceTtc: 890,   priceHt: 742,   tvaRate: 20, stockQuantity: 18, imageUrl: 'https://picsum.photos/seed/med107/400/400', badges: [],                                           categoryId: 'c4', priority: 7 },
  { id: 'p8', name: 'Oxymètre de pouls professionnel OxyCheck',      slug: 'oxycheck-pro',                 priceTtc: 490,   priceHt: 408,   tvaRate: 20, stockQuantity: 30, imageUrl: 'https://picsum.photos/seed/med108/400/400', badges: [{ type: 'promo',  label: 'Promo' }],          categoryId: 'c2', priority: 8 },
];

// ── Hero gradient palette by slide index ──────────────────────────────────
const HERO_GRADIENTS = [
  'linear-gradient(135deg, #003D5C 0%, #0094A0 60%, #002323 100%)',
  'linear-gradient(135deg, #003D5C 0%, #00A8B5 60%, #0094A0 100%)',
  'linear-gradient(135deg, #002323 0%, #003D5C 60%, #003D5C 100%)',
];

// Icon paths for hero decorative background
const HERO_PATTERN = `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect x="27" y="5" width="6" height="50" rx="3" fill="white" opacity=".07"/><rect x="5" y="27" width="50" height="6" rx="3" fill="white" opacity=".07"/></svg>`;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- ── Hero Carousel ─────────────────────────────────────────────────── -->
    <section class="relative overflow-hidden" style="height: 520px;">
      @for (slide of displaySlides(); track slide.id; let i = $index) {
        <div class="absolute inset-0 transition-opacity duration-700"
          [class.opacity-100]="currentSlide() === i"
          [class.opacity-0]="currentSlide() !== i">

          @if (slide.imageUrl) {
            <!-- Real image slide -->
            <img [src]="slide.imageUrl" [alt]="slide.title"
              class="w-full h-full object-cover" />
            <div class="absolute inset-0" style="background: linear-gradient(90deg, rgba(17,30,53,0.88) 0%, rgba(17,30,53,0.4) 60%, transparent 100%);"></div>
          } @else {
            <!-- Gradient fallback slide -->
            <div class="absolute inset-0" [style.background]="heroGradients[i % heroGradients.length]">
              <!-- Subtle cross pattern overlay -->
              <div class="absolute inset-0" style="background-image: url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22%3E%3Crect x=%2227%22 y=%225%22 width=%226%22 height=%2250%22 rx=%223%22 fill=%22white%22 opacity=%22.05%22/%3E%3Crect x=%225%22 y=%2227%22 width=%2250%22 height=%226%22 rx=%223%22 fill=%22white%22 opacity=%22.05%22/%3E%3C/svg%3E'); background-size: 60px 60px;"></div>
              <!-- Large faint icon -->
              <div class="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-end pr-16 opacity-[0.06]">
                <svg class="w-96 h-96 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H14V0H10V3H5C3.9 3 3 3.9 3 5V10H0V14H3V19C3 20.1 3.9 21 5 21H10V24H14V21H19C20.1 21 21 20.1 21 19V14H24V10H21V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z"/>
                </svg>
              </div>
            </div>
          }

          <!-- Slide content -->
          <div class="relative h-full page-container flex flex-col justify-center">
            <div class="max-w-xl animate-fade-up" style="animation-delay: 0.1s;">
              <!-- Slide label -->
              <div class="flex items-center gap-2 mb-4">
                <div class="w-6 h-0.5" style="background:#00A8B5;"></div>
                <span class="text-xs font-semibold tracking-widest uppercase text-white/60">Althea Systems</span>
              </div>
              <!-- Title — supports line breaks via whitespace-pre-line -->
              <h1 class="font-display font-semibold text-white mb-4 leading-[1.15]"
                style="font-size: clamp(2rem, 4vw, 3.5rem); white-space: pre-line;">{{ slide.title }}</h1>
              @if (slide.subtitle) {
                <p class="text-white/70 text-base md:text-lg leading-relaxed mb-8 max-w-md">{{ slide.subtitle }}</p>
              }
              @if (slide.linkUrl) {
                <div class="flex items-center gap-3">
                  <a [routerLink]="slide.linkUrl" class="btn-primary text-sm px-7 py-3">
                    Explorer le catalogue
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </a>
                  <a routerLink="/contact" class="text-sm font-medium text-white/70 hover:text-white transition-colors">
                    Demander un devis →
                  </a>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- Dots -->
      @if (displaySlides().length > 1) {
        <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          @for (slide of displaySlides(); track slide.id; let i = $index) {
            <button (click)="goToSlide(i)"
              class="transition-all duration-300 rounded-full"
              [style.width]="currentSlide() === i ? '24px' : '8px'"
              [style.height]="'8px'"
              [style.background]="currentSlide() === i ? '#00A8B5' : 'rgba(255,255,255,0.35)'">
            </button>
          }
        </div>
        <button (click)="prevSlide()"
          class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white transition-all"
          style="background:rgba(255,255,255,0.1);"
          onmouseenter="this.style.background='rgba(255,255,255,0.2)'" onmouseleave="this.style.background='rgba(255,255,255,0.1)'">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <button (click)="nextSlide()"
          class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white transition-all"
          style="background:rgba(255,255,255,0.1);"
          onmouseenter="this.style.background='rgba(255,255,255,0.2)'" onmouseleave="this.style.background='rgba(255,255,255,0.1)'">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </button>
      }
    </section>

    <!-- ── Featured text banner ──────────────────────────────────────────── -->
    @if (featuredText()) {
      <div class="bg-primary/5 border-y border-primary/10 py-4">
        <div class="page-container text-center text-sm text-primary-700 font-medium">
          {{ featuredText() }}
        </div>
      </div>
    }

    <!-- ── Stats strip ────────────────────────────────────────────────────── -->
    <div class="bg-white border-b border-gray-100">
      <div class="page-container py-5">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          @for (stat of stats; track stat.label) {
            <div>
              <p class="font-display font-semibold text-2xl md:text-3xl text-navy mb-0.5">{{ stat.value }}</p>
              <p class="text-xs text-gray-500">{{ stat.label }}</p>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- ── Categories ────────────────────────────────────────────────────── -->
    <section class="py-16 md:py-20">
      <div class="page-container">
        <div class="flex items-end justify-between mb-10">
          <div>
            <p class="section-label">Parcourez par spécialité</p>
            <h2 class="section-title mb-0">Nos catégories</h2>
          </div>
          <a routerLink="/recherche" class="hidden md:flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-700 transition-colors">
            Tout voir
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </a>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          @for (cat of displayCategories(); track cat.id; let i = $index) {
            <a [routerLink]="['/categories', cat.slug]"
              class="group relative overflow-hidden rounded-2xl cursor-pointer"
              style="aspect-ratio: 4/3;">
              @if (cat.imageUrl) {
                <img [src]="cat.imageUrl" [alt]="cat.name"
                  class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              } @else {
                <!-- Gradient placeholder -->
                <div class="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                  [style.background]="getCategoryGradient(i)">
                  <!-- Category icon -->
                  <div class="absolute inset-0 flex items-center justify-center opacity-[0.12]">
                    <svg class="w-20 h-20 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3H14V0H10V3H5C3.9 3 3 3.9 3 5V10H0V14H3V19C3 20.1 3.9 21 5 21H10V24H14V21H19C20.1 21 21 20.1 21 19V14H24V10H21V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z"/>
                    </svg>
                  </div>
                </div>
              }
              <!-- Label -->
              <div class="absolute bottom-0 left-0 right-0 p-4">
                <span class="text-white font-semibold text-sm md:text-base leading-tight drop-shadow block">{{ cat.name }}</span>
                <div class="flex items-center gap-1 mt-1 text-white/60 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Voir les produits
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </a>
          }
        </div>
      </div>
    </section>

    <!-- ── Top Products ───────────────────────────────────────────────────── -->
    <section class="py-16 md:py-20 bg-white border-y border-gray-100">
      <div class="page-container">
        <div class="flex items-end justify-between mb-10">
          <div>
            <p class="section-label">Sélection du moment</p>
            <h2 class="section-title mb-0">Équipements phares</h2>
          </div>
          <a routerLink="/recherche" class="hidden md:flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-700 transition-colors">
            Voir tout le catalogue
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </a>
        </div>

        @if (loadingProducts()) {
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            @for (_ of [1,2,3,4,5,6,7,8]; track $index) {
              <div class="card p-4">
                <div class="skeleton rounded-xl mb-3" style="aspect-ratio:1;"></div>
                <div class="skeleton h-3.5 w-3/4 mb-2"></div>
                <div class="skeleton h-3.5 w-1/2 mb-3"></div>
                <div class="skeleton h-5 w-2/3"></div>
              </div>
            }
          </div>
        } @else {
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            @for (product of displayProducts(); track product.id; let i = $index) {
              <a [routerLink]="['/produits', product.slug]" class="card-hover group flex flex-col">
                <!-- Image / placeholder -->
                <div class="relative overflow-hidden rounded-t-xl bg-gray-50" style="aspect-ratio:1;">
                  @if (product.imageUrl) {
                    <img [src]="product.imageUrl" [alt]="product.name"
                      class="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105" />
                  } @else {
                    <!-- Styled placeholder -->
                    <div class="absolute inset-0 flex items-center justify-center"
                      [style.background]="getProductGradient(i)">
                      <svg class="w-14 h-14 text-white opacity-20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3H14V0H10V3H5C3.9 3 3 3.9 3 5V10H0V14H3V19C3 20.1 3.9 21 5 21H10V24H14V21H19C20.1 21 21 20.1 21 19V14H24V10H21V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z"/>
                      </svg>
                    </div>
                  }
                  <!-- Badges -->
                  @if (product.badges?.length) {
                    <div class="absolute top-2 left-2 flex flex-col gap-1">
                      @for (badge of product.badges; track badge.label) {
                        <span [class]="'badge badge-' + badge.type">{{ badge.label }}</span>
                      }
                    </div>
                  }
                  @if (product.stockQuantity === 0) {
                    <div class="absolute inset-0 bg-white/75 flex items-center justify-center">
                      <span class="badge badge-danger">Rupture de stock</span>
                    </div>
                  } @else if (product.stockQuantity <= 5) {
                    <span class="absolute top-2 right-2 badge badge-warning">Stock limité</span>
                  }
                </div>
                <!-- Info -->
                <div class="p-4 flex-1 flex flex-col">
                  <p class="font-semibold text-gray-900 text-sm leading-snug mb-auto line-clamp-2 group-hover:text-primary transition-colors">
                    {{ product.name }}
                  </p>
                  <div class="mt-3 pt-3 border-t border-gray-50">
                    <p class="text-primary font-bold text-base">{{ product.priceTtc | number:'1.2-2' }} €
                      <span class="text-xs font-normal text-gray-400">TTC</span>
                    </p>
                    <p class="text-gray-400 text-xs">{{ product.priceHt | number:'1.2-2' }} € HT</p>
                  </div>
                </div>
              </a>
            }
          </div>
        }

        <div class="text-center mt-10">
          <a routerLink="/recherche" class="btn-secondary">
            Voir tous les produits
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </div>
    </section>

    <!-- ── Why Althea ────────────────────────────────────────────────────── -->
    <section class="py-16 md:py-24" style="background-color:#D4F4F7;">
      <div class="page-container">
        <div class="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <!-- Left: text -->
          <div>
            <p class="section-label">Pourquoi nous choisir</p>
            <h2 class="font-display font-semibold text-3xl md:text-4xl text-navy leading-tight mb-6">
              L'excellence médicale,<br/>
              <span style="color:#00A8B5;">à votre service</span>
            </h2>
            <p class="text-gray-600 leading-relaxed mb-8">
              Depuis plus de 15 ans, Althea Systems accompagne les professionnels de santé avec
              des équipements sélectionnés pour leur fiabilité, leur précision et leur conformité
              aux standards européens les plus stricts.
            </p>
            <div class="space-y-4">
              @for (point of whyPoints; track point.title) {
                <div class="flex items-start gap-4">
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style="background:rgba(0,122,124,0.1);">
                    <div [innerHTML]="point.icon" class="text-primary w-5 h-5"></div>
                  </div>
                  <div>
                    <p class="font-semibold text-gray-900 mb-0.5">{{ point.title }}</p>
                    <p class="text-sm text-gray-500 leading-relaxed">{{ point.desc }}</p>
                  </div>
                </div>
              }
            </div>
          </div>
          <!-- Right: visual grid -->
          <div class="grid grid-cols-2 gap-3">
            @for (card of highlightCards; track card.title) {
              <div class="rounded-2xl p-5 flex flex-col" [style.background]="card.bg">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center mb-4" [style.background]="card.iconBg">
                  <div [innerHTML]="card.icon" class="w-5 h-5 text-white"></div>
                </div>
                <p class="font-display font-semibold text-xl mb-1" [style.color]="card.textColor">{{ card.value }}</p>
                <p class="text-xs" [style.color]="card.subColor">{{ card.title }}</p>
              </div>
            }
          </div>
        </div>
      </div>
    </section>

    <!-- ── Trust strip ────────────────────────────────────────────────────── -->
    <section class="py-10 bg-white border-t border-gray-100">
      <div class="page-container">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          @for (item of trustItems; track item.title) {
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style="background:rgba(0,122,124,0.08);">
                <div [innerHTML]="item.icon" class="w-6 h-6 text-primary"></div>
              </div>
              <div>
                <p class="font-semibold text-gray-900 text-sm">{{ item.title }}</p>
                <p class="text-gray-400 text-xs mt-0.5">{{ item.desc }}</p>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ── CTA banner ─────────────────────────────────────────────────────── -->
    <section class="py-16" style="background: linear-gradient(135deg, #003D5C 0%, #00A8B5 100%);">
      <div class="page-container text-center">
        <h2 class="font-display font-semibold text-3xl md:text-4xl text-white mb-4">
          Besoin d'un devis personnalisé ?
        </h2>
        <p class="text-white/60 text-base mb-8 max-w-md mx-auto">
          Notre équipe d'experts vous accompagne dans le choix des équipements adaptés à votre pratique.
        </p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <a routerLink="/contact" class="btn-primary bg-white !text-navy hover:bg-gray-50 px-8 py-3">
            Contacter notre équipe
          </a>
          <a routerLink="/recherche" class="btn-secondary !border-white/30 !text-white hover:!bg-white/10 px-8 py-3">
            Parcourir le catalogue
          </a>
        </div>
      </div>
    </section>
  `,
})
export class HomeComponent implements OnInit, OnDestroy {
  private adminSvc    = inject(AdminService);
  private productSvc  = inject(ProductService);
  private categorySvc = inject(CategoryService);

  slides         = signal<CarouselSlide[]>([]);
  categories     = signal<Category[]>([]);
  topProducts    = signal<ProductListItem[]>([]);
  featuredText   = signal('');
  loadingProducts = signal(true);
  currentSlide   = signal(0);

  private timer: any;

  readonly heroGradients = HERO_GRADIENTS;

  // Merged: API data or example fallback
  displaySlides     = this.slides;
  displayCategories = this.categories;
  displayProducts   = this.topProducts;

  stats = [
    { value: '2 400+', label: 'Équipements référencés' },
    { value: '15 ans',  label: 'D\'expertise médicale' },
    { value: '98 %',    label: 'Clients satisfaits' },
    { value: '48 h',    label: 'Délai de livraison EU' },
  ];

  whyPoints = [
    {
      title: 'Dispositifs certifiés CE & ISO 13485',
      desc: 'Tous nos produits sont conformes aux réglementations européennes sur les dispositifs médicaux.',
      icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>`,
    },
    {
      title: 'Support technique dédié 5j/7',
      desc: 'Une équipe d\'ingénieurs biomédicaux à votre écoute pour installation, maintenance et SAV.',
      icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`,
    },
    {
      title: 'Livraison express en Europe',
      desc: 'Expédition sous 24h depuis nos entrepôts, avec suivi en temps réel et installation sur site.',
      icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>`,
    },
  ];

  highlightCards = [
    {
      title: 'Références produits',
      value: '2 400+',
      bg: 'linear-gradient(135deg, #0094A0, #00A8B5)',
      iconBg: 'rgba(255,255,255,0.15)',
      textColor: 'white',
      subColor: 'rgba(255,255,255,0.6)',
      icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>`,
    },
    {
      title: 'Satisfaction client',
      value: '98 %',
      bg: '#ffffff',
      iconBg: 'rgba(0,122,124,0.1)',
      textColor: '#003D5C',
      subColor: '#9CA3AF',
      icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="color:#00A8B5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>`,
    },
    {
      title: 'Années d\'expertise',
      value: '15 ans',
      bg: '#ffffff',
      iconBg: 'rgba(0,122,124,0.1)',
      textColor: '#003D5C',
      subColor: '#9CA3AF',
      icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="color:#00A8B5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>`,
    },
    {
      title: 'Livraison garantie',
      value: '48 h',
      bg: 'linear-gradient(135deg, #003D5C, #003D5C)',
      iconBg: 'rgba(255,255,255,0.12)',
      textColor: 'white',
      subColor: 'rgba(255,255,255,0.5)',
      icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`,
    },
  ];

  trustItems = [
    {
      title: 'Livraison express EU',
      desc: 'Partout en Europe sous 48h',
      icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>`,
    },
    {
      title: 'Paiement sécurisé',
      desc: 'SSL / PCI-DSS certifié',
      icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>`,
    },
    {
      title: 'Qualité certifiée CE',
      desc: 'Matériel médical agréé',
      icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>`,
    },
    {
      title: 'Support technique 5j/7',
      desc: 'Équipe biomédicale dédiée',
      icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`,
    },
  ];

  ngOnInit() {
    // Homepage config (carousel + featured text)
    this.adminSvc.getHomepageConfig().subscribe({
      next: cfg => {
        const slides = cfg.carousel?.filter((s: CarouselSlide) => s.isActive) ?? [];
        this.slides.set(slides.length > 0 ? slides : EXAMPLE_SLIDES);
        this.featuredText.set(cfg.featuredText ?? '');
        this.startAutoplay();
      },
      error: () => {
        this.slides.set(EXAMPLE_SLIDES);
        this.startAutoplay();
      }
    });

    // Categories
    this.categorySvc.getAll().subscribe({
      next: (cats: Category[]) => {
        const active = cats.filter((c: Category) => c.status === 'Active').sort((a: Category, b: Category) => a.displayOrder - b.displayOrder);
        this.categories.set(active.length > 0 ? active : EXAMPLE_CATEGORIES);
      },
      error: () => this.categories.set(EXAMPLE_CATEGORIES)
    });

    // Top products
    this.productSvc.getTop(8).subscribe({
      next: (products: ProductListItem[]) => {
        this.topProducts.set(products.length > 0 ? products : EXAMPLE_PRODUCTS);
        this.loadingProducts.set(false);
      },
      error: () => {
        this.topProducts.set(EXAMPLE_PRODUCTS);
        this.loadingProducts.set(false);
      }
    });
  }

  ngOnDestroy() { clearInterval(this.timer); }

  private startAutoplay() {
    if (this.slides().length > 1) {
      this.timer = setInterval(() => this.nextSlide(), 5000);
    }
  }

  goToSlide(i: number) { this.currentSlide.set(i); }
  nextSlide() { this.currentSlide.update(i => (i + 1) % Math.max(this.slides().length, 1)); }
  prevSlide() { this.currentSlide.update(i => (i - 1 + Math.max(this.slides().length, 1)) % Math.max(this.slides().length, 1)); }

  getCategoryGradient(index: number): string {
    const defaults = [
      'linear-gradient(135deg,#0094A0,#33BFC9)',
      'linear-gradient(135deg,#003D5C,#004D74)',
      'linear-gradient(135deg,#003D5C,#003D5C)',
      'linear-gradient(135deg,#0094A0,#00A8B5)',
      'linear-gradient(135deg,#003D5C,#004D74)',
      'linear-gradient(135deg,#006D77,#48CAE4)',
      'linear-gradient(135deg,#2D3A3A,#4A7C7E)',
      'linear-gradient(135deg,#3D3D3D,#5C6B7A)',
    ];
    const cats = this.categories() as any[];
    if (cats[index]?.gradient) return cats[index].gradient;
    return defaults[index % defaults.length];
  }

  getProductGradient(index: number): string {
    const palettes = [
      'linear-gradient(135deg,#0094A0,#00A8B5)',
      'linear-gradient(135deg,#003D5C,#003D5C)',
      'linear-gradient(135deg,#0094A0,#0094A0)',
      'linear-gradient(135deg,#003D5C,#003D5C)',
      'linear-gradient(135deg,#2D3A3A,#3D5A5B)',
      'linear-gradient(135deg,#006D77,#00A8B5)',
      'linear-gradient(135deg,#004D74,#004D74)',
      'linear-gradient(135deg,#004242,#006D77)',
    ];
    return palettes[index % palettes.length];
  }
}
