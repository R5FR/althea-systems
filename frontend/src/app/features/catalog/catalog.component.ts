import { Component, OnInit, signal, computed, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { Category, ProductListItem } from '../../core/models';

// ── Example products per category slug (fallback when API returns no data) ─
// Images intentionally empty — gradient placeholders will render instead
const P = (_seed: string) => '';

const EXAMPLE_PRODUCTS_BY_SLUG: Record<string, ProductListItem[]> = {
  'imagerie-medicale': [
    { id: 'im1', name: 'Échographe portable SonoMax Pro X7',       slug: 'echographe-sonomax-pro-x7',        priceTtc: 15990, priceHt: 13325, tvaRate: 20, stockQuantity: 3,  imageUrl: P('im1'), badges: [{ type: 'new',   label: 'Nouveau' }],    categoryId: 'imagerie-medicale', priority: 1 },
    { id: 'im2', name: 'Échographe obstétrical BabyView 4D',        slug: 'echographe-babyview-4d',           priceTtc: 22490, priceHt: 18742, tvaRate: 20, stockQuantity: 2,  imageUrl: P('im2'), badges: [],                                         categoryId: 'imagerie-medicale', priority: 2 },
    { id: 'im3', name: 'Radiographie numérique DR-Panel Pro',       slug: 'radiographie-dr-panel-pro',        priceTtc: 34990, priceHt: 29158, tvaRate: 20, stockQuantity: 1,  imageUrl: P('im3'), badges: [{ type: 'promo', label: 'Best-seller' }],  categoryId: 'imagerie-medicale', priority: 3 },
    { id: 'im4', name: 'Mammographe numérique MammoScan Elite',     slug: 'mammographe-mammoscan-elite',      priceTtc: 45000, priceHt: 37500, tvaRate: 20, stockQuantity: 1,  imageUrl: P('im4'), badges: [],                                         categoryId: 'imagerie-medicale', priority: 4 },
    { id: 'im5', name: 'Endoscope HD FlexiScope 10mm',              slug: 'endoscope-flexiscope-10mm',        priceTtc: 8750,  priceHt: 7292,  tvaRate: 20, stockQuantity: 6,  imageUrl: P('im5'), badges: [],                                         categoryId: 'imagerie-medicale', priority: 5 },
    { id: 'im6', name: 'Colposcope numérique CervixView Pro',       slug: 'colposcope-cervixview-pro',        priceTtc: 5490,  priceHt: 4575,  tvaRate: 20, stockQuantity: 4,  imageUrl: P('im6'), badges: [{ type: 'custom', label: 'Certifié CE' }], categoryId: 'imagerie-medicale', priority: 6 },
    { id: 'im7', name: 'Caméra ORL endoscopique ENT-Cam 1080p',     slug: 'camera-ent-cam-1080p',             priceTtc: 3290,  priceHt: 2742,  tvaRate: 20, stockQuantity: 8,  imageUrl: P('im7'), badges: [],                                         categoryId: 'imagerie-medicale', priority: 7 },
    { id: 'im8', name: 'Table télécommandée de radiologie RT-500',  slug: 'table-telecommandee-rt-500',       priceTtc: 28500, priceHt: 23750, tvaRate: 20, stockQuantity: 0,  imageUrl: P('im8'), badges: [],                                         categoryId: 'imagerie-medicale', priority: 8 },
  ],
  'monitoring': [
    { id: 'mo1', name: 'Moniteur multiparamétrique CardioCare X5',   slug: 'moniteur-cardiocare-x5',          priceTtc: 8750,  priceHt: 7292,  tvaRate: 20, stockQuantity: 7,  imageUrl: P('mo1'), badges: [],                                         categoryId: 'monitoring', priority: 1 },
    { id: 'mo2', name: 'Oxymètre de pouls professionnel OxyCheck',   slug: 'oxycheck-pro',                    priceTtc: 490,   priceHt: 408,   tvaRate: 20, stockQuantity: 30, imageUrl: P('mo2'), badges: [{ type: 'promo', label: 'Promo' }],         categoryId: 'monitoring', priority: 2 },
    { id: 'mo3', name: 'Capnographe portable CO2-Guard 3000',        slug: 'capnographe-co2-guard-3000',      priceTtc: 3290,  priceHt: 2742,  tvaRate: 20, stockQuantity: 5,  imageUrl: P('mo3'), badges: [],                                         categoryId: 'monitoring', priority: 3 },
    { id: 'mo4', name: 'Tensiomètre automatique OmniPress 3000',     slug: 'tensiometre-omnipress-3000',      priceTtc: 1290,  priceHt: 1075,  tvaRate: 20, stockQuantity: 12, imageUrl: P('mo4'), badges: [],                                         categoryId: 'monitoring', priority: 4 },
    { id: 'mo5', name: 'Moniteur de signes vitaux VitalScan 12',     slug: 'moniteur-vitalscan-12',           priceTtc: 6490,  priceHt: 5408,  tvaRate: 20, stockQuantity: 4,  imageUrl: P('mo5'), badges: [{ type: 'new',   label: 'Nouveau' }],    categoryId: 'monitoring', priority: 5 },
    { id: 'mo6', name: 'Saturomètre de table SatPro Clinic',         slug: 'saturometre-satpro-clinic',       priceTtc: 890,   priceHt: 742,   tvaRate: 20, stockQuantity: 15, imageUrl: P('mo6'), badges: [],                                         categoryId: 'monitoring', priority: 6 },
    { id: 'mo7', name: 'Moniteur fœtal BabyGuard CTG-800',           slug: 'moniteur-foetal-babyguard-ctg',  priceTtc: 4990,  priceHt: 4158,  tvaRate: 20, stockQuantity: 3,  imageUrl: P('mo7'), badges: [],                                         categoryId: 'monitoring', priority: 7 },
    { id: 'mo8', name: 'Centrale de monitoring réseau NurseStation',  slug: 'centrale-monitoring-nursestation', priceTtc: 12990, priceHt: 10825, tvaRate: 20, stockQuantity: 2, imageUrl: P('mo8'), badges: [{ type: 'custom', label: 'Réseau IP' }], categoryId: 'monitoring', priority: 8 },
  ],
  'cardiologie': [
    { id: 'ca1', name: 'Défibrillateur HeartSave AED Pro 3000',      slug: 'defibrillateur-heartsave-aed',    priceTtc: 2290,  priceHt: 1908,  tvaRate: 20, stockQuantity: 12, imageUrl: P('ca1'), badges: [{ type: 'promo', label: 'Best-seller' }],  categoryId: 'cardiologie', priority: 1 },
    { id: 'ca2', name: 'Électrocardiographe 12 dérivations ECG Expert', slug: 'ecg-expert-12-derivations',   priceTtc: 5490,  priceHt: 4575,  tvaRate: 20, stockQuantity: 5,  imageUrl: P('ca2'), badges: [],                                         categoryId: 'cardiologie', priority: 2 },
    { id: 'ca3', name: 'Holter ECG ambulatoire CardioHolter 24H',    slug: 'holter-ecg-cardioHolter-24h',     priceTtc: 3990,  priceHt: 3325,  tvaRate: 20, stockQuantity: 7,  imageUrl: P('ca3'), badges: [{ type: 'new',   label: 'Nouveau' }],    categoryId: 'cardiologie', priority: 3 },
    { id: 'ca4', name: 'MAPA Tensiomètre ambulatoire ABPM-24H',      slug: 'mapa-abpm-24h',                   priceTtc: 1490,  priceHt: 1242,  tvaRate: 20, stockQuantity: 9,  imageUrl: P('ca4'), badges: [],                                         categoryId: 'cardiologie', priority: 4 },
    { id: 'ca5', name: 'Stéthoscope électronique CardioScope Digital', slug: 'stethoscope-cardioscope-digital', priceTtc: 890, priceHt: 742,  tvaRate: 20, stockQuantity: 20, imageUrl: P('ca5'), badges: [],                                         categoryId: 'cardiologie', priority: 5 },
    { id: 'ca6', name: 'Table de stress cardiaque ErgoTest Pro',     slug: 'table-stress-ergotest-pro',       priceTtc: 12990, priceHt: 10825, tvaRate: 20, stockQuantity: 2, imageUrl: P('ca6'), badges: [{ type: 'custom', label: 'Certifié CE' }], categoryId: 'cardiologie', priority: 6 },
  ],
  'chirurgie': [
    { id: 'ch1', name: 'Bistouri électrique ElectroCut Pro 300W',    slug: 'bistouri-electrocut-pro-300w',    priceTtc: 4490,  priceHt: 3742,  tvaRate: 20, stockQuantity: 4,  imageUrl: P('ch1'), badges: [],                                         categoryId: 'chirurgie', priority: 1 },
    { id: 'ch2', name: 'Aspirateur chirurgical VacuSurg Elite',      slug: 'aspirateur-vacusurg-elite',       priceTtc: 2990,  priceHt: 2492,  tvaRate: 20, stockQuantity: 6,  imageUrl: P('ch2'), badges: [],                                         categoryId: 'chirurgie', priority: 2 },
    { id: 'ch3', name: 'Lampe opératoire LED SurgiLight 50000lux',   slug: 'lampe-operatoire-surgilight',     priceTtc: 8900,  priceHt: 7417,  tvaRate: 20, stockQuantity: 3,  imageUrl: P('ch3'), badges: [{ type: 'new',   label: 'Nouveau' }],    categoryId: 'chirurgie', priority: 3 },
    { id: 'ch4', name: 'Table d\'opération motorisée OptiTable 3000', slug: 'table-operation-optitable-3000', priceTtc: 18990, priceHt: 15825, tvaRate: 20, stockQuantity: 1, imageUrl: P('ch4'), badges: [],                                         categoryId: 'chirurgie', priority: 4 },
    { id: 'ch5', name: 'Insufflateur laparoscopie LaparoFlow Pro',   slug: 'insufflateur-laparoflow-pro',     priceTtc: 3290,  priceHt: 2742,  tvaRate: 20, stockQuantity: 5,  imageUrl: P('ch5'), badges: [],                                         categoryId: 'chirurgie', priority: 5 },
    { id: 'ch6', name: 'Système vidéo-endoscopie 4K UltraVis',       slug: 'systeme-video-ultravis-4k',       priceTtc: 14500, priceHt: 12083, tvaRate: 20, stockQuantity: 2,  imageUrl: P('ch6'), badges: [{ type: 'promo', label: 'Best-seller' }],  categoryId: 'chirurgie', priority: 6 },
  ],
  'diagnostic': [
    { id: 'di1', name: 'Otoscope numérique DiagnosticPro HD',        slug: 'otoscope-diagnosticpro-hd',       priceTtc: 890,   priceHt: 742,   tvaRate: 20, stockQuantity: 18, imageUrl: P('di1'), badges: [],                                         categoryId: 'diagnostic', priority: 1 },
    { id: 'di2', name: 'Ophtalmoscope LED OptiView Pro',             slug: 'ophtalmoscope-optiview-pro',      priceTtc: 690,   priceHt: 575,   tvaRate: 20, stockQuantity: 22, imageUrl: P('di2'), badges: [],                                         categoryId: 'diagnostic', priority: 2 },
    { id: 'di3', name: 'Dermatoscope polarisé DermaScan 200x',       slug: 'dermatoscope-dermascan-200x',     priceTtc: 1290,  priceHt: 1075,  tvaRate: 20, stockQuantity: 10, imageUrl: P('di3'), badges: [{ type: 'promo', label: 'Best-seller' }],  categoryId: 'diagnostic', priority: 3 },
    { id: 'di4', name: 'Analyseur urinaire UrineAnalyzer 200',       slug: 'analyseur-urinaire-200',          priceTtc: 3490,  priceHt: 2908,  tvaRate: 20, stockQuantity: 5,  imageUrl: P('di4'), badges: [],                                         categoryId: 'diagnostic', priority: 4 },
    { id: 'di5', name: 'Microscope clinique BioScope X400',          slug: 'microscope-bioscope-x400',        priceTtc: 4990,  priceHt: 4158,  tvaRate: 20, stockQuantity: 3,  imageUrl: P('di5'), badges: [{ type: 'new',   label: 'Nouveau' }],    categoryId: 'diagnostic', priority: 5 },
    { id: 'di6', name: 'Glucomètre professionnel GlucoCheck Lab',    slug: 'glucometre-glucocheck-lab',       priceTtc: 590,   priceHt: 492,   tvaRate: 20, stockQuantity: 25, imageUrl: P('di6'), badges: [],                                         categoryId: 'diagnostic', priority: 6 },
    { id: 'di7', name: 'Spiromètre numérique LungTest 3000',         slug: 'spirometre-lungtest-3000',        priceTtc: 2490,  priceHt: 2075,  tvaRate: 20, stockQuantity: 7,  imageUrl: P('di7'), badges: [],                                         categoryId: 'diagnostic', priority: 7 },
    { id: 'di8', name: 'Analyseur hématologique HemoPro 5-Diff',     slug: 'analyseur-hematologique-hemopro', priceTtc: 9990, priceHt: 8325,  tvaRate: 20, stockQuantity: 2,  imageUrl: P('di8'), badges: [{ type: 'custom', label: 'Certifié ISO' }], categoryId: 'diagnostic', priority: 8 },
  ],
  'ophtalmologie': [
    { id: 'op1', name: 'Lampe à fente SlitLamp Pro 900',             slug: 'lampe-fente-slitlamp-pro-900',    priceTtc: 8490,  priceHt: 7075,  tvaRate: 20, stockQuantity: 3,  imageUrl: P('op1'), badges: [],                                         categoryId: 'ophtalmologie', priority: 1 },
    { id: 'op2', name: 'Tonomètre à air non-contact AirTono 3',      slug: 'tonometre-airtono-3',             priceTtc: 4990,  priceHt: 4158,  tvaRate: 20, stockQuantity: 4,  imageUrl: P('op2'), badges: [{ type: 'promo', label: 'Best-seller' }],  categoryId: 'ophtalmologie', priority: 2 },
    { id: 'op3', name: 'Réfractomètre automatique AutoRef 7000',     slug: 'refractometre-autoref-7000',      priceTtc: 6490,  priceHt: 5408,  tvaRate: 20, stockQuantity: 3,  imageUrl: P('op3'), badges: [],                                         categoryId: 'ophtalmologie', priority: 3 },
    { id: 'op4', name: 'Périmètre visuel VisualField 730',           slug: 'perimetre-visuel-visualfield-730', priceTtc: 12990, priceHt: 10825, tvaRate: 20, stockQuantity: 2, imageUrl: P('op4'), badges: [],                                         categoryId: 'ophtalmologie', priority: 4 },
    { id: 'op5', name: 'OCT rétinien OcularTomograph Elite',         slug: 'oct-retinien-oculartomograph',    priceTtc: 28000, priceHt: 23333, tvaRate: 20, stockQuantity: 1,  imageUrl: P('op5'), badges: [{ type: 'new',   label: 'Nouveau' }],    categoryId: 'ophtalmologie', priority: 5 },
    { id: 'op6', name: 'Photocoagulateur laser OphtoLaser 532nm',    slug: 'photocoagulateur-ophtolaser-532', priceTtc: 18500, priceHt: 15417, tvaRate: 20, stockQuantity: 1, imageUrl: P('op6'), badges: [],                                         categoryId: 'ophtalmologie', priority: 6 },
  ],
  'sterilisation': [
    { id: 'st1', name: 'Autoclave de stérilisation SterilPro 22L',   slug: 'autoclave-sterilpro-22l',         priceTtc: 4190,  priceHt: 3492,  tvaRate: 20, stockQuantity: 4,  imageUrl: P('st1'), badges: [{ type: 'custom', label: 'Certifié CE' }], categoryId: 'sterilisation', priority: 1 },
    { id: 'st2', name: 'Autoclave classe B SteriClass B 34L',        slug: 'autoclave-stericlass-b-34l',      priceTtc: 6990,  priceHt: 5825,  tvaRate: 20, stockQuantity: 3,  imageUrl: P('st2'), badges: [{ type: 'promo', label: 'Best-seller' }],  categoryId: 'sterilisation', priority: 2 },
    { id: 'st3', name: 'Laveur-désinfecteur WashPro Dental 2 paniers', slug: 'laveur-washpro-dental',         priceTtc: 8490,  priceHt: 7075,  tvaRate: 20, stockQuantity: 2,  imageUrl: P('st3'), badges: [],                                         categoryId: 'sterilisation', priority: 3 },
    { id: 'st4', name: 'Scelleur thermique SealPack 350',             slug: 'scelleur-sealpack-350',           priceTtc: 1290,  priceHt: 1075,  tvaRate: 20, stockQuantity: 10, imageUrl: P('st4'), badges: [],                                         categoryId: 'sterilisation', priority: 4 },
    { id: 'st5', name: 'Étuve de séchage stérile DryChamber 50L',    slug: 'etuve-drychamber-50l',            priceTtc: 2490,  priceHt: 2075,  tvaRate: 20, stockQuantity: 6,  imageUrl: P('st5'), badges: [],                                         categoryId: 'sterilisation', priority: 5 },
    { id: 'st6', name: 'Table de décontamination CleanStation Pro',  slug: 'table-decontamination-cleanstation', priceTtc: 1990, priceHt: 1658, tvaRate: 20, stockQuantity: 5, imageUrl: P('st6'), badges: [],                                       categoryId: 'sterilisation', priority: 6 },
  ],
  'mobilier-medical': [
    { id: 'mm1', name: 'Table d\'examen électrique MedLine Elite',   slug: 'table-examen-medline-elite',      priceTtc: 3450,  priceHt: 2875,  tvaRate: 20, stockQuantity: 2,  imageUrl: P('mm1'), badges: [],                                         categoryId: 'mobilier-medical', priority: 1 },
    { id: 'mm2', name: 'Fauteuil de prélèvement PhléboChair Pro',    slug: 'fauteuil-phlebochair-pro',        priceTtc: 2490,  priceHt: 2075,  tvaRate: 20, stockQuantity: 5,  imageUrl: P('mm2'), badges: [{ type: 'promo', label: 'Best-seller' }],  categoryId: 'mobilier-medical', priority: 2 },
    { id: 'mm3', name: 'Chariot de soins MediCart 5 tiroirs',        slug: 'chariot-soins-medicart-5',        priceTtc: 1290,  priceHt: 1075,  tvaRate: 20, stockQuantity: 8,  imageUrl: P('mm3'), badges: [],                                         categoryId: 'mobilier-medical', priority: 3 },
    { id: 'mm4', name: 'Armoire médicale à serrure MediStore 90cm',  slug: 'armoire-medistore-90',            priceTtc: 890,   priceHt: 742,   tvaRate: 20, stockQuantity: 10, imageUrl: P('mm4'), badges: [],                                         categoryId: 'mobilier-medical', priority: 4 },
    { id: 'mm5', name: 'Tabouret ergonomique ErgoSeat Pro à roulettes', slug: 'tabouret-ergoseat-pro',        priceTtc: 490,   priceHt: 408,   tvaRate: 20, stockQuantity: 20, imageUrl: P('mm5'), badges: [],                                         categoryId: 'mobilier-medical', priority: 5 },
    { id: 'mm6', name: 'Paravent médical ScreenMed 3 panneaux',      slug: 'paravent-screenmed-3-panneaux',   priceTtc: 390,   priceHt: 325,   tvaRate: 20, stockQuantity: 15, imageUrl: P('mm6'), badges: [],                                         categoryId: 'mobilier-medical', priority: 6 },
    { id: 'mm7', name: 'Lit médicalisé électrique CareBed Premium',  slug: 'lit-medicalise-carebed-premium',  priceTtc: 4990,  priceHt: 4158,  tvaRate: 20, stockQuantity: 3,  imageUrl: P('mm7'), badges: [{ type: 'new',   label: 'Nouveau' }],    categoryId: 'mobilier-medical', priority: 7 },
    { id: 'mm8', name: 'Colonne de douche médicale HygieneFlow',     slug: 'colonne-douche-hygieneflow',      priceTtc: 1890,  priceHt: 1575,  tvaRate: 20, stockQuantity: 4,  imageUrl: P('mm8'), badges: [],                                         categoryId: 'mobilier-medical', priority: 8 },
  ],
};

// Fallback categories for when the API can't find the slug
const FALLBACK_CATEGORY_NAMES: Record<string, string> = {
  'imagerie-medicale':  'Imagerie médicale',
  'monitoring':         'Monitoring & Surveillance',
  'cardiologie':        'Cardiologie',
  'chirurgie':          'Chirurgie & Blocs',
  'diagnostic':         'Diagnostic clinique',
  'ophtalmologie':      'Ophtalmologie',
  'sterilisation':      'Stérilisation',
  'mobilier-medical':   'Mobilier médical',
};

// ── Gradient palette for products without images ───────────────────────────
const PRODUCT_GRADIENTS = [
  'linear-gradient(135deg,#0094A0,#00A8B5)',
  'linear-gradient(135deg,#003D5C,#003D5C)',
  'linear-gradient(135deg,#0094A0,#0094A0)',
  'linear-gradient(135deg,#003D5C,#003D5C)',
  'linear-gradient(135deg,#2D3A3A,#3D5A5B)',
  'linear-gradient(135deg,#00A8B5,#33BFC9)',
  'linear-gradient(135deg,#004D74,#004D74)',
  'linear-gradient(135deg,#0094A0,#00A8B5)',
];

// ── Product Card ──────────────────────────────────────────────────────────
@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  template: `
    <a [routerLink]="['/produits', product.slug]" class="card-hover group flex flex-col h-full">
      <!-- Image area -->
      <div class="relative overflow-hidden rounded-t-xl bg-gray-50" style="aspect-ratio:1;">
        @if (product.imageUrl) {
          <img [src]="product.imageUrl" [alt]="product.name"
            loading="lazy"
            class="w-full h-full object-contain p-5 transition-transform duration-300 group-hover:scale-105" />
        } @else {
          <!-- Gradient placeholder with medical cross -->
          <div class="absolute inset-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
            [style.background]="gradient">
            <svg class="w-14 h-14 text-white opacity-[0.18]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H14V0H10V3H5C3.9 3 3 3.9 3 5V10H0V14H3V19C3 20.1 3.9 21 5 21H10V24H14V21H19C20.1 21 21 20.1 21 19V14H24V10H21V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z"/>
            </svg>
          </div>
        }

        <!-- Badges -->
        @if (product.badges?.length) {
          <div class="absolute top-2.5 left-2.5 flex flex-col gap-1">
            @for (b of product.badges!; track b.label) {
              <span class="badge badge-promo">{{ b.label }}</span>
            }
          </div>
        }

        <!-- Stock overlay -->
        @if (product.stockQuantity === 0) {
          <div class="absolute inset-0 bg-white/80 flex items-center justify-center">
            <span class="badge badge-danger">{{ 'catalog.stock_out' | translate }}</span>
          </div>
        } @else if (product.stockQuantity <= 5) {
          <span class="absolute top-2.5 right-2.5 badge badge-warning">{{ 'catalog.stock_limited' | translate }}</span>
        }
      </div>

      <!-- Info -->
      <div class="p-4 flex-1 flex flex-col">
        <p class="font-semibold text-gray-900 text-sm leading-snug mb-auto line-clamp-2
                   group-hover:text-primary transition-colors">
          {{ product.name }}
        </p>
        <div class="mt-3 pt-3 border-t border-gray-50 flex items-end justify-between gap-2">
          <div>
            <p class="text-primary font-bold">
              {{ product.priceTtc | number:'1.2-2' }} €
              <span class="text-xs font-normal text-gray-400 ml-0.5">TTC</span>
            </p>
            <p class="text-gray-400 text-xs">{{ product.priceHt | number:'1.2-2' }} € HT</p>
          </div>
          <!-- Quick-view arrow -->
          <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                      opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0"
            class="bg-primary/10">
            <svg class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </div>
        </div>
      </div>
    </a>
  `,
})
export class ProductCardComponent {
  @Input({ required: true }) product!: ProductListItem;
  @Input() index: number = 0;

