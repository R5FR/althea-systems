import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { HomepageConfig } from '../../../core/models';

@Component({
  selector: 'app-homepage-config',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6 max-w-4xl">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">Page d'accueil</h1>
        <button (click)="save()" [disabled]="saving()" class="btn-primary">
          @if (saving()) { <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> }
          Enregistrer
        </button>
      </div>

      @if (saveSuccess()) {
        <p class="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-2 flex items-center gap-2">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          Configuration sauvegardée
        </p>
      }
      @if (error()) { <p class="text-sm text-red-500">{{ error() }}</p> }

      @if (loading()) {
        <div class="space-y-4">@for (_ of [1,2,3]; track $index) { <div class="card p-6 skeleton h-40"></div> }</div>
      } @else {
        <form [formGroup]="form" class="space-y-6">
          <!-- Carousel slides -->
          <div class="card p-6 space-y-5">
            <div class="flex items-center justify-between">
              <h2 class="font-semibold text-gray-900">Diaporama (carousel)</h2>
              <button type="button" (click)="addSlide()" class="btn-ghost text-sm">+ Ajouter une slide</button>
            </div>
            <div formArrayName="carouselSlides" class="space-y-4">
              @for (slide of slidesArray.controls; track $index) {
                <div [formGroupName]="$index" class="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-medium text-gray-700">Slide {{ $index + 1 }}</p>
                    <button type="button" (click)="removeSlide($index)"
                      class="text-red-400 hover:text-red-600 text-xs btn-ghost px-2 py-1">Supprimer</button>
                  </div>
                  <div class="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-medium text-gray-600 mb-1">Titre *</label>
                      <input formControlName="title" class="input-field text-sm" />
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-600 mb-1">Sous-titre</label>
                      <input formControlName="subtitle" class="input-field text-sm" />
                    </div>
                    <div class="sm:col-span-2">
                      <label class="block text-xs font-medium text-gray-600 mb-1">Image (URL) *</label>
                      <input formControlName="imageUrl" class="input-field text-sm font-mono" placeholder="https://..." />
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-600 mb-1">Lien CTA</label>
                      <input formControlName="ctaLink" class="input-field text-sm" placeholder="/catalogue/cardiologie" />
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-600 mb-1">Texte du bouton</label>
                      <input formControlName="ctaText" class="input-field text-sm" placeholder="Découvrir" />
                    </div>
                  </div>
                  @if (slide.value.imageUrl) {
                    <div class="rounded-lg overflow-hidden h-32 bg-gray-200">
                      <img [src]="slide.value.imageUrl" class="w-full h-full object-cover" />
                    </div>
                  }
                </div>
              }
              @if (slidesArray.length === 0) {
                <p class="text-sm text-gray-400 text-center py-4">Aucune slide. Cliquez sur "+ Ajouter une slide".</p>
              }
            </div>
          </div>

          <!-- Featured text -->
          <div class="card p-6 space-y-4">
            <h2 class="font-semibold text-gray-900">Section texte mis en avant</h2>
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Titre</label>
                <input formControlName="featuredTitle" class="input-field" placeholder="Notre expertise à votre service" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Texte</label>
                <textarea formControlName="featuredText" rows="3" class="input-field resize-none"></textarea>
              </div>
            </div>
          </div>

          <!-- Top products -->
          <div class="card p-6 space-y-4">
            <h2 class="font-semibold text-gray-900">Produits mis en avant (IDs)</h2>
            <p class="text-xs text-gray-500">Saisissez les IDs des produits à afficher en page d'accueil, séparés par des virgules.</p>
            <input formControlName="featuredProductIds" class="input-field font-mono text-sm"
              placeholder="uuid-1, uuid-2, uuid-3" />
          </div>

          <!-- Category order -->
          <div class="card p-6 space-y-4">
            <h2 class="font-semibold text-gray-900">Ordre des catégories (IDs)</h2>
            <p class="text-xs text-gray-500">Définissez l'ordre d'affichage des catégories sur la page d'accueil.</p>
            <input formControlName="featuredCategoryIds" class="input-field font-mono text-sm"
              placeholder="cat-uuid-1, cat-uuid-2" />
          </div>
        </form>
      }
    </div>
  `,
})
export class HomepageConfigComponent implements OnInit {
  private fb = inject(FormBuilder);
  private adminSvc = inject(AdminService);

  loading = signal(true);
  saving = signal(false);
  saveSuccess = signal(false);
  error = signal('');

  form = this.fb.group({
    carouselSlides: this.fb.array([]),
    featuredTitle: [''],
    featuredText: [''],
    featuredProductIds: [''],
    featuredCategoryIds: [''],
  });

  get slidesArray() { return this.form.get('carouselSlides') as FormArray; }

  ngOnInit() {
    this.adminSvc.getHomepageConfig().subscribe({
      next: (cfg: HomepageConfig) => {
        (cfg.carouselSlides ?? []).forEach(s => this.slidesArray.push(this.makeSlideGroup(s)));
        this.form.patchValue({
          featuredTitle: cfg.featuredTitle ?? '',
          featuredText: cfg.featuredText ?? '',
          featuredProductIds: (cfg.featuredProductIds ?? []).join(', '),
          featuredCategoryIds: (cfg.featuredCategoryIds ?? []).join(', '),
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  makeSlideGroup(s: any = {}) {
    return this.fb.group({
      title: [s.title ?? '', Validators.required],
      subtitle: [s.subtitle ?? ''],
      imageUrl: [s.imageUrl ?? '', Validators.required],
      ctaLink: [s.ctaLink ?? ''],
      ctaText: [s.ctaText ?? ''],
    });
  }

  addSlide() { this.slidesArray.push(this.makeSlideGroup()); }
  removeSlide(i: number) { this.slidesArray.removeAt(i); }

  save() {
    this.saving.set(true); this.error.set(''); this.saveSuccess.set(false);
    const v = this.form.value as any;
    const payload: HomepageConfig = {
      carouselSlides: v.carouselSlides,
      featuredTitle: v.featuredTitle,
      featuredText: v.featuredText,
      featuredProductIds: v.featuredProductIds ? v.featuredProductIds.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      featuredCategoryIds: v.featuredCategoryIds ? v.featuredCategoryIds.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
    };
    this.adminSvc.updateHomepageConfig(payload).subscribe({
      next: () => {
        this.saveSuccess.set(true);
        this.saving.set(false);
        setTimeout(() => this.saveSuccess.set(false), 3000);
      },
      error: err => { this.error.set(err?.error?.error || 'Erreur lors de l\'enregistrement.'); this.saving.set(false); }
    });
  }
}