  get gradient(): string {
    return PRODUCT_GRADIENTS[this.index % PRODUCT_GRADIENTS.length];
  }
}

// ── Catalog Page ──────────────────────────────────────────────────────────
@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent, TranslatePipe],
  template: `
    <div class="page-container py-8 md:py-12">

      <!-- Category banner -->
      @if (category()) {
        <div class="relative rounded-2xl overflow-hidden mb-10"
          style="height: 220px;">
          @if (category()!.imageUrl) {
            <img [src]="category()!.imageUrl" [alt]="category()!.name"
              class="w-full h-full object-cover" />
            <div class="absolute inset-0" style="background: linear-gradient(90deg, rgba(17,30,53,0.85) 0%, rgba(17,30,53,0.35) 70%, transparent 100%);"></div>
          } @else {
            <!-- Gradient banner -->
            <div class="absolute inset-0 gradient-brand">
              <div class="absolute inset-0" style="background-image: url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22%3E%3Crect x=%2227%22 y=%225%22 width=%226%22 height=%2250%22 rx=%223%22 fill=%22white%22 opacity=%22.05%22/%3E%3Crect x=%225%22 y=%2227%22 width=%2250%22 height=%226%22 rx=%223%22 fill=%22white%22 opacity=%22.05%22/%3E%3C/svg%3E'); background-size: 60px 60px;"></div>
            </div>
          }
          <div class="absolute inset-0 flex flex-col justify-center px-8 md:px-12">
            <!-- Breadcrumb -->
            <nav class="flex items-center gap-1.5 text-xs text-white/50 mb-3" [attr.aria-label]="'catalog.breadcrumb_home' | translate">
              <a routerLink="/" class="hover:text-white/80 transition-colors">{{ 'catalog.breadcrumb_home' | translate }}</a>
              <span aria-hidden="true">/</span>
              <span class="text-white/80" aria-current="page">{{ category()!.name }}</span>
            </nav>
            <h1 class="font-display font-semibold text-3xl md:text-4xl text-white mb-2">
              {{ category()!.name }}
            </h1>
            @if (category()!.description) {
              <p class="text-white/60 text-sm max-w-lg">{{ category()!.description }}</p>
            }
          </div>
        </div>
      }

      <!-- Toolbar -->
      <div class="flex items-center justify-between mb-6 gap-4">
        <p class="text-sm text-gray-500">
          <span class="font-semibold text-gray-900">{{ totalCount() }}</span>
          {{ totalCount() !== 1 ? ('catalog.products_count_plural' | translate) : ('catalog.products_count_singular' | translate) }}
        </p>
        <div class="flex items-center gap-2">
          <label class="text-xs text-gray-500 hidden sm:block">{{ 'catalog.sort_by' | translate }}</label>
          <select (change)="changeSort($event)"
            class="input-field w-auto py-2 text-sm bg-white cursor-pointer">
            <option value="priority-asc">{{ 'catalog.sort_default' | translate }}</option>
            <option value="price-asc">{{ 'catalog.sort_price_asc' | translate }}</option>
            <option value="price-desc">{{ 'catalog.sort_price_desc' | translate }}</option>
            <option value="name-asc">{{ 'catalog.sort_name_asc' | translate }}</option>
            <option value="createdAt-desc">{{ 'catalog.sort_newest' | translate }}</option>
          </select>
        </div>
      </div>

      <!-- Product grid -->
      @if (loading()) {
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          @for (_ of [1,2,3,4,5,6,7,8]; track $index) {
            <div class="card flex flex-col">
              <div class="skeleton rounded-t-xl" style="aspect-ratio:1;"></div>
              <div class="p-4 space-y-2">
                <div class="skeleton h-3.5 w-full"></div>
                <div class="skeleton h-3.5 w-3/4"></div>
                <div class="skeleton h-5 w-1/2 mt-3"></div>
              </div>
            </div>
          }
        </div>
      } @else if (products().length === 0) {
        <div class="text-center py-24">
          <div class="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center bg-primary-50">
            <svg class="w-8 h-8 text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>
          <p class="font-semibold text-gray-700 mb-1">{{ 'catalog.no_products' | translate }}</p>
          <p class="text-sm text-gray-400">{{ 'catalog.no_products_desc' | translate }}</p>
        </div>
      } @else {
        <!-- Desktop grid -->
        <div class="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          @for (product of products(); track product.id; let i = $index) {
            <app-product-card [product]="product" [index]="i" />
          }
        </div>

        <!-- Mobile list -->
        <div class="sm:hidden space-y-3">
          @for (product of products(); track product.id; let i = $index) {
            <a [routerLink]="['/produits', product.slug]" class="card flex gap-4 p-3 hover:shadow-card-hover transition-shadow">
              <!-- Thumbnail -->
              <div class="w-20 h-20 rounded-xl flex-shrink-0 overflow-hidden"
                [style.background]="product.imageUrl ? '' : getGradient(i)">
                @if (product.imageUrl) {
                  <img [src]="product.imageUrl" [alt]="product.name"
                    loading="lazy"
                    class="w-full h-full object-contain p-2" />
                } @else {
                  <div class="w-full h-full flex items-center justify-center">
                    <svg class="w-7 h-7 text-white opacity-25" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3H14V0H10V3H5C3.9 3 3 3.9 3 5V10H0V14H3V19C3 20.1 3.9 21 5 21H10V24H14V21H19C20.1 21 21 20.1 21 19V14H24V10H21V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z"/>
                    </svg>
                  </div>
                }
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-sm text-gray-900 line-clamp-2 mb-1.5">{{ product.name }}</h3>
                <p class="text-primary font-bold text-sm">{{ product.priceTtc | number:'1.2-2' }} € TTC</p>
                <p class="text-gray-400 text-xs">{{ product.priceHt | number:'1.2-2' }} € HT</p>
                @if (product.stockQuantity === 0) {
                  <span class="badge badge-danger text-xs mt-1.5">{{ 'catalog.stock_out' | translate }}</span>
                } @else if (product.stockQuantity <= 5) {
                  <span class="badge badge-warning text-xs mt-1.5">{{ 'catalog.stock_limited' | translate }}</span>
                }
              </div>
              <div class="flex items-center self-center">
                <svg class="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            </a>
          }
        </div>
      }

      <!-- Pagination -->
      @if (totalPages() > 1) {
        <div class="flex items-center justify-center gap-1.5 mt-12">
          <button [disabled]="page() === 1" (click)="changePage(page() - 1)"
            [attr.aria-label]="'catalog.prev_page' | translate"
            class="w-9 h-9 rounded-lg flex items-center justify-center btn-ghost disabled:opacity-40">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          @for (p of pageNumbers(); track p) {
            <button (click)="changePage(p)"
              [attr.aria-current]="p === page() ? 'page' : null"
              class="w-9 h-9 rounded-lg text-sm font-medium transition-all"
              [class.bg-primary]="p === page()"
              [class.text-white]="p === page()"
              [class.text-gray-700]="p !== page()"
              [class.hover:bg-gray-100]="p !== page()">
              {{ p }}
            </button>
          }
          <button [disabled]="page() === totalPages()" (click)="changePage(page() + 1)"
            [attr.aria-label]="'catalog.next_page' | translate"
            class="w-9 h-9 rounded-lg flex items-center justify-center btn-ghost disabled:opacity-40">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      }
    </div>
  `,
})
export class CatalogComponent implements OnInit {
  private route       = inject(ActivatedRoute);
  private productSvc  = inject(ProductService);
  private categorySvc = inject(CategoryService);

  category      = signal<Category | null>(null);
  products      = signal<ProductListItem[]>([]);
  loading       = signal(true);
  page          = signal(1);
  pageSize      = 12;
  totalCount    = signal(0);
  categorySlug  = '';

  totalPages  = computed(() => Math.ceil(this.totalCount() / this.pageSize));
  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.page();
    return Array.from({ length: total }, (_, i) => i + 1)
      .slice(Math.max(0, current - 3), Math.min(total, current + 2));
  });

  sortBy:  string = 'priority';
  sortDir: 'asc' | 'desc' = 'asc';

  ngOnInit() {
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      this.categorySlug = slug;
      this.categorySvc.getBySlug(slug).subscribe({
        next: (cat: Category) => { this.category.set(cat); this.loadProducts(cat.id); },
        error: () => {
          // Fallback: build a minimal category from the slug
          const name = FALLBACK_CATEGORY_NAMES[slug] ?? slug;
          this.category.set({ id: slug, name, description: '', imageUrl: '', slug, displayOrder: 0, status: 'Active' });
          this.useExampleProducts();
        }
      });
    });
  }

  loadProducts(categoryId: string) {
    this.loading.set(true);
    this.productSvc.search({
      categoryId,
      sortBy:     this.sortBy as any,
      sortDir:    this.sortDir,
      pageNumber: this.page(),
      pageSize:   this.pageSize,
    }).subscribe({
      next: (res: any) => {
        const data: ProductListItem[] = res.data ?? [];
        if (data.length === 0) { this.useExampleProducts(); return; }
        const sorted = [...data].sort((a: ProductListItem, b: ProductListItem) => {
          if (a.stockQuantity === 0 && b.stockQuantity > 0) return 1;
          if (a.stockQuantity > 0 && b.stockQuantity === 0) return -1;
          return (a.priority ?? 99) - (b.priority ?? 99);
        });
        this.products.set(sorted);
        this.totalCount.set(res.pagination?.totalCount ?? res.total ?? data.length);
        this.loading.set(false);
      },
      error: () => this.useExampleProducts()
    });
  }

  changeSort(event: Event) {
    const [sortBy, sortDir] = (event.target as HTMLSelectElement).value.split('-');
    this.sortBy  = sortBy;
    this.sortDir = sortDir as 'asc' | 'desc';
    this.page.set(1);
    if (this.category()) this.loadProducts(this.category()!.id);
  }

  changePage(p: number) {
    this.page.set(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (this.category()) this.loadProducts(this.category()!.id);
  }

  private useExampleProducts(): void {
    const examples = EXAMPLE_PRODUCTS_BY_SLUG[this.categorySlug] ?? [];
    this.products.set(examples);
    this.totalCount.set(examples.length);
    this.loading.set(false);
  }

  getGradient(index: number): string {
    return PRODUCT_GRADIENTS[index % PRODUCT_GRADIENTS.length];
  }
}
